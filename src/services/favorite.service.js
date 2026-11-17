import { connectToDatabase } from "../lib/mongodb.js";
import { ServiceError, normalizeError } from "../lib/errors.js";
import {
  buildPagination,
  parsePagination,
  requireObjectId,
} from "../lib/service-utils.js";
import Favorite from "../models/favorite.js";
import Listing from "../models/listing.js";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

function requireBuyerId(buyerId) {
  const value = typeof buyerId === "string" ? buyerId.trim() : "";
  if (!value) {
    throw new ServiceError("Buyer id is required", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }
  return value;
}

/** Adds a favorite. The unique index makes a duplicate a 409 ServiceError. */
export async function addFavorite({ buyerId, listing } = {}) {
  await connectToDatabase();

  const normalizedBuyerId = requireBuyerId(buyerId);
  const listingId = requireObjectId(listing, "listing id");

  const listingDoc = await Listing.findById(listingId).select(
    "status isActive"
  );
  if (!listingDoc) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }
  if (!listingDoc.isActive || listingDoc.status === "Sold") {
    throw new ServiceError("This listing is no longer available", {
      statusCode: 409,
      code: "LISTING_UNAVAILABLE",
    });
  }

  try {
    const favorite = await Favorite.create({
      buyerId: normalizedBuyerId,
      listing: listingId,
    });
    await favorite.populate({
      path: "listing",
      select: "name price images status isActive listingType category condition seller",
      populate: { path: "seller", select: "name email phone contactPreference" },
    });
    return favorite;
  } catch (error) {
    throw normalizeError(error, "Could not add favorite");
  }
}

/** Removes a favorite. Deleting a missing favorite is idempotent. */
export async function removeFavorite({ buyerId, listing } = {}) {
  await connectToDatabase();

  const normalizedBuyerId = requireBuyerId(buyerId);
  const listingId = requireObjectId(listing, "listing id");

  const result = await Favorite.deleteOne({
    buyerId: normalizedBuyerId,
    listing: listingId,
  });

  return { removed: (result.deletedCount ?? 0) > 0 };
}

/**
 * Favorites for a buyer with populated listings.
 * Favorites whose listing was hard-deleted are filtered out.
 */
export async function getFavorites(
  buyerId,
  { page = 1, limit = DEFAULT_PAGE_SIZE } = {}
) {
  await connectToDatabase();

  const normalizedBuyerId = requireBuyerId(buyerId);

  const favorites = await Favorite.find({ buyerId: normalizedBuyerId })
    .sort({ createdAt: -1 })
    .populate({
      path: "listing",
      select: "name price images status isActive listingType category condition seller createdAt",
      populate: { path: "seller", select: "name email phone contactPreference" },
    });

  // Hard-deleted listings are dropped; deactivated ones are hidden too.
  // Sold listings stay visible so the buyer can see their final status.
  const available = favorites.filter(
    (favorite) => favorite.listing && favorite.listing.isActive !== false
  );

  const { page: requestedPage, limit: pageSize } = parsePagination(
    page,
    limit,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );
  const window = buildPagination(available.length, requestedPage, pageSize);

  const { skip, ...meta } = window;
  return { items: available.slice(skip, skip + window.limit), ...meta };
}

/** True when the buyer has already saved this listing. */
export async function isFavorite(buyerId, listing) {
  await connectToDatabase();

  const normalizedBuyerId = requireBuyerId(buyerId);
  const listingId = requireObjectId(listing, "listing id");

  const exists = await Favorite.exists({
    buyerId: normalizedBuyerId,
    listing: listingId,
  });

  return Boolean(exists);
}

const favoriteService = {
  addFavorite,
  removeFavorite,
  getFavorites,
  isFavorite,
};

export default favoriteService;
