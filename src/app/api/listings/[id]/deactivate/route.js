import { revalidateTag } from "next/cache";
import { ok, withApi } from "@/lib/http";
import { assertOwner } from "@/lib/ownership";
import { requireSellerSession } from "@/lib/session";
import { LISTINGS_TAG, SELLERS_TAG } from "@/lib/cache-tags";
import { serializeListing } from "@/lib/serializers";
import { getListingById, updateListing } from "@/services/listing.service";

export const PATCH = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();
  const existing = await getListingById(id, { includeInactive: true });

  assertOwner(existing.seller, sellerId);

  const listing = await updateListing(id, { isActive: false });
  revalidateTag(LISTINGS_TAG, "max");
  revalidateTag(SELLERS_TAG, "max");

  return ok(serializeListing(listing), { message: "Listing deactivated" });
});
