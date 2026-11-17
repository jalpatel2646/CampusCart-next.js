import { NextResponse } from "next/server";
import { safeRedirectPath } from "@/lib/redirects";
import { SESSION_COOKIE, readSessionToken } from "@/lib/session-token";

const AUTH_PAGES = new Set(["/login", "/signup"]);

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/favorites",
  "/create-listing",
  "/edit-listing",
  "/enquiries",
];

function isProtected(pathname) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Resolves auth-related redirects before a page starts streaming, so signed-out
 * visitors and signed-in visitors to login/signup get a real 307 instead of a
 * 200 response that redirects later. The signature and expiry are verified from
 * the cookie alone; pages still load the account from the database.
 */
export function proxy(request) {
  const { pathname, search, searchParams } = request.nextUrl;

  let sellerId = null;
  try {
    sellerId = readSessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  } catch {
    sellerId = null;
  }

  if (AUTH_PAGES.has(pathname)) {
    if (!sellerId) return NextResponse.next();

    const destination = safeRedirectPath(searchParams.get("next"));
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (!isProtected(pathname) || sellerId) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/favorites",
    "/create-listing",
    "/edit-listing/:path*",
    "/enquiries",
    "/login",
    "/signup",
  ],
};
