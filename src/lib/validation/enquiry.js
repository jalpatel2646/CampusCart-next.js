import { z } from "zod";

/**
 * Enquiry / offer schema (FR-060..FR-062).
 */
export const enquiryFormSchema = z.object({
  buyerName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name must be at most 80 characters"),
  buyerEmail: z.email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be at most 1000 characters"),
  offerPrice: z.union([
    z.literal(""),
    z.coerce
      .number({ message: "Enter a valid amount" })
      .min(0, "Offer cannot be negative")
      .max(10000000, "Offer is unrealistically high"),
  ]),
});

export const EMPTY_ENQUIRY_FORM = {
  buyerName: "",
  buyerEmail: "",
  message: "",
  offerPrice: "",
};

export function toEnquiryPayload(values, listingId) {
  return {
    listing: listingId,
    buyerName: values.buyerName.trim(),
    buyerEmail: values.buyerEmail.trim().toLowerCase(),
    message: values.message.trim(),
    ...(values.offerPrice === "" ? {} : { offerPrice: Number(values.offerPrice) }),
  };
}
