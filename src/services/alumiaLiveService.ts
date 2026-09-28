import { supabase } from "@/lib/supabaseClient";

export type AlumiaLiveStatus = "connecting" | "listening" | "speaking";

export type AlumiaLiveServerEvent =
  | { type: "status"; status: AlumiaLiveStatus }
  | { type: "audio"; data: string; sampleRate?: number }
  | { type: "transcript"; role: "user" | "assistant"; text: string; final?: boolean }
  | { type: "interrupted" }
  | { type: "limit"; reason: string }
  | { type: "error"; code: string };

type AlumiaLiveConnectionOptions = {
  onEvent: (event: AlumiaLiveServerEvent) => void;
  onClose: (event: CloseEvent) => void;
  onError: () => void;
};

function serviceUrl() {
  return import.meta.env.VITE_ALUMIA_AI_URL?.trim().replace(/\/$/, "") || null;
}

export function isAlumiaLiveEnabled() {
  const explicitlyEnabled = import.meta.env.VITE_ENABLE_ALUMIA_LIVE_VOICE === "true";
  const internalPreviewDefault = import.meta.env.VITE_ENABLE_ALUMIA_LIVE_VOICE === undefined
    && import.meta.env.VITE_ENABLE_ALUMIA_AI_GENERATIVE === "true";
  return (explicitlyEnabled || internalPreviewDefault) && Boolean(serviceUrl());
}

function websocketUrl() {
  const url = serviceUrl();
  if (!url) throw new Error("ALUMIA_LIVE_DISABLED");
  const parsed = new URL(url);
  parsed.protocol = parsed.protocol === "https:" ? "wss:" : "ws:";
  parsed.pathname = `${parsed.pathname.replace(/\/$/, "")}/v1/live`;
  parsed.search = "";
  parsed.hash = "";
  return parsed.toString();
}

export async function connectAlumiaLive(options: AlumiaLiveConnectionOptions) {
  const { data, error } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (error || !token) throw new Error("ALUMIA_SESSION_UNAVAILABLE");

  const socket = new WebSocket(websocketUrl());
  socket.addEventListener("open", () => socket.send(JSON.stringify({ type: "auth", token })), { once: true });
  socket.addEventListener("message", (message) => {
    try {
      const event = JSON.parse(String(message.data)) as AlumiaLiveServerEvent;
      options.onEvent(event);
    } catch {
      options.onError();
    }
  });
  socket.addEventListener("close", options.onClose);
  socket.addEventListener("error", options.onError);

  return {
    sendAudio(data: string) {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "audio", data }));
    },
    stop() {
      if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: "stop" }));
      else socket.close();
    },
  };
}
