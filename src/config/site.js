const rawUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000";

/**
 * Public, build-time site configuration.
 * Only NEXT_PUBLIC_* values belong here — never server credentials.
 */
export const SITE = {
  name: "CampusCart",
  shortName: "CampusCart",
  description:
    "A student marketplace for buying, selling, giving away, and swapping second-hand textbooks, electronics, furniture, and hostel essentials on campus.",
  url: rawUrl.replace(/\/+$/, ""),
  copyrightYear: 2026,
  repository: "https://github.com/jalpatel2646/CampusCart-next.js",
  issues: "https://github.com/jalpatel2646/CampusCart-next.js/issues",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || "",
};

/** Builds an absolute URL from a site-relative path. */
export function absoluteUrl(path = "/") {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}
