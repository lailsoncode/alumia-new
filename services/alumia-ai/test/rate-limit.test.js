import assert from "node:assert/strict";
import test from "node:test";
import { createInMemoryRateLimiter } from "../src/rate-limit.js";

test("limita cada usuário dentro da janela e libera após o reset", () => {
  let currentTime = 1_000;
  const check = createInMemoryRateLimiter({ maxRequests: 2, windowMs: 10_000, now: () => currentTime });

  assert.equal(check("user-1").allowed, true);
  assert.equal(check("user-1").allowed, true);
  assert.deepEqual(check("user-1"), { allowed: false, retryAfterSeconds: 10 });
  assert.equal(check("user-2").allowed, true);

  currentTime = 11_000;
  assert.equal(check("user-1").allowed, true);
});
