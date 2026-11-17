import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { serializeNotification } from "@/lib/serializers";
import { getNotifications } from "@/services/notification.service";

export const GET = withApi(async (request) => {
  const sellerId = await requireSellerSession();
  const { searchParams } = new URL(request.url);

  const result = await getNotifications(sellerId, {
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 50,
  });

  return ok({
    ...result,
    items: result.items.map(serializeNotification),
  });
});
