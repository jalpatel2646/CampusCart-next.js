import { ServiceError } from "@/lib/errors";

/**
 * Small in-memory limiter for public write endpoints.
 * Serverless instances reset it, so it is a spam speed bump rather than a
 * security boundary. Durable limits belong at the hosting/CDN layer.
 */
const buckets = new Map();

function clientKey(request) {
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  return forwarded.split(",")[0].trim() || request.headers.get("x-real-ip") || "local";
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
    throw new ServiceError("Too many requests. Please wait a few minutes and try again.", {
      statusCode: 429,
      code: "RATE_LIMITED",
    });
  }
}
