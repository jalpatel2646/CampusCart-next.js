import { ServiceError } from "@/lib/errors";

/** Reads the id from a populated document, an ObjectId, or a raw string. */
export function referenceId(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value._id ?? value.id ?? value);
}

/** Throws a 403 unless the given seller owns the referenced resource. */
export function assertOwner(owner, sellerId, message = "You do not manage this listing") {
  if (referenceId(owner) !== String(sellerId)) {
    throw new ServiceError(message, {
      statusCode: 403,
      code: "FORBIDDEN",
    });
  }
}
