import { connectToDatabase } from "../lib/mongodb.js";
import { ServiceError, normalizeError } from "../lib/errors.js";
import {
  buildPagination,
  parsePagination,
  pickFields,
  requireObjectId,
} from "../lib/service-utils.js";
import Seller from "../models/seller.js";
import Listing from "../models/listing.js";
import Enquiry from "../models/enquiry.js";

const SELLER_FIELDS = ["name", "email", "phone", "contactPreference"];

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/** Creates a seller. Duplicate emails are normalised to a 409 ServiceError. */
export async function createSeller(data = {}) {
  await connectToDatabase();

  try {
    const seller = new Seller(pickFields(data, SELLER_FIELDS));
    await seller.save();
    return seller;
  } catch (error) {
    throw normalizeError(error, "Could not create seller");
  }
}

/**
 * Find-or-create used by listing creation.
 * A concurrent duplicate insert is treated as an existing seller.
 */
export async function findOrCreateSeller(data = {}) {
  await connectToDatabase();

  const email = normalizeEmail(data.email);
  if (!email) {
    throw new ServiceError("Seller email is required", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const existing = await Seller.findOne({ email });
  if (existing) return { seller: existing, created: false };

  try {
    const seller = await createSeller({ ...data, email });
    return { seller, created: true };
  } catch (error) {
    if (error.code === "DUPLICATE_KEY") {
      const raced = await Seller.findOne({ email });
      if (raced) return { seller: raced, created: false };
    }
    throw error;
  }
}

/** Finds a seller by Mongo ObjectId. Throws 404 when missing. */
export async function getSellerById(id) {
  await connectToDatabase();

  const sellerId = requireObjectId(id, "seller id");
  const seller = await Seller.findById(sellerId);
  if (!seller) {
    throw new ServiceError("Seller not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return seller;
}

/** Finds a seller by email. Returns null when missing (lookup semantics). */
export async function getSellerByEmail(email) {
  await connectToDatabase();

  const normalized = normalizeEmail(email);
  if (!normalized) return null;
  return Seller.findOne({ email: normalized });
}

/**
 * Listings owned by a seller.
 * By default returns active, non-sold listings; pass includeInactive for history.
 */
export async function getSellerListings(
  sellerId,
  { includeInactive = false, status, page = 1, limit = 12 } = {}
) {
  await connectToDatabase();

  const id = requireObjectId(sellerId, "seller id");
  const filter = { seller: id };

  if (!includeInactive) {
    filter.isActive = true;
    if (!status) filter.status = { $ne: "Sold" };
  }
  if (status) filter.status = status;

  const { page: requestedPage, limit: pageSize } = parsePagination(page, limit);
  const total = await Listing.countDocuments(filter);
  const window = buildPagination(total, requestedPage, pageSize);

  const items = await Listing.find(filter)
    .sort({ createdAt: -1 })
    .skip(window.skip)
    .limit(window.limit)
    .populate("seller");

  const { skip, ...meta } = window;
  return { items, ...meta };
}

/**
 * Everything the dashboard needs for one seller in a single call:
 * metrics, listing rows, and received enquiries.
 */
export async function getSellerDashboard(sellerId) {
  await connectToDatabase();

  const id = requireObjectId(sellerId, "seller id");
  const seller = await Seller.findById(id);
  if (!seller) {
    throw new ServiceError("Seller not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  const listings = await Listing.find({ seller: id }).sort({ createdAt: -1 });
  const listingIds = listings.map((listing) => listing._id);

  const [
    totalListings,
    activeListings,
    soldListings,
    reservedListings,
    inactiveListings,
    enquiries,
    totalEnquiries,
    pendingEnquiries,
    pendingOffers,
    acceptedOffers,
    rejectedOffers,
  ] = await Promise.all([
    Listing.countDocuments({ seller: id }),
    Listing.countDocuments({ seller: id, isActive: true, status: { $ne: "Sold" } }),
    Listing.countDocuments({ seller: id, status: "Sold" }),
    Listing.countDocuments({ seller: id, status: "Reserved" }),
    Listing.countDocuments({ seller: id, isActive: false }),
    Enquiry.find({ listing: { $in: listingIds } })
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({
        path: "listing",
        select: "name price images status isActive listingType category condition",
      }),
    Enquiry.countDocuments({ listing: { $in: listingIds } }),
    Enquiry.countDocuments({ listing: { $in: listingIds }, status: "Pending" }),
    Enquiry.countDocuments({
      listing: { $in: listingIds },
      status: "Pending",
      offerPrice: { $exists: true, $ne: null },
    }),
    Enquiry.countDocuments({
      listing: { $in: listingIds },
      status: "Accepted",
      offerPrice: { $exists: true, $ne: null },
    }),
    Enquiry.countDocuments({
      listing: { $in: listingIds },
      status: "Rejected",
      offerPrice: { $exists: true, $ne: null },
    }),
  ]);

  return {
    seller,
    listings,
    enquiries,
    metrics: {
      totalListings,
      activeListings,
      soldListings,
      reservedListings,
      inactiveListings,
      totalEnquiries,
      pendingEnquiries,
      pendingOffers,
      acceptedOffers,
      rejectedOffers,
    },
  };
}

const sellerService = {
  createSeller,
  findOrCreateSeller,
  getSellerById,
  getSellerByEmail,
  getSellerListings,
  getSellerDashboard,
};

export default sellerService;
