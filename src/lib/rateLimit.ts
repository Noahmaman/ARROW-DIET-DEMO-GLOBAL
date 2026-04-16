// In-memory rate limiter (per process; replace with Redis in production)
interface RateLimitEntry {
  count: number;
  windowStart: number;
  dayCount: number;
  dayStart: number;
}

const store = new Map<string, RateLimitEntry>();

function getEntry(key: string): RateLimitEntry {
  const now = Date.now();
  let entry = store.get(key);
  if (!entry) {
    entry = { count: 0, windowStart: now, dayCount: 0, dayStart: now };
    store.set(key, entry);
  }
  return entry;
}

/** Returns true if the request should be BLOCKED */
export function checkRateLimit(
  key: string,
  opts: { maxPerMinute: number; maxPerDay: number }
): { blocked: boolean; reason?: string } {
  const now = Date.now();
  const entry = getEntry(key);

  // Reset per-minute window
  if (now - entry.windowStart > 60_000) {
    entry.count = 0;
    entry.windowStart = now;
  }

  // Reset per-day window (24h)
  if (now - entry.dayStart > 86_400_000) {
    entry.dayCount = 0;
    entry.dayStart = now;
  }

  if (entry.dayCount >= opts.maxPerDay) {
    return { blocked: true, reason: "daily_limit" };
  }

  if (entry.count >= opts.maxPerMinute) {
    return { blocked: true, reason: "rate_limit" };
  }

  entry.count++;
  entry.dayCount++;
  return { blocked: false };
}

// Cleanup old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.dayStart > 86_400_000 * 2) {
      store.delete(key);
    }
  }
}, 600_000);
