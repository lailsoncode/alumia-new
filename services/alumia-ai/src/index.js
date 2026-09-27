import { createApp } from "./app.js";
import { createSupabaseAuthorizer } from "./auth.js";
import { readConfig } from "./config.js";
import { createGeminiGenerator } from "./gemini.js";
import { createInMemoryRateLimiter } from "./rate-limit.js";

const config = readConfig();
const app = createApp({
  authorize: createSupabaseAuthorizer(config),
  generate: createGeminiGenerator(config),
  allowedOrigins: config.allowedOrigins,
  checkRateLimit: createInMemoryRateLimiter({
    maxRequests: config.rateLimitRequests,
    windowMs: config.rateLimitWindowMs,
  }),
});

app.listen(config.port, "0.0.0.0", () => {
  console.info(JSON.stringify({ event: "alumia_ai_started", port: config.port, model: config.model, location: config.location }));
});
