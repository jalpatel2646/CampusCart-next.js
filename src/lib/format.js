const SHORT_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
});

const LONG_DATE = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function parse(date) {
  const value = date instanceof Date ? date : new Date(date);
  return Number.isNaN(value.getTime()) ? null : value;
}

/** e.g. "10 Nov" — used on listing cards. */
export function formatListedDate(date) {
  const parsed = parse(date);
  return parsed ? SHORT_DATE.format(parsed) : "";
}

/** e.g. "10 November 2026" — used for tooltips and detail pages. */
export function formatListedDateLong(date) {
  const parsed = parse(date);
  return parsed ? LONG_DATE.format(parsed) : "";
}

/** e.g. "1 listing" / "18 listings". */
export function listingCount(count) {
  return `${count} ${count === 1 ? "listing" : "listings"}`;
}
