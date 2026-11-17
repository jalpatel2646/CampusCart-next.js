import { connectToDatabase } from "../lib/mongodb.js";
import { ServiceError, normalizeError } from "../lib/errors.js";
import {
  buildPagination,
  parsePagination,
  pickFields,
  requireObjectId,
} from "../lib/service-utils.js";
import { ENQUIRY_STATUSES } from "../lib/constants.js";
import Enquiry from "../models/enquiry.js";
import Listing from "../models/listing.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const CREATE_FIELDS = ["buyerName", "buyerEmail", "message", "offerPrice"];

/** Pending can be resolved; accepted/rejected can only be closed. */
const STATUS_TRANSITIONS = {
  Pending: ["Accepted", "Rejected", "Closed"],
  Accepted: ["Closed"],
  Rejected: ["Closed"],
  Closed: [],
};

const LISTING_POPULATE = {
  path: "listing",
  select: "name price images status isActive listingType category condition seller",
  populate: { path: "seller", select: "name email phone contactPreference" },
};

function normalizeBuyerEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Creates an enquiry for an existing, available listing.
 * Sold or deactivated listings stop accepting enquiries (409).
 */
export async function createEnquiry(data = {}) {
  await connectToDatabase();

  const listingId = requireObjectId(data.listing, "listing id");
  const listing = await Listing.findById(listingId).select(
    "status isActive name"
  );

  if (!listing) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  if (!listing.isActive || listing.status === "Sold") {
    throw new ServiceError("This listing is no longer accepting enquiries", {
      statusCode: 409,
      code: "LISTING_UNAVAILABLE",
    });
  }

  try {
    const payload = pickFields(data, CREATE_FIELDS);
    if (payload.offerPrice === "" || payload.offerPrice === null) {
      delete payload.offerPrice;
    }

    const enquiry = new Enquiry({ ...payload, listing: listingId });
    await enquiry.save();
    await enquiry.populate(LISTING_POPULATE);
    return enquiry;
  } catch (error) {
    throw normalizeError(error, "Could not create enquiry");
  }
}

/**
 * Finds enquiries. At least one scoping filter is required so a caller can
 * never accidentally read the whole collection (enquiries contain PII).
 */
export async function getEnquiries({
  listing,
  listingId,
  sellerId,
  buyerEmail,
  status,
  page = 1,
  limit = DEFAULT_PAGE_SIZE,
} = {}) {
  await connectToDatabase();

  const filter = {};
  const targetListing = listing ?? listingId;

  if (targetListing) {
    filter.listing = requireObjectId(targetListing, "listing id");
  } else if (sellerId) {
    const seller = requireObjectId(sellerId, "seller id");
    const sellerListings = await Listing.find({ seller }).select("_id").lean();
    filter.listing = { $in: sellerListings.map((item) => item._id) };
  } else if (!buyerEmail) {
    throw new ServiceError(
      "Provide a listing, seller, or buyer email to scope enquiries",
      { statusCode: 400, code: "MISSING_FILTER" }
    );
  }

  if (buyerEmail) filter.buyerEmail = normalizeBuyerEmail(buyerEmail);

  if (status) {
    if (!ENQUIRY_STATUSES.includes(status)) {
      throw new ServiceError(
        `Status must be one of: ${ENQUIRY_STATUSES.join(", ")}`,
        { statusCode: 400, code: "VALIDATION_ERROR" }
      );
    }
    filter.status = status;
  }

  const { page: requestedPage, limit: pageSize } = parsePagination(
    page,
    limit,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );

  const total = await Enquiry.countDocuments(filter);
  const window = buildPagination(total, requestedPage, pageSize);

  const items = await Enquiry.find(filter)
    .sort({ createdAt: -1 })
    .skip(window.skip)
    .limit(window.limit)
    .populate(LISTING_POPULATE);

  const { skip, ...meta } = window;
  return { items, ...meta };
}

/** Finds one enquiry by id. Throws 404 when missing. */
export async function getEnquiryById(id) {
  await connectToDatabase();

  const enquiryId = requireObjectId(id, "enquiry id");
  const enquiry = await Enquiry.findById(enquiryId).populate(LISTING_POPULATE);
  if (!enquiry) {
    throw new ServiceError("Enquiry not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return enquiry;
}

/**
 * Updates an enquiry status with an atomic compare-and-set on the current
 * status. Accept/reject therefore happen at most once even under concurrency.
 */
export async function updateEnquiryStatus(id, status, { sellerResponse } = {}) {
  await connectToDatabase();

  const enquiryId = requireObjectId(id, "enquiry id");

  if (!ENQUIRY_STATUSES.includes(status)) {
    throw new ServiceError(
      `Status must be one of: ${ENQUIRY_STATUSES.join(", ")}`,
      { statusCode: 400, code: "VALIDATION_ERROR" }
    );
  }

  const existing = await Enquiry.findById(enquiryId);
  if (!existing) {
    throw new ServiceError("Enquiry not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  if (existing.status === status) {
    if (sellerResponse !== undefined) {
      existing.sellerResponse = String(sellerResponse).trim();
      await existing.save();
    }
    await existing.populate(LISTING_POPULATE);
    return existing;
  }

  const allowed = STATUS_TRANSITIONS[existing.status] ?? [];
  if (!allowed.includes(status)) {
    throw new ServiceError(
      `Cannot change enquiry status from ${existing.status} to ${status}`,
      { statusCode: 409, code: "INVALID_STATUS_TRANSITION" }
    );
  }

  const updates = { status };
  if (sellerResponse !== undefined) {
    updates.sellerResponse = String(sellerResponse).trim();
  }

  const updated = await Enquiry.findOneAndUpdate(
    { _id: enquiryId, status: existing.status },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  ).populate(LISTING_POPULATE);

  if (!updated) {
    throw new ServiceError(
      "Enquiry was updated by another request. Refresh and try again.",
      { statusCode: 409, code: "CONCURRENT_UPDATE" }
    );
  }

  return updated;
}

const enquiryService = {
  createEnquiry,
  getEnquiries,
  getEnquiryById,
  updateEnquiryStatus,
};

export default enquiryService;
