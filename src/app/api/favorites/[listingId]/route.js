import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { removeFavorite, isFavorite } from "@/services/favorite.service";

export const GET = withApi(async (request, context) => {
  const { listingId } = await context.params;
  const sellerId = await requireSellerSession();

  return ok({ favorite: await isFavorite(sellerId, listingId) });
});

export const DELETE = withApi(async (request, context) => {
  const { listingId } = await context.params;
  const sellerId = await requireSellerSession();

  const result = await removeFavorite({ buyerId: sellerId, listing: listingId });
  return ok(result, { message: result.removed ? "Removed from favourites" : "Already removed" });
});
