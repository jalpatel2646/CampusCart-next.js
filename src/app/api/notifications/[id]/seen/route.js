import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { markNotificationSeen } from "@/services/notification.service";

export const POST = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();

  const result = await markNotificationSeen(sellerId, id);
  return ok(null, { message: result.marked ? "Marked as seen" : "Already seen" });
});
