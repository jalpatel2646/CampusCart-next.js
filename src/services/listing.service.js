import { connectToDatabase, isValidObjectId } from "../lib/mongodb.js";
import { ServiceError, normalizeError } from "../lib/errors.js";
import {
  buildPagination,
  parsePagination,
  pickFields,
  requireObjectId,
} from "../lib/service-utils.js";
import { LISTING_STATUSES } from "../lib/constants.js";
import Listing from "../models/listing.js";
import Seller from "../models/seller.js";
import Enquiry from "../models/enquiry.js";
import Favorite from "../models/favorite.js";
import { findOrCreateSeller } from "./seller.service.js";

const DEFAULT_PAGE_SIZE = 12;
const MAX_PAGE_SIZE = 50;
const MAX_SIMILAR = 12;

const CREATE_FIELDS = [
  "name",
  "description",
  "price",
  "category",
  "condition",
  "images",
  "listingType",
  "exchangeDescription",
  "location",
];

const UPDATE_FIELDS = [...CREATE_FIELDS, "status", "isActive"];

/** Sold is terminal; the other two statuses may move between each other. */
const STATUS_TRANSITIONS = {
  Available: ["Available", "Reserved", "Sold"],
  Reserved: ["Reserved", "Available", "Sold"],
  Sold: ["Sold"],
};

/**
 * Accepts either an existing seller id or seller details (find-or-create).
 * Returns an ObjectId-compatible value for the Listing.seller path.
 */
async function resolveSellerReference(seller) {
  if (
    seller &&
    typeof seller === "object" &&
    typeof seller.email === "string" &&
    seller.email.trim()
  ) {
    const { seller: sellerDoc } = await findOrCreateSeller(seller);
    return sellerDoc._id;
  }

  if (isValidObjectId(seller)) {
    const sellerId = requireObjectId(seller, "seller id");
    const exists = await Seller.exists({ _id: sellerId });
    if (!exists) {
      throw new ServiceError("Seller not found", {
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }
    return sellerId;
  }

  throw new ServiceError(
    "A seller id or seller details (name and email) are required",
    { statusCode: 400, code: "VALIDATION_ERROR" }
  );
}

/** Creates a listing. Status defaults to Available and isActive to true. */
export async function createListing(data = {}) {
  await connectToDatabase();

  const sellerId = await resolveSellerReference(data.seller);

  try {
    const listing = new Listing({
      ...pickFields(data, CREATE_FIELDS),
      seller: sellerId,
      status: "Available",
      isActive: true,
    });

    await listing.save();
    await listing.populate("seller");
    return listing;
  } catch (error) {
    throw normalizeError(error, "Could not create listing");
  }
}

/** Finds one listing by id (with populated seller). Throws 404 when missing. */
export async function getListingById(
  id,
  { includeInactive = false, populateSeller = true } = {}
) {
  await connectToDatabase();

  const listingId = requireObjectId(id, "listing id");
  let query = Listing.findById(listingId);
  if (populateSeller) query = query.populate("seller");

  const listing = await query;
  if (!listing || (!includeInactive && listing.isActive === false)) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return listing;
}

/**
 * Filter/search/sort/paginate listings.
 * Mirrors the query contract planned for GET /api/listings.
 */
export async function getListings({
  search = "",
  category,
  categories = [],
  condition,
  conditions = [],
  minPrice,
  maxPrice,
  listingType,
  listingTypes = [],
  sellerId,
  status,
  includeInactive = false,
  sort = "newest",
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
  location,
} = {}) {
  await connectToDatabase();

  const filter = {};

  if (!includeInactive) {
    filter.isActive = true;
    if (!status) filter.status = { $ne: "Sold" };
  }
  if (status) {
    if (!LISTING_STATUSES.includes(status)) {
      throw new ServiceError(`Status must be one of: ${LISTING_STATUSES.join(", ")}`, {
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    filter.status = status;
  }

  const categoryList = [
    ...(Array.isArray(categories) ? categories : []),
    ...(category ? [category] : []),
  ].filter(Boolean);
  if (categoryList.length > 0) filter.category = { $in: categoryList };

  const conditionList = [
    ...(Array.isArray(conditions) ? conditions : []),
    ...(condition ? [condition] : []),
  ].filter(Boolean);
  if (conditionList.length > 0) filter.condition = { $in: conditionList };

  const locationFilter = String(location ?? "").trim();
  if (locationFilter) filter.location = locationFilter;

  if (minPrice !== undefined && minPrice !== null && minPrice !== "") {
    const value = Number(minPrice);
    if (!Number.isFinite(value) || value < 0) {
      throw new ServiceError("Minimum price must be a non-negative number", {
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    filter.price = { ...filter.price, $gte: value };
  }

  if (maxPrice !== undefined && maxPrice !== null && maxPrice !== "") {
    const value = Number(maxPrice);
    if (!Number.isFinite(value) || value < 0) {
      throw new ServiceError("Maximum price must be a non-negative number", {
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }
    filter.price = { ...filter.price, $lte: value };
  }

  const listingTypeList = [
    ...(Array.isArray(listingTypes) ? listingTypes : []),
    ...(listingType ? [listingType] : []),
  ].filter(Boolean);
  if (listingTypeList.length === 1) filter.listingType = listingTypeList[0];
  if (listingTypeList.length > 1) filter.listingType = { $in: listingTypeList };
  if (sellerId) filter.seller = requireObjectId(sellerId, "seller id");

  const term = String(search ?? "").trim();
  const projection =
    term && sort === "relevance" ? { score: { $meta: "textScore" } } : undefined;
  if (term) filter.$text = { $search: term };

  const sortSpec = (() => {
    switch (sort) {
      case "price_asc":
        return { price: 1, createdAt: -1 };
      case "price_desc":
        return { price: -1, createdAt: -1 };
      case "relevance":
        return term
          ? { score: { $meta: "textScore" }, createdAt: -1 }
          : { createdAt: -1 };
      case "newest":
      default:
        return { createdAt: -1 };
    }
  })();

  const { page: requestedPage, limit: pageSize } = parsePagination(
    page,
    limit,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const total = await Listing.countDocuments(filter);
  const window = buildPagination(total, requestedPage, pageSize);

  const items = await Listing.find(filter, projection)
    .sort(sortSpec)
    .skip(window.skip)
    .limit(window.limit)
    .populate("seller");

  const { skip, ...meta } = window;
  return { items, ...meta };
}

/**
 * Updates whitelisted fields.
 * Enforces status transitions (Sold is terminal) and closes pending
 * enquiries when a listing becomes Sold.
 */
export async function updateListing(id, data = {}) {
  await connectToDatabase();

  const listingId = requireObjectId(id, "listing id");
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  const updates = pickFields(data, UPDATE_FIELDS);
  let becameSold = false;

  if (updates.status !== undefined) {
    if (!LISTING_STATUSES.includes(updates.status)) {
      throw new ServiceError(`Status must be one of: ${LISTING_STATUSES.join(", ")}`, {
        statusCode: 400,
        code: "VALIDATION_ERROR",
      });
    }

    const allowed = STATUS_TRANSITIONS[listing.status] ?? [];
    if (!allowed.includes(updates.status)) {
      throw new ServiceError(
        `Cannot change status from ${listing.status} to ${updates.status}`,
        { statusCode: 409, code: "INVALID_STATUS_TRANSITION" }
      );
    }

    becameSold = updates.status === "Sold" && listing.status !== "Sold";
  }

  try {
    listing.set(updates);
    await listing.save();
  } catch (error) {
    throw normalizeError(error, "Could not update listing");
  }

  if (becameSold) {
    await Enquiry.updateMany(
      { listing: listing._id, status: "Pending" },
      { $set: { status: "Closed" } }
    );
  }

  await listing.populate("seller");
  return listing;
}

/**
 * Deletes a listing and cascades: favorites are removed, pending enquiries
 * are closed. Historical (accepted/rejected/closed) enquiries are preserved.
 */
export async function deleteListing(id) {
  await connectToDatabase();

  const listingId = requireObjectId(id, "listing id");
  const listing = await Listing.findById(listingId);
  if (!listing) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  const [favorites, enquiries] = await Promise.all([
    Favorite.deleteMany({ listing: listingId }),
    Enquiry.updateMany(
      { listing: listingId, status: "Pending" },
      { $set: { status: "Closed" } }
    ),
  ]);

  await listing.deleteOne();

  return {
    deleted: true,
    favoritesRemoved: favorites.deletedCount ?? 0,
    enquiriesClosed: enquiries.modifiedCount ?? 0,
  };
}

/** Same-category active listings, topped up with recent listings if needed. */
export async function getSimilarListings(id, { limit = 4 } = {}) {
  await connectToDatabase();

  const source = await getListingById(id);
  const cap = Math.min(
    Math.max(Number.parseInt(limit, 10) || 4, 1),
    MAX_SIMILAR
  );

  const baseFilter = {
    _id: { $ne: source._id },
    isActive: true,
    status: { $ne: "Sold" },
  };

  const sameCategory = await Listing.find({
    ...baseFilter,
    category: source.category,
  })
    .sort({ createdAt: -1 })
    .limit(cap)
    .populate("seller");

  if (sameCategory.length >= cap) return sameCategory;

  const excludeIds = [source._id, ...sameCategory.map((listing) => listing._id)];
  const fill = await Listing.find({ ...baseFilter, _id: { $nin: excludeIds } })
    .sort({ createdAt: -1 })
    .limit(cap - sameCategory.length)
    .populate("seller");

  return [...sameCategory, ...fill];
}

const listingService = {
  createListing,
  getListingById,
  getListings,
  updateListing,
  deleteListing,
  getSimilarListings,
};

export default listingService;
