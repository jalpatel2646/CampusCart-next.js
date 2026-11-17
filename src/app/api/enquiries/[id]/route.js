import { ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { assertOwner } from "@/lib/ownership";
import { requireSellerSession } from "@/lib/session";
import { enquiryStatusSchema, validationDetails } from "@/lib/validation/server";
import { serializeEnquiry } from "@/lib/serializers";
import { getEnquiryById, updateEnquiryStatus } from "@/services/enquiry.service";

export const PATCH = withApi(async (request, context) => {
  const { id } = await context.params;
  const sellerId = await requireSellerSession();

  const existing = await getEnquiryById(id);
  assertOwner(existing.listing?.seller, sellerId, "You do not manage enquiries for this listing");

  const parsed = enquiryStatusSchema.safeParse(await readJson(request));
  if (!parsed.success) {
    throw new ServiceError("Please check the response", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  const enquiry = await updateEnquiryStatus(id, parsed.data.status, {
    sellerResponse: parsed.data.sellerResponse,
  });

  return ok(serializeEnquiry(enquiry), {
    message: `Enquiry marked ${parsed.data.status.toLowerCase()}`,
  });
});
