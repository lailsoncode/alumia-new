import crypto from "node:crypto";
import express from "express";
import { CRISIS_RESPONSE, hasPossibleCrisisSignal } from "./safety.js";

const MAX_MESSAGE_LENGTH = 1_200;
const MAX_HISTORY_ITEMS = 8;

function parseBearer(header) {
  const match = header?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function parseChatBody(body) {
  if (!body || typeof body.message !== "string") return null;
  const message = body.message.trim();
  if (!message || message.length > MAX_MESSAGE_LENGTH) return null;

  const rawHistory = body.history ?? [];
  if (!Array.isArray(rawHistory) || rawHistory.length > MAX_HISTORY_ITEMS) return null;
  const history = [];
  for (const item of rawHistory) {
    if (!item || !["user", "assistant"].includes(item.role) || typeof item.text !== "string") return null;
    const text = item.text.trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH) return null;
    history.push({ role: item.role, text });
  }

  const localDate = body.context?.localDate;
  const timeZone = body.context?.timeZone;
  if (typeof localDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(localDate)) return null;
  if (typeof timeZone !== "string" || !/^[A-Za-z0-9_+\-/]{1,64}$/.test(timeZone)) return null;

  return { message, history, context: { localDate, timeZone } };
}

export function createApp({ authorize, generate, readMemories = async () => [], writeMemory = async () => {}, allowedOrigins = new Set(), checkRateLimit = () => ({ allowed: true }) }) {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "16kb" }));

  app.use((request, response, next) => {
    const origin = request.get("origin");
    if (origin && !allowedOrigins.has(origin)) {
      response.status(403).json({ error: "ORIGIN_NOT_ALLOWED" });
      return;
    }
    if (origin) response.set("Access-Control-Allow-Origin", origin);
    response.set("Vary", "Origin");
    response.set("Access-Control-Allow-Headers", "authorization, content-type");
    response.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    if (request.method === "OPTIONS") {
      response.status(204).end();
      return;
    }
    next();
  });

  app.get("/health", (_request, response) => {
    response.json({ status: "ok", service: "alumia-ai" });
  });

  app.post("/v1/chat", async (request, response) => {
    const requestId = crypto.randomUUID();
    const startedAt = performance.now();
    try {
      const token = parseBearer(request.get("authorization"));
      if (!token) {
        response.status(401).json({ error: "UNAUTHENTICATED", requestId });
        return;
      }
      const user = await authorize(token);
      if (!user) {
        response.status(401).json({ error: "INVALID_SESSION", requestId });
        return;
      }

      const input = parseChatBody(request.body);
      if (!input) {
        response.status(400).json({ error: "INVALID_REQUEST", requestId });
        return;
      }

      if (hasPossibleCrisisSignal(input.message)) {
        response.json({ mode: "safety", message: CRISIS_RESPONSE, requestId });
        return;
      }

      const rateLimit = checkRateLimit(user.id);
      if (!rateLimit.allowed) {
        response.set("Retry-After", String(rateLimit.retryAfterSeconds));
        response.status(429).json({ error: "RATE_LIMITED", requestId });
        return;
      }

      // The authenticated preference is authoritative, never a client-supplied flag.
      if (user.contextEnabled !== true) input.history = [];
      input.memoryEnabled = user.memoryEnabled === true;
      input.memories = input.memoryEnabled ? await readMemories({ token, userId: user.id }) : [];
      const result = await generate(input);
      if (result.kind === "memory_proposal" && input.memoryEnabled) {
        await writeMemory({ token, userId: user.id, content: result.memorySuggestion.content });
        response.json({ mode: "memory_learned", message: `Vou lembrar que ${result.memorySuggestion.content.charAt(0).toLocaleLowerCase("pt-BR")}${result.memorySuggestion.content.slice(1)}.`, learnedMemory: result.memorySuggestion, requestId });
        return;
      }
      if (result.kind === "proposal" && result.proposal?.type === "create_task") {
        response.json({
          mode: "proposal",
          message: "Preparei uma tarefa para você revisar. Ela só será criada depois da sua confirmação.",
          proposal: { id: crypto.randomUUID(), ...result.proposal },
          requestId,
        });
        return;
      }
      if (result.kind !== "message" || !result.text) throw new Error("MODEL_INVALID_RESULT");
      response.json({ mode: "generative", message: result.text, requestId });
    } catch (error) {
      const status = error?.status === 429 ? 429 : 503;
      response.status(status).json({ error: status === 429 ? "RATE_LIMITED" : "ASSISTANT_UNAVAILABLE", requestId });
    } finally {
      const latencyMs = Math.round(performance.now() - startedAt);
      console.info(JSON.stringify({ event: "alumia_ai_request", requestId, status: response.statusCode, latencyMs }));
    }
  });

  app.use((_request, response) => response.status(404).json({ error: "NOT_FOUND" }));
  return app;
}
