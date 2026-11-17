import { revalidateTag } from "next/cache";
import { created, ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { requireSellerSession } from "@/lib/session";
import { LISTINGS_TAG, SELLERS_TAG } from "@/lib/cache-tags";
import { createListingSchema } from "@/lib/validation/server";
import { validationDetails } from "@/lib/validation/server";
import { serializeListing } from "@/lib/serializers";
import { createListing } from "@/services/listing.service";
import { getMarketplaceData } from "@/lib/data";
import { parseListingParams } from "@/lib/listing-params";

function toFilters(searchParams) {
  const raw = {
    search: searchParams.get("search"),
    category: searchParams.get("category"),
    condition: searchParams.getAll("condition"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    sort: searchParams.get("sort"),
    page: searchParams.get("page"),
  };

  const filters = parseListingParams(raw);
  const limit = Number.parseInt(searchParams.get("limit") ?? "", 10);
  if (Number.isFinite(limit) && limit > 0) filters.limit = Math.min(limit, 50);
  return filters;
}

export const GET = withApi(async (request) => {
  const { searchParams } = new URL(request.url);
  const result = await getMarketplaceData(toFilters(searchParams));
  return ok(result);
});

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "create-listing", limit: 15, windowMs: 60 * 60 * 1000 });

  const sellerId = await requireSellerSession();
  const body = await readJson(request);
  const parsed = createListingSchema.safeParse(body);
  if (!parsed.success) {
    throw new ServiceError("Please check the listing details", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const listing = await createListing({ ...parsed.data, seller: sellerId });

  revalidateTag(LISTINGS_TAG, "max");
  revalidateTag(SELLERS_TAG, "max");

  return created(serializeListing(listing), "Listing published");
});
