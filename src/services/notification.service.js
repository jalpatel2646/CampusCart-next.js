import { connectToDatabase, isValidObjectId } from "../lib/mongodb.js";
import { ServiceError } from "../lib/errors.js";
import {
  buildPagination,
  parsePagination,
  requireObjectId,
} from "../lib/service-utils.js";
import Notification from "../models/notification.js";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

const LISTING_SUBSELECT = "name price images listingType status";
const ENQUIRY_SUBSELECT = "status sellerResponse offerPrice buyerName";

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

/**
 * Records that a seller acted on an enquiry.
 * Best-effort by design: the seller's status update must not fail just
 * because a notification could not be inserted. Callers should not rely on
 * the notification being created.
 */
export async function createEnquiryResponseNotification(enquiry) {
  if (!enquiry?.buyer) return null;

  await connectToDatabase();

  try {
    return await Notification.create({
      recipient: enquiry.buyer,
      kind: "enquiry_response",
      enquiry: enquiry._id,
      listing: enquiry.listing,
    });
  } catch (error) {
    console.error("[CampusCart] Could not create enquiry-response notification", error?.message);
    return null;
  }
}

/** Paginated notification inbox, newest first, with a population for render. */
export async function getNotifications(
  sellerId,
  { page = 1, limit = DEFAULT_PAGE_SIZE } = {}
) {
  await connectToDatabase();

  const recipient = requireAccountId(sellerId);

  const total = await Notification.countDocuments({ recipient });
  const { page: requestedPage, limit: pageSize } = parsePagination(
    page,
    limit,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );
  const window = buildPagination(total, requestedPage, pageSize);

  const items = await Notification.find({ recipient })
    .sort({ createdAt: -1 })
    .skip(window.skip)
    .limit(window.limit)
    .populate({ path: "listing", select: LISTING_SUBSELECT })
    .populate({ path: "enquiry", select: ENQUIRY_SUBSELECT });

  const { skip, ...meta } = window;
  const unread = await Notification.countDocuments({ recipient, readAt: null });
  return { items, unread, ...meta };
}

/** How many notifications the account has not seen yet. */
export async function getUnreadNotificationCount(sellerId) {
  await connectToDatabase();

  const recipient = requireAccountId(sellerId);
  return Notification.countDocuments({ recipient, readAt: null });
}

/** Marks one notification read. Safe to call repeatedly. */
export async function markNotificationSeen(sellerId, notificationId) {
  await connectToDatabase();

  const recipient = requireAccountId(sellerId);
  const id = requireObjectId(notificationId, "notification id");

  const result = await Notification.updateOne(
    { _id: id, recipient, readAt: null },
    { $set: { readAt: new Date() } }
  );

  if (result.matchedCount === 0) {
    const exists = await Notification.exists({ _id: id, recipient });
    if (!exists) {
      throw new ServiceError("Notification not found", {
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }
  }

  return { marked: (result.modifiedCount ?? 0) > 0 };
}

/** Marks every unread notification for the account as read. */
export async function markAllNotificationsSeen(sellerId) {
  await connectToDatabase();

  const recipient = requireAccountId(sellerId);
  const result = await Notification.updateMany(
    { recipient, readAt: null },
    { $set: { readAt: new Date() } }
  );

  return { marked: result.modifiedCount ?? 0 };
}

const notificationService = {
  createEnquiryResponseNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationSeen,
  markAllNotificationsSeen,
};

export default notificationService;
