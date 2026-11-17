import crypto from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(crypto.scrypt);

const KEY_LENGTH = 64;
const SALT_BYTES = 16;
const SCRYPT_OPTIONS = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const SCHEME = "scrypt";

/**
 * Hashes a plain-text password with scrypt.
 * Stored format: `scrypt$<salt base64url>$<hash base64url>`.
 */
export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_BYTES);
  const derived = await scryptAsync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);
  return `${SCHEME}$${salt.toString("base64url")}$${derived.toString("base64url")}`;
}

/** Checks a password against a stored hash using a constant-time comparison. */
export async function verifyPassword(password, storedHash) {
  if (typeof password !== "string" || typeof storedHash !== "string") return false;

  const [scheme, salt, hash] = storedHash.split("$");
  if (scheme !== SCHEME || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const actual = await scryptAsync(
    password,
    Buffer.from(salt, "base64url"),
    expected.length,
    SCRYPT_OPTIONS
  );

  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
