import {
  LISTING_SORTS,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "@/lib/constants";

export { LISTING_SORTS };

const RUPEES = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

function first(value) {
  return Array.isArray(value) ? value[0] : value;
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function toNumber(value) {
  const raw = first(value);
  if (raw === undefined || raw === null || raw === "") return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

/**
 * Normalises raw URL search params into the listing query contract used by
 * GET /api/listings (see PRD API-001). Unknown/invalid values are ignored.
 */
export function parseListingParams(params = {}) {
  const category = first(params.category);
  const sort = first(params.sort);
  const page = Number(first(params.page));

  const conditions = [
    ...new Set(toArray(params.condition).filter((value) => PRODUCT_CONDITIONS.includes(value))),
  ];

  return {
    search: (first(params.search) ?? "").toString().trim().slice(0, 100),
    categories: PRODUCT_CATEGORIES.includes(category) ? [category] : [],
    conditions,
    location: (first(params.location) ?? "").toString().trim().slice(0, 80),
    minPrice: toNumber(params.minPrice),
    maxPrice: toNumber(params.maxPrice),
    sort: LISTING_SORTS.includes(sort) ? sort : "newest",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

/**
 * Builds a /marketplace URL from the current params plus overrides.
 * Passing `undefined`/`null`/"" for a key removes it. Returns "/marketplace"
 * when no params remain.
 */
export function buildListingHref(current = {}, overrides = {}) {
  const merged = { ...current };
  for (const key of Object.keys(overrides)) {
    delete merged[key];
  }

  const params = new URLSearchParams();
  const append = (key, value) => {
    if (value === undefined || value === null || value === "") return;
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== undefined && entry !== null && entry !== "") {
        params.append(key, entry);
      }
    }
  };

  for (const [key, value] of Object.entries(merged)) {
    if (Array.isArray(value)) value.forEach((entry) => append(key, entry));
    else append(key, value);
  }

  for (const [key, value] of Object.entries(overrides)) {
    append(key, value);
  }

  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}

/** True when any user-facing filter (not search/sort/page) is applied. */
export function hasActiveListingFilters(params = {}) {
  return Boolean(
    first(params.category) ||
      toArray(params.condition).length > 0 ||
      first(params.location) ||
      params.minPrice !== undefined ||
      params.maxPrice !== undefined
  );
}

/* ------------------------------------------------------------------ */
/* Saved searches                                                      */
/* ------------------------------------------------------------------ */

/** The subset of listing filters that a saved search remembers. */
export function savedSearchFromParams(params = {}) {
  const filters = parseListingParams(params);

  return {
    search: filters.search,
    categories: filters.categories,
    conditions: filters.conditions,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    sort: filters.sort,
  };
}

function hasValue(value) {
  return value !== null && value !== undefined && value !== "";
}

function priceLabel(minPrice, maxPrice) {
  const hasMin = hasValue(minPrice);
  const hasMax = hasValue(maxPrice);
  const format = (value) => `₹${RUPEES.format(Number(value))}`;

  if (hasMin && hasMax) return `${format(minPrice)}–${format(maxPrice)}`;
  if (hasMax) return `Under ${format(maxPrice)}`;
  if (hasMin) return `Over ${format(minPrice)}`;
  return null;
}

/**
 * Human-readable filter chips for a saved search.
 * Returns an empty array when the search matches everything.
 */
export function describeSavedSearch(values = {}) {
  const labels = [];
  const search = String(values.search ?? "").trim();

  if (search) labels.push(`“${search}”`);
  for (const category of values.categories ?? []) labels.push(category);
  for (const condition of values.conditions ?? []) labels.push(condition);

  const price = priceLabel(values.minPrice, values.maxPrice);
  if (price) labels.push(price);

  return labels;
}

/** True when the filters are specific enough to be worth saving. */
export function hasSavedSearchCriteria(values = {}) {
  return describeSavedSearch(values).length > 0;
}

/** Generates a default name such as `Books · Under ₹500`. */
export function suggestSavedSearchName(values = {}) {
  const labels = describeSavedSearch(values);
  if (labels.length === 0) return "All listings";

  const name = labels.join(" · ");
  return name.length > 80 ? `${name.slice(0, 77)}…` : name;
}

/** Rebuilds the /marketplace URL that a saved search represents. */
export function savedSearchHref(values = {}) {
  const params = new URLSearchParams();

  if (values.search) params.set("search", values.search);
  for (const category of values.categories ?? []) params.append("category", category);
  for (const condition of values.conditions ?? []) params.append("condition", condition);
  if (hasValue(values.minPrice)) params.set("minPrice", String(values.minPrice));
  if (hasValue(values.maxPrice)) params.set("maxPrice", String(values.maxPrice));
  if (values.sort && values.sort !== "newest") params.set("sort", values.sort);

  const query = params.toString();
  return query ? `/marketplace?${query}` : "/marketplace";
}
