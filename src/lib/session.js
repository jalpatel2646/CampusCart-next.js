import { cookies } from "next/headers";
import { connection } from "next/server";
import { ServiceError } from "@/lib/errors";
import { connectToDatabase } from "@/lib/mongodb";
import {
  SESSION_COOKIE,
  createSessionToken,
  readSessionToken,
} from "@/lib/session-token";
import Seller from "@/models/seller";

export { SESSION_COOKIE };

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const isProduction = process.env.NODE_ENV === "production";

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
  cookieStore.set(
    SESSION_COOKIE,
    createSessionToken(String(sellerId), COOKIE_MAX_AGE_SECONDS),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: COOKIE_MAX_AGE_SECONDS,
    }
  );
}

/** Clears the seller session cookie (route handlers only). */
export async function endSellerSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
