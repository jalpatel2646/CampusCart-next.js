import crypto from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ServiceError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import Seller from "@/models/seller";

export const SESSION_COOKIE = "cc_session";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const isProduction = process.env.NODE_ENV === "production";

function getSessionSecret() {
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

function createSessionToken(sellerId) {
  const expiresAt = Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const payload = `${sellerId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

/** Returns the seller id from a valid, unexpired token, or null. */
function readSessionToken(token) {
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

/** Returns the signed-in seller id for the current request, or null. */
export async function getSellerSession() {
  // The expiry check reads the clock, so this must run at request time instead
  // of during prerendering.
  await connection();

  const cookieStore = await cookies();
  return readSessionToken(cookieStore.get(SESSION_COOKIE)?.value);
}

/** Loads the signed-in seller document, or null when there is no valid session. */
export async function getSessionSeller() {
  const sellerId = await getSellerSession();
  if (!sellerId) return null;

  await connectToDatabase();
  return Seller.findById(sellerId);
}

/** Requires a signed-in seller for owner-only operations. */
export async function requireSellerSession() {
  const sellerId = await getSellerSession();
  if (!sellerId) {
    throw new ServiceError("Sign in to your CampusCart account to continue", {
      statusCode: 401,
      code: "UNAUTHENTICATED",
    });
  }
  return sellerId;
}

/** Stores the seller session in an HTTP-only, signed cookie (route handlers only). */
export async function startSellerSession(sellerId) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, createSessionToken(String(sellerId)), {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
}

/** Clears the seller session cookie (route handlers only). */
export async function endSellerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
