export function createInMemoryRateLimiter({ maxRequests = 12, windowMs = 60_000, now = Date.now } = {}) {
  const buckets = new Map();
  let checks = 0;

  return function checkRateLimit(key) {
    const currentTime = now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= currentTime) {
      buckets.set(key, { count: 1, resetAt: currentTime + windowMs });
      return { allowed: true, retryAfterSeconds: 0 };
    }

    if (current.count >= maxRequests) {
      return {
        allowed: false,
        retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - currentTime) / 1_000)),
      };
    }

    current.count += 1;
    checks += 1;
    if (checks % 100 === 0) {
      for (const [bucketKey, bucket] of buckets) {
        if (bucket.resetAt <= currentTime) buckets.delete(bucketKey);
      }
    }
    return { allowed: true, retryAfterSeconds: 0 };
  };
}
