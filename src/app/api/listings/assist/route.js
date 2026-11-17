import { z } from "zod";
import { ok, readJson, withApi } from "@/lib/http";
import { ServiceError } from "@/lib/errors";
import { rateLimit } from "@/lib/rate-limit";
import { requireSellerSession } from "@/lib/session";
import {
  LISTING_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "@/lib/constants";
import { validationDetails } from "@/lib/validation/server";
import { describeListing, suggestCategory } from "@/services/assist.service";

const name = z
  .string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .max(100, "Name must be at most 100 characters");
const description = z
  .string()
  .trim()
  .max(1000, "Description must be at most 1000 characters")
  .optional()
  .or(z.literal(""));

const assistSchema = z.discriminatedUnion("mode", [
  z.object({
    mode: z.literal("describe"),
    name,
    category: z.enum(PRODUCT_CATEGORIES).optional().or(z.literal("")),
    condition: z.enum(PRODUCT_CONDITIONS).optional().or(z.literal("")),
    listingType: z.enum(LISTING_TYPES).default("For Sale"),
    price: z.preprocess(
      (value) =>
        value === "" || value === undefined || value === null ? 0 : value,
      z.coerce.number().min(0).max(10000000)
    ),
  }),
  z.object({
    mode: z.literal("classify"),
    name,
    description,
  }),
]);

export const POST = withApi(async (request) => {
  rateLimit(request, { name: "listing-assist", limit: 15, windowMs: 60 * 60 * 1000 });

  await requireSellerSession();

  const body = await readJson(request);
  const parsed = assistSchema.safeParse(body ?? {});
  if (!parsed.success) {
    throw new ServiceError("Please check the assist request", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      details: validationDetails(parsed.error),
    });
  }

  if (parsed.data.mode === "describe") {
    const text = await describeListing(parsed.data);
    return ok({ description: text });
  }

  const { category, fallback } = await suggestCategory({
    name: parsed.data.name,
    description: parsed.data.description,
  });
  return ok({ category, fallback });
});
