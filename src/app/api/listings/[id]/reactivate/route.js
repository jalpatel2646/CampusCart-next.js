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

  const listing = await updateListing(id, { isActive: true });
  revalidateTag(LISTINGS_TAG, { expire: 0 });
  revalidateTag(SELLERS_TAG, { expire: 0 });

  return ok(serializeListing(listing), { message: "Listing reactivated" });
});
