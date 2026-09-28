import crypto from "node:crypto";
import { WebSocket, WebSocketServer } from "ws";

const AUTH_TIMEOUT_MS = 10_000;
const MAX_CLIENT_MESSAGE_BYTES = 48_000;

function send(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload));
}

function closeWith(socket, code, reason) {
  if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
    socket.close(code, reason);
  }
}

function rejectUpgrade(socket, status, message) {
  socket.write(`HTTP/1.1 ${status}\r\nConnection: close\r\nContent-Type: text/plain\r\nContent-Length: ${Buffer.byteLength(message)}\r\n\r\n${message}`);
  socket.destroy();
}

function transcriptText(value) {
  return typeof value?.text === "string" ? value.text : "";
}

export function attachLiveWebSocketServer({
  server,
  authorize,
  connectLive,
  allowedOrigins,
  enabled,
  sessionMaxMs,
}) {
  const websocketServer = new WebSocketServer({ noServer: true, maxPayload: MAX_CLIENT_MESSAGE_BYTES });
  const activeUsers = new Map();

  server.on("upgrade", (request, socket, head) => {
    const pathname = new URL(request.url || "/", "http://localhost").pathname;
    if (pathname !== "/v1/live") return;
    if (!enabled) {
      rejectUpgrade(socket, "503 Service Unavailable", "Live voice disabled");
      return;
    }
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.has(origin)) {
      rejectUpgrade(socket, "403 Forbidden", "Origin not allowed");
      return;
    }
    websocketServer.handleUpgrade(request, socket, head, (client) => {
      websocketServer.emit("connection", client, request);
    });
  });

  websocketServer.on("connection", (socket) => {
    const requestId = crypto.randomUUID();
    const startedAt = performance.now();
    let userId = null;
    let session = null;
    let modelReady = false;
    let ended = false;

    const authTimer = setTimeout(() => closeWith(socket, 4401, "Authentication required"), AUTH_TIMEOUT_MS);
    const sessionTimer = setTimeout(() => {
      send(socket, { type: "limit", reason: "session_time" });
      closeWith(socket, 4000, "Session time limit");
    }, sessionMaxMs);

    const cleanup = () => {
      if (ended) return;
      ended = true;
      clearTimeout(authTimer);
      clearTimeout(sessionTimer);
      try { session?.sendRealtimeInput({ audioStreamEnd: true }); } catch { /* Session already closed. */ }
      try { session?.close(); } catch { /* Session already closed. */ }
      if (userId && activeUsers.get(userId) === socket) activeUsers.delete(userId);
      console.info(JSON.stringify({
        event: "alumia_live_session",
        requestId,
        userHash: userId ? crypto.createHash("sha256").update(userId).digest("hex").slice(0, 12) : null,
        durationMs: Math.round(performance.now() - startedAt),
      }));
    };

    socket.once("close", cleanup);
    socket.once("error", cleanup);

    socket.on("message", async (raw, isBinary) => {
      if (isBinary || raw.length > MAX_CLIENT_MESSAGE_BYTES) {
        closeWith(socket, 4400, "Invalid message");
        return;
      }

      let message;
      try { message = JSON.parse(raw.toString()); } catch {
        closeWith(socket, 4400, "Invalid JSON");
        return;
      }

      if (!userId) {
        if (message?.type !== "auth" || typeof message.token !== "string") {
          closeWith(socket, 4401, "Authentication required");
          return;
        }
        clearTimeout(authTimer);
        const user = await authorize(message.token).catch(() => null);
        if (!user) {
          closeWith(socket, 4401, "Invalid session");
          return;
        }
        if (activeUsers.has(user.id)) {
          closeWith(socket, 4429, "Live session already active");
          return;
        }

        userId = user.id;
        activeUsers.set(userId, socket);
        send(socket, { type: "status", status: "connecting" });
        try {
          const connectedSession = await connectLive({
            onMessage: (event) => {
              if (event.setupComplete) {
                modelReady = true;
                if (session) send(socket, { type: "status", status: "listening" });
              }
              if (event.data) {
                send(socket, { type: "status", status: "speaking" });
                send(socket, { type: "audio", data: event.data, sampleRate: 24_000 });
              }
              const content = event.serverContent;
              if (content?.interrupted) send(socket, { type: "interrupted" });
              const input = transcriptText(content?.inputTranscription) || transcriptText(content?.interimInputTranscription);
              if (input) send(socket, { type: "transcript", role: "user", text: input, final: Boolean(content?.inputTranscription) });
              const output = transcriptText(content?.outputTranscription);
              if (output) send(socket, { type: "transcript", role: "assistant", text: output, final: Boolean(content?.turnComplete) });
              if (content?.turnComplete || content?.waitingForInput) send(socket, { type: "status", status: "listening" });
            },
            onError: () => {
              send(socket, { type: "error", code: "MODEL_CONNECTION_ERROR" });
              closeWith(socket, 1011, "Model connection error");
            },
            onClose: () => closeWith(socket, 1011, "Model connection closed"),
          });
          session = connectedSession;
          if (modelReady) send(socket, { type: "status", status: "listening" });
        } catch {
          send(socket, { type: "error", code: "LIVE_UNAVAILABLE" });
          closeWith(socket, 1011, "Live unavailable");
        }
        return;
      }

      if (!session) return;
      if (message?.type === "audio" && typeof message.data === "string") {
        session.sendRealtimeInput({ audio: { data: message.data, mimeType: "audio/pcm;rate=16000" } });
      } else if (message?.type === "stop") {
        cleanup();
        closeWith(socket, 1000, "Session ended");
      } else {
        closeWith(socket, 4400, "Invalid message");
      }
    });
  });

  return websocketServer;
}
