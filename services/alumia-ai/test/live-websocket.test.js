import assert from "node:assert/strict";
import { createServer } from "node:http";
import { afterEach, describe, it } from "node:test";
import { WebSocket } from "ws";
import { attachLiveWebSocketServer } from "../src/live-websocket.js";

const servers = [];

afterEach(() => {
  for (const { server, websocketServer } of servers.splice(0)) {
    for (const client of websocketServer.clients) client.terminate();
    websocketServer.close();
    server.closeAllConnections();
    server.close();
  }
});

async function createTestServer(overrides = {}) {
  const server = createServer((_request, response) => response.end("ok"));
  const sentAudio = [];
  let resolveAudio;
  const audioReceived = new Promise((resolve) => { resolveAudio = resolve; });
  const websocketServer = attachLiveWebSocketServer({
    server,
    authorize: async (token) => token === "valid-token" ? { id: "user-1" } : null,
    connectLive: async ({ onMessage }) => {
      queueMicrotask(() => onMessage({ setupComplete: { sessionId: "session-1" } }));
      return {
        sendRealtimeInput: (message) => {
          sentAudio.push(message);
          if (message.audio) resolveAudio(message);
        },
        close: () => {},
      };
    },
    allowedOrigins: new Set(["https://localhost"]),
    enabled: true,
    sessionMaxMs: 60_000,
    ...overrides,
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  servers.push({ server, websocketServer });
  return { server, sentAudio, audioReceived };
}

function createMessageReader(socket) {
  const queued = [];
  const waiting = [];
  socket.on("message", (data) => {
    const message = JSON.parse(data.toString());
    const resolve = waiting.shift();
    if (resolve) resolve(message);
    else queued.push(message);
  });
  return () => queued.length ? Promise.resolve(queued.shift()) : new Promise((resolve) => waiting.push(resolve));
}

describe("live voice websocket", () => {
  it("autentica antes de abrir a sessão e encaminha PCM para o modelo", { timeout: 3_000 }, async () => {
    const { server, sentAudio, audioReceived } = await createTestServer();
    const address = server.address();
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/v1/live`, { origin: "https://localhost" });
    const nextMessage = createMessageReader(socket);
    await new Promise((resolve) => socket.once("open", resolve));

    socket.send(JSON.stringify({ type: "auth", token: "valid-token" }));
    assert.deepEqual(await nextMessage(), { type: "status", status: "connecting" });
    assert.deepEqual(await nextMessage(), { type: "status", status: "listening" });

    socket.send(JSON.stringify({ type: "audio", data: "AQI=" }));
    await audioReceived;
    assert.deepEqual(sentAudio[0], { audio: { data: "AQI=", mimeType: "audio/pcm;rate=16000" } });
    await new Promise((resolve) => {
      socket.once("close", resolve);
      socket.close();
    });
  });

  it("recusa uma sessão sem JWT válido", { timeout: 3_000 }, async () => {
    const { server } = await createTestServer();
    const address = server.address();
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/v1/live`, { origin: "https://localhost" });
    await new Promise((resolve) => socket.once("open", resolve));
    socket.send(JSON.stringify({ type: "auth", token: "invalid" }));
    const close = await new Promise((resolve) => socket.once("close", (code, reason) => resolve({ code, reason: reason.toString() })));
    assert.deepEqual(close, { code: 4401, reason: "Invalid session" });
  });

  it("uma nova conexão autenticada substitui a sessão anterior da mesma conta", { timeout: 3_000 }, async () => {
    const { server } = await createTestServer();
    const address = server.address();
    const first = new WebSocket(`ws://127.0.0.1:${address.port}/v1/live`, { origin: "https://localhost" });
    await new Promise((resolve) => first.once("open", resolve));
    first.send(JSON.stringify({ type: "auth", token: "valid-token" }));
    await new Promise((resolve) => first.once("message", resolve));

    const firstClosed = new Promise((resolve) => first.once("close", (code) => resolve(code)));
    const second = new WebSocket(`ws://127.0.0.1:${address.port}/v1/live`, { origin: "https://localhost" });
    await new Promise((resolve) => second.once("open", resolve));
    second.send(JSON.stringify({ type: "auth", token: "valid-token" }));

    assert.equal(await firstClosed, 4001);
    assert.equal(second.readyState, WebSocket.OPEN);
    second.close();
  });

  it("bloqueia origens não autorizadas antes do upgrade", { timeout: 3_000 }, async () => {
    const { server } = await createTestServer();
    const address = server.address();
    const socket = new WebSocket(`ws://127.0.0.1:${address.port}/v1/live`, { origin: "https://evil.example" });
    const error = await new Promise((resolve) => socket.once("unexpected-response", (_request, response) => {
      response.resume();
      resolve(response.statusCode);
    }));
    assert.equal(error, 403);
  });
});
