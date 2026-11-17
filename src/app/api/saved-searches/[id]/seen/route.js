import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { serializeSavedSearch } from "@/lib/serializers";
import { markSavedSearchSeen } from "@/services/saved-search.service";

export const POST = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();

  const savedSearch = await markSavedSearchSeen(sellerId, id);
  return ok(serializeSavedSearch(savedSearch), { message: "Marked as seen" });
});
