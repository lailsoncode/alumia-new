import { createApp } from "./app.js";
import { createSupabaseAuthorizer } from "./auth.js";
import { readConfig } from "./config.js";
import { createGeminiGenerator } from "./gemini.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";
import { createMemoryReader, createMemoryWriter } from "./memory.js";
import { createSpeechTranscriber } from "./speech.js";
import { createSpeechSynthesizer } from "./text-to-speech.js";

const config = readConfig();
const app = createApp({
  authorize: createSupabaseAuthorizer(config),
  generate: createGeminiGenerator(config),
  readMemories: createMemoryReader(config),
  writeMemory: createMemoryWriter(config),
  allowedOrigins: config.allowedOrigins,
  checkRateLimit: createInMemoryRateLimiter({
    maxRequests: config.rateLimitRequests,
    windowMs: config.rateLimitWindowMs,
  }),
  transcribe: createSpeechTranscriber(config),
  synthesize: createSpeechSynthesizer(config),
  checkVoiceRateLimit: createInMemoryRateLimiter({
    maxRequests: config.rateLimitVoiceRequests,
    windowMs: config.rateLimitWindowMs,
  }),
});

app.listen(config.port, "0.0.0.0", () => {
  console.info(JSON.stringify({ event: "alumia_ai_started", port: config.port, model: config.model, location: config.location }));
});
