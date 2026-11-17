import { created, ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { requireSellerSession } from "@/lib/session";
import { savedSearchSchema, validationDetails } from "@/lib/validation/server";
import { serializeSavedSearch } from "@/lib/serializers";
import { createSavedSearch, listSavedSearches } from "@/services/saved-search.service";

export const GET = withApi(async () => {
  const sellerId = await requireSellerSession();

  const items = await listSavedSearches(sellerId, { limit: 20 });
  return ok({ items: items.map((item) => serializeSavedSearch(item)) });
});

export const POST = withApi(async (request) => {
  rateLimit(request, {
    name: "saved-search",
    limit: 30,
    windowMs: 60 * 60 * 1000,
  });

  const sellerId = await requireSellerSession();
  const body = await readJson(request);
  const parsed = savedSearchSchema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new ServiceError("Please check the search details", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const savedSearch = await createSavedSearch(sellerId, parsed.data);
  return created(serializeSavedSearch(savedSearch), "Search saved");
});
