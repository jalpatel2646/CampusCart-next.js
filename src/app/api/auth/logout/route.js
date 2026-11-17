import { ok, withApi } from "@/lib/http";
import { endSellerSession } from "@/lib/session";

export const POST = withApi(async () => {
  await endSellerSession();
  return ok({ loggedOut: true }, { message: "Signed out" });
});
