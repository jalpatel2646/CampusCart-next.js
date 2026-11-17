import { ok, withApi } from "@/lib/http";
import { serializeListing } from "@/lib/serializers";
import { getSimilarListings } from "@/services/listing.service";

export const GET = withApi(async (request, context) => {
  const { id } = await context.params;
  const { searchParams } = new URL(request.url);
  const limit = Number.parseInt(searchParams.get("limit") ?? "4", 10);
  const items = await getSimilarListings(id, { limit });
  return ok(items.map(serializeListing));
});
