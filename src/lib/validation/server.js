import { z } from "zod";
import {
  ENQUIRY_STATUSES,
  LISTING_STATUSES,
  LISTING_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "@/lib/constants";

const MAX_PRICE = 10000000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const imageUrl = z
  .string()
  .trim()
  .refine((value) => {
    if (!value) return false;
    if (value.startsWith("/")) return !value.startsWith("//");
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }, "Every image must be a valid image URL");

const optionalText = (max, message) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

const listingFields = {
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be at most 2000 characters"),
  category: z.enum(PRODUCT_CATEGORIES, { message: "Choose a valid category" }),
  condition: z.enum(PRODUCT_CONDITIONS, { message: "Choose a valid condition" }),
  listingType: z.enum(LISTING_TYPES, { message: "Choose a valid listing type" }),
  price: z.coerce
    .number({ message: "Enter a valid price" })
    .min(0, "Price cannot be negative")
    .max(MAX_PRICE, "Price is unrealistically high"),
  exchangeDescription: optionalText(
    500,
    "Exchange details must be at most 500 characters"
  ),
  images: z
    .array(imageUrl)
    .min(1, "Add at least one image")
    .max(5, "You can add up to 5 images"),
};

function refineListing(data, ctx) {
  if (data.listingType === "For Sale" && Number(data.price) <= 0) {
    ctx.addIssue({
      code: "custom",
      path: ["price"],
      message: "For Sale listings need a price greater than 0",
    });
  }
  if (
    data.listingType === "Exchange" &&
    (data.exchangeDescription ?? "").trim().length === 0
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["exchangeDescription"],
      message: "Describe what you want in exchange",
    });
  }
}

export const createListingSchema = z
  .object(listingFields)
  .superRefine(refineListing);

export const updateListingSchema = z
  .object(listingFields)
  .superRefine(refineListing);

export const enquirySchema = z.object({
  listing: z.string().trim().min(1, "A listing is required"),
  buyerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  buyerEmail: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
  offerPrice: z
    .union([
      z.literal(""),
      z.coerce
        .number({ message: "Enter a valid amount" })
        .min(0, "Offer cannot be negative")
        .max(MAX_PRICE, "Offer is unrealistically high"),
    ])
    .optional(),
});

export const listingStatusSchema = z.object({
  status: z.enum(LISTING_STATUSES, { message: "Choose a valid status" }),
});

export const enquiryStatusSchema = z.object({
  status: z.enum(ENQUIRY_STATUSES, { message: "Choose a valid status" }),
  sellerResponse: optionalText(1000, "Response must be at most 1000 characters"),
});

/** Converts a ZodError into the API's `errors` array. */
export function validationDetails(error) {
  return error.issues.map((issue) => issue.message);
}
