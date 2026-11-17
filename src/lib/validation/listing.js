import { z } from "zod";
import {
  LISTING_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "@/lib/constants";

const optionalText = (max, message) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

/**
 * Listing form schema. Mirrors FR-011..FR-018 from the PRD.
 * The seller comes from the signed-in account, so it is not part of the form.
 */
export const listingFormSchema = z
  .object({
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
    category: z.enum(PRODUCT_CATEGORIES, { message: "Choose a category" }),
    condition: z.enum(PRODUCT_CONDITIONS, { message: "Choose a condition" }),
    listingType: z.enum(LISTING_TYPES, { message: "Choose a listing type" }),
    price: z.coerce
      .number({ message: "Enter a valid price" })
      .min(0, "Price cannot be negative")
      .max(10000000, "Price is unrealistically high"),
    exchangeDescription: optionalText(500, "Exchange details must be at most 500 characters"),
    location: optionalText(80, "Location must be at most 80 characters"),
    images: z
      .array(z.string())
      .min(1, "Add at least one image")
      .max(5, "You can add up to 5 images"),
  })
  .superRefine((data, ctx) => {
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
  });

export const EMPTY_LISTING_FORM = {
  name: "",
  description: "",
  category: "",
  condition: "",
  listingType: "For Sale",
  price: "",
  exchangeDescription: "",
  location: "",
  images: [],
};

/** Maps an existing listing document to form defaults (edit mode). */
export function listingToFormValues(listing) {
  return {
    name: listing.name ?? "",
    description: listing.description ?? "",
    category: listing.category ?? "",
    condition: listing.condition ?? "",
    listingType: listing.listingType ?? "For Sale",
    price: listing.price ?? "",
    exchangeDescription: listing.exchangeDescription ?? "",
    location: listing.location ?? "",
    images: listing.images ?? [],
  };
}

/** Normalises validated form values into the API payload. */
export function toListingPayload(values) {
  const isForSale = values.listingType === "For Sale";

  return {
    name: values.name.trim(),
    description: values.description.trim(),
    category: values.category,
    condition: values.condition,
    listingType: values.listingType,
    price: isForSale ? Number(values.price) : 0,
    exchangeDescription:
      values.listingType === "Exchange" ? (values.exchangeDescription ?? "").trim() : "",
    location: (values.location ?? "").trim(),
    images: values.images,
  };
}
