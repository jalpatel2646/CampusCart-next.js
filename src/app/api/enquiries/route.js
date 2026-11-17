import { created, ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { getSellerSession, requireSellerSession } from "@/lib/session";
import { enquirySchema, validationDetails } from "@/lib/validation/server";
import { serializeEnquiry } from "@/lib/serializers";
import { createEnquiry, getEnquiries } from "@/services/enquiry.service";

export const GET = withApi(async (request) => {
  const sellerId = await requireSellerSession();
  const { searchParams } = new URL(request.url);

  if (searchParams.get("sent") === "true") {
    const result = await getEnquiries({
      buyerId: sellerId,
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 50,
    });

    return ok({
      ...result,
      items: result.items.map(serializeEnquiry),
    });
  }

  const result = await getEnquiries({
    sellerId,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ?? 1,
    limit: searchParams.get("limit") ?? 50,
  });

  return ok({
    ...result,
    items: result.items.map(serializeEnquiry),
  });
});

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "create-enquiry", limit: 15, windowMs: 60 * 60 * 1000 });

  const parsed = enquirySchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Please check your enquiry", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const accountId = await getSellerSession();
  const enquiry = await createEnquiry(parsed.data, { accountId });
  return created(serializeEnquiry(enquiry), "Enquiry sent");
});
