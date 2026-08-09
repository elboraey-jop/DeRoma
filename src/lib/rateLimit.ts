/**
 * In-memory sliding window Rate Limiter for Next.js Server Actions & API Routes
 * Protects against brute-force attacks, DDoS, bot spamming, and promo-code guessing.
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale records periodically every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    rateLimitStore.forEach((record, key) => {
      if (now > record.resetTime) {
        rateLimitStore.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowSeconds: number = 60
): { success: boolean; limit: number; remaining: number; reset: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      reset: newRecord.resetTime,
    };
  }

  if (record.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      reset: record.resetTime,
    };
  }

  record.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - record.count,
    reset: record.resetTime,
  };
}

/**
 * Helper to sanitize user string inputs to prevent XSS (Cross-Site Scripting)
 */
export function sanitizeInput(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}
