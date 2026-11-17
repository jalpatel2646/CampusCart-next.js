import { connectToDatabase, isValidObjectId } from "../lib/mongodb.js";
import { ServiceError, normalizeError } from "../lib/errors.js";
import { pickFields, requireObjectId } from "../lib/service-utils.js";
import SavedSearch from "../models/saved-search.js";
import Listing from "../models/listing.js";

const MAX_SAVED_SEARCHES = 20;
const MAX_MATCH_COUNTS = 20;

const SAVED_SEARCH_FIELDS = [
  "name",
  "search",
  "categories",
  "conditions",
  "minPrice",
  "maxPrice",
  "sort",
];

function requireAccountId(sellerId) {
  const value = typeof sellerId === "string" ? sellerId.trim() : "";
  if (!isValidObjectId(value)) {
    throw new ServiceError("A valid account id is required", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }
  return value;
}

/** Mirrors the marketplace query contract, minus pagination and sorting. */
function buildMatchFilter(savedSearch) {
  const filter = { isActive: true, status: { $ne: "Sold" } };

  const search = String(savedSearch.search ?? "").trim();
  if (search) filter.$text = { $search: search };

  const categories = [...new Set(savedSearch.categories ?? [])].filter(Boolean);
  if (categories.length > 0) filter.category = { $in: categories };

  const conditions = [...new Set(savedSearch.conditions ?? [])].filter(Boolean);
  if (conditions.length > 0) filter.condition = { $in: conditions };

  if (savedSearch.minPrice !== null && savedSearch.minPrice !== undefined) {
    filter.price = { ...filter.price, $gte: Number(savedSearch.minPrice) };
  }
  if (savedSearch.maxPrice !== null && savedSearch.maxPrice !== undefined) {
    filter.price = { ...filter.price, $lte: Number(savedSearch.maxPrice) };
  }

  return filter;
}

function lastSeenDate(savedSearch) {
  const value = savedSearch.lastSeenAt ? new Date(savedSearch.lastSeenAt) : new Date();
  return Number.isNaN(value.getTime()) ? new Date(0) : value;
}

/** Total matches and matches since `lastSeenAt`, with one query per search. */
async function countMatches(savedSearch) {
  const filter = buildMatchFilter(savedSearch);
  const watermark = lastSeenDate(savedSearch);

  const [row] = await Listing.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        matchCount: { $sum: 1 },
        newCount: {
          $sum: {
            $cond: [{ $gt: ["$createdAt", watermark] }, 1, 0],
          },
        },
      },
    },
  ]);

  return {
    matchCount: row?.matchCount ?? 0,
    newCount: row?.newCount ?? 0,
  };
}

/** Creates a saved search, capping how many each account keeps. */
export async function createSavedSearch(sellerId, data = {}) {
  await connectToDatabase();

  const seller = requireAccountId(sellerId);
  const count = await SavedSearch.countDocuments({ seller });
  if (count >= MAX_SAVED_SEARCHES) {
    throw new ServiceError(
      `You can save up to ${MAX_SAVED_SEARCHES} searches. Remove one to make room.`,
      { statusCode: 409, code: "SAVED_SEARCH_LIMIT" }
    );
  }

  try {
    const savedSearch = await SavedSearch.create({
      ...pickFields(data, SAVED_SEARCH_FIELDS),
      seller,
    });
    return savedSearch;
  } catch (error) {
    throw normalizeError(error, "Could not save this search");
  }
}

/** Lists the account's saved searches newest first, with match counts. */
export async function listSavedSearches(sellerId, { limit = MAX_MATCH_COUNTS } = {}) {
  await connectToDatabase();

  const seller = requireAccountId(sellerId);
  const cap = Math.min(
    Math.max(Number.parseInt(limit, 10) || MAX_MATCH_COUNTS, 1),
    MAX_MATCH_COUNTS
  );

  const rows = await SavedSearch.find({ seller }).sort({ createdAt: -1 }).limit(cap).lean();

  return Promise.all(
    rows.map(async (row) => ({
      ...row,
      ...(await countMatches(row)),
    }))
  );
}

/** Removes a saved search owned by the account. Idempotent per account. */
export async function deleteSavedSearch(sellerId, savedSearchId) {
  await connectToDatabase();

  const seller = requireAccountId(sellerId);
  const id = requireObjectId(savedSearchId, "saved search id");

  const result = await SavedSearch.deleteOne({ _id: id, seller });
  if (!result.deletedCount) {
    throw new ServiceError("Saved search not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return { removed: true };
}

/** Moves the `lastSeenAt` watermark to now so old matches stop counting. */
export async function markSavedSearchSeen(sellerId, savedSearchId) {
  await connectToDatabase();

  const seller = requireAccountId(sellerId);
  const id = requireObjectId(savedSearchId, "saved search id");

  const savedSearch = await SavedSearch.findOneAndUpdate(
    { _id: id, seller },
    { $set: { lastSeenAt: new Date() } },
    { new: true, runValidators: true }
  );

  if (!savedSearch) {
    throw new ServiceError("Saved search not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return savedSearch;
}

/** Marks every saved search for the account as seen. */
export async function markAllSavedSearchesSeen(sellerId) {
  await connectToDatabase();

  const seller = requireAccountId(sellerId);
  const result = await SavedSearch.updateMany(
    { seller },
    { $set: { lastSeenAt: new Date() } }
  );

  return { updated: result.modifiedCount ?? 0 };
}

const savedSearchService = {
  createSavedSearch,
  listSavedSearches,
  deleteSavedSearch,
  markSavedSearchSeen,
  markAllSavedSearchesSeen,
};

export default savedSearchService;
