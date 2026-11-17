import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { markAllSavedSearchesSeen } from "@/services/saved-search.service";

export const POST = withApi(async () => {
  const sellerId = await requireSellerSession();

  const result = await markAllSavedSearchesSeen(sellerId);
  return ok(result, { message: "All searches marked as seen" });
});
