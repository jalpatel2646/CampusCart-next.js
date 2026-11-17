import { revalidateTag } from "next/cache";
import { ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { assertOwner } from "@/lib/ownership";
import { requireSellerSession } from "@/lib/session";
import { LISTINGS_TAG, SELLERS_TAG } from "@/lib/cache-tags";
import { listingStatusSchema, validationDetails } from "@/lib/validation/server";
import { serializeListing } from "@/lib/serializers";
import { getListingById, updateListing } from "@/services/listing.service";

export const PATCH = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();
  const existing = await getListingById(id, { includeInactive: true });

  assertOwner(existing.seller, sellerId);

  const parsed = listingStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Choose a valid status", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const listing = await updateListing(id, { status: parsed.data.status });
  revalidateTag(LISTINGS_TAG, { expire: 0 });
  revalidateTag(SELLERS_TAG, { expire: 0 });

  return ok(serializeListing(listing), { message: `Listing marked ${parsed.data.status}` });
});
