import { revalidateTag } from "next/cache";
import { ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { assertOwner, referenceId } from "@/lib/ownership";
import { getSellerSession, requireSellerSession } from "@/lib/session";
import { LISTINGS_TAG, SELLERS_TAG } from "@/lib/cache-tags";
import { updateListingSchema, validationDetails } from "@/lib/validation/server";
import { serializeListing } from "@/lib/serializers";
import {
  deleteListing,
  getListingById,
  updateListing,
} from "@/services/listing.service";

export const GET = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await getSellerSession();

  const listing = await getListingById(id, { includeInactive: Boolean(sellerId) });
  const canManage = Boolean(sellerId) && referenceId(listing.seller) === sellerId;

  if (!listing.isActive && !canManage) {
    throw new ServiceError("Listing not found", {
      statusCode: 404,
      code: "NOT_FOUND",
    });
  }

  return ok({
    ...serializeListing(listing),
    canManage,
  });
});

export const PUT = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();
  const existing = await getListingById(id, { includeInactive: true });
  assertOwner(existing.seller, sellerId);

  const parsed = updateListingSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Please check the listing details", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const listing = await updateListing(id, parsed.data);
  revalidateTag(LISTINGS_TAG, { expire: 0 });
  revalidateTag(SELLERS_TAG, { expire: 0 });

  return ok(serializeListing(listing), { message: "Listing updated" });
});

export const DELETE = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();
  const existing = await getListingById(id, { includeInactive: true });
  assertOwner(existing.seller, sellerId);

  await deleteListing(id);
  revalidateTag(LISTINGS_TAG, { expire: 0 });
  revalidateTag(SELLERS_TAG, { expire: 0 });

  return ok({ deleted: true }, { message: "Listing deleted" });
});
