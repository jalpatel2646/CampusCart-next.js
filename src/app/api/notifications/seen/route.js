import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { markAllNotificationsSeen } from "@/services/notification.service";

export const POST = withApi(async () => {
  const sellerId = await requireSellerSession();

  const result = await markAllNotificationsSeen(sellerId);
  return ok(result, {
    message: result.marked > 0 ? "All notifications marked as seen" : "Nothing to mark",
  });
});
