import { isValidObjectId } from "./mongodb.js";
import { ServiceError } from "./errors.js";

/**
 * Validates a route/service identifier before it reaches Mongoose.
 * Throws a 400 ServiceError for malformed ObjectIds.
 */
export function requireObjectId(value, label = "id") {
  if (!isValidObjectId(value)) {
    throw new ServiceError(`Invalid ${label}`, {
      statusCode: 400,
      code: "INVALID_ID",
    });
  }
  return value;
}

/**
 * Copies only the allowed fields from user input.
 * This is the whitelist that keeps arbitrary fields (status, seller, _id…)
 * out of documents even though the schemas use `strict: "throw"`.
 */
export function pickFields(source, fields) {
  const picked = {};
  if (!source || typeof source !== "object") return picked;

  for (const field of fields) {
    if (
      Object.prototype.hasOwnProperty.call(source, field) &&
      source[field] !== undefined
    ) {
      picked[field] = source[field];
    }
  }

  return picked;
}

/** Normalises page/limit input into safe integers (limit capped at 50 by default). */
export function parsePagination(page, limit, defaultLimit = 12, maxLimit = 50) {
  const parsedPage = Number.parseInt(page, 10);
  const parsedLimit = Number.parseInt(limit, 10);

  return {
    page: Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1,
    limit:
      Number.isFinite(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, maxLimit)
        : defaultLimit,
  };
}

/** Clamps a page against the real total and returns the skip/meta pair. */
export function buildPagination(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const skip = (currentPage - 1) * limit;

  return {
    total,
    page: currentPage,
    totalPages,
    limit,
    skip,
    rangeStart: total === 0 ? 0 : skip + 1,
    rangeEnd: Math.min(skip + limit, total),
  };
}
