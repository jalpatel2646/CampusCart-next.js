import { created, ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { requireSellerSession } from "@/lib/session";
import { serializeFavorite } from "@/lib/serializers";
import { addFavorite, getFavorites } from "@/services/favorite.service";

export const GET = withApi(async () => {
  const sellerId = await requireSellerSession();

  const result = await getFavorites(sellerId, { limit: 100 });
  return ok({
    ...result,
    items: result.items.map(serializeFavorite),
  });
});

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "favorite", limit: 60, windowMs: 60 * 60 * 1000 });

  const sellerId = await requireSellerSession();
  const body = await readJson(request);
  const listing = typeof body?.listing === "string" ? body.listing.trim() : "";

  if (!listing) {
    throw new ServiceError("Choose a listing to save", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const favorite = await addFavorite({ buyerId: sellerId, listing });
  return created(serializeFavorite(favorite), "Saved to favourites");
});
