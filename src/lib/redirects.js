/** Only allow same-site relative redirects after login/signup. */
export function safeRedirectPath(value, fallback = "/dashboard") {
  if (typeof value !== "string" || !value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  return value;
}
