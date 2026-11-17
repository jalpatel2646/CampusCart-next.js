import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/lib/constants";

export const LISTING_SORTS = ["newest", "price_asc", "price_desc", "relevance"];

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
      params.minPrice !== undefined ||
      params.maxPrice !== undefined
  );
}
