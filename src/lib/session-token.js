import crypto from "node:crypto";

export const SESSION_COOKIE = "cc_session";

const isProduction = process.env.NODE_ENV === "production";

export function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (isProduction) {
    throw new Error("SESSION_SECRET must be set in production");
  }
  return "campuscart-local-development-secret";
}

function sign(payload) {
  return crypto.createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(sellerId, maxAgeSeconds) {
  const expiresAt = Date.now() + maxAgeSeconds * 1000;
  const payload = `${sellerId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the seller id from a valid, unexpired token, or null. */
export function readSessionToken(token) {
  if (typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [sellerId, expiresAt, signature] = parts;
  if (!sellerId || !expiresAt || !signature) return null;

  const expected = Buffer.from(sign(`${sellerId}.${expiresAt}`));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(actual, expected)) return null;

  const expiry = Number(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Date.now()) return null;

  return sellerId;
}
