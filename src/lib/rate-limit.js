import { ServiceError } from "@/lib/errors";

/**
 * In-memory fixed-window limiter for public write endpoints.
 *
 * ACCURACY NOTE (serverless):
 * This limiter is per-instance. Vercel may run several instances of a route,
 * so a client can get more attempts than the limit if they land on a fresh
 * instance, and instances reset on cold starts. Treat this as a spam speed
 * bump that catches most isolated bursts — never as an authentication or
 * abuse boundary for a high-value action. For durable, globally consistent
 * limiting use a shared store (e.g. Upstash Redis / Vercel KV) with the
 * INCR + EXPIRE pattern; the shape of the 429 contract below stays the same.
 */
const buckets = new Map();

/** Left-most entry of a comma list, only if it looks like an IP. */
const IP_PATTERN = /^[0-9a-fA-F.:,\s-]{1,64}$/;

function sanitizeIp(value) {
  if (typeof value !== "string") return null;
  const candidate = value.split(",")[0]?.trim() ?? "";
  if (!candidate || candidate.length > 64) return null;
  if (!IP_PATTERN.test(candidate)) return null;
  return candidate.toLowerCase();
}

/**
 * Best-effort client identification.
 *
 * Header trust order (Vercel, per platform docs):
 *   x-vercel-forwarded-for → same value as x-forwarded-for but cannot be
 *     overwritten by an upstream proxy (only the Enterprise Trusted Proxy can)
 *   x-forwarded-for → the client's public IP on Vercel, when no proxy sits
 *     in front of the deployment
 *   x-real-ip → identical to x-forwarded-for
 *
 * When the platform does not supply a recognisable IP (local development and
 * unknown proxies), we fall back to "unknown" — deliberately NOT a per-tenant
 * identity — so that unidentifiable callers share one bounded bucket instead
 * of getting unlimited access.
 */
function clientKey(request) {
  const candidates = [
    request.headers.get("x-vercel-forwarded-for"),
    request.headers.get("x-forwarded-for"),
    request.headers.get("x-real-ip"),
  ];

  for (const candidate of candidates) {
    const cleaned = sanitizeIp(candidate);
    if (cleaned) return cleaned;
  }

  return "unknown";
}

function buildRetryMessage(retryAfterMs) {
  if (!Number.isFinite(retryAfterMs) || retryAfterMs <= 0) {
    return "Too many attempts. Please try again in a moment.";
  }
  const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
  if (retryAfterSeconds < 60) {
    return `Too many attempts. Please try again in ${retryAfterSeconds} seconds.`;
  }
  const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);
  return `Too many attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes === 1 ? "" : "s"}.`;
}

export class RateLimitError extends ServiceError {
  constructor(retryAfterSeconds, message) {
    super(message, {
      statusCode: 429,
      code: "RATE_LIMITED",
    });
    this.name = "RateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function rateLimit(request, { name, limit = 20, windowMs = 10 * 60 * 1000 }) {
  const key = `${name}:${clientKey(request)}`;
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    const retryAfterMs = bucket.resetAt - now;
    throw new RateLimitError(
      Math.max(1, Math.ceil(retryAfterMs / 1000)),
      buildRetryMessage(retryAfterMs)
    );
  }
}
