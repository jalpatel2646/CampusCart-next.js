import { ok, withApi } from "@/lib/http";
import { requireSellerSession } from "@/lib/session";
import { getDashboardData } from "@/lib/data";

export const GET = withApi(async () => {
  const sellerId = await requireSellerSession();
  return ok(await getDashboardData(sellerId));
});
