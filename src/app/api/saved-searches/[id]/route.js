import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { deleteSavedSearch } from "@/services/saved-search.service";

export const DELETE = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();

  const result = await deleteSavedSearch(sellerId, id);
  return ok(result, {
    message: result.removed ? "Saved search removed" : "Already removed",
  });
});
