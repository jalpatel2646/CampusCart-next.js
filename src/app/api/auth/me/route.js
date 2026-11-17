import { ok, withApi } from "@/lib/http";
import { getSessionSeller } from "@/lib/session";
import { serializeSeller } from "@/lib/serializers";

export const GET = withApi(async () => {
  const seller = await getSessionSeller();
  return ok(serializeSeller(seller));
});
