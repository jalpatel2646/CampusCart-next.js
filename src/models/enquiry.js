import mongoose, { Schema } from "mongoose";
import { ENQUIRY_STATUSES } from "../lib/constants.js";
import Listing from "./listing.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MAX_PRICE = 10000000;

/**
 * Enquiry / offer document.
 * Many enquiries belong to one listing (Enquiry.listing → Listing._id).
 * A seller can accept, reject, or close an enquiry exactly once.
 * `buyer` links to the account when the buyer is signed in; guests keep
 * only the typed buyerEmail.
 */
const enquirySchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "A listing reference is required"],
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      default: null,
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
      trim: true,
      minlength: [2, "Buyer name must be at least 2 characters"],
      maxlength: [80, "Buyer name must be at most 80 characters"],
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer email is required"],
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, "Enter a valid email address"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: [1, "Message cannot be empty"],
      maxlength: [1000, "Message must be at most 1000 characters"],
    },
    offerPrice: {
      type: Number,
      min: [0, "Offer cannot be negative"],
      max: [MAX_PRICE, "Offer is unrealistically high"],
      validate: {
        validator(value) {
          return value === undefined || value === null || Number.isFinite(Number(value));
        },
        message: "Enter a valid offer amount",
      },
    },
    status: {
      type: String,
      enum: {
        values: ENQUIRY_STATUSES,
        message: "Status must be one of: Pending, Accepted, Rejected, Closed",
      },
      default: "Pending",
    },
    sellerResponse: {
      type: String,
      trim: true,
      maxlength: [1000, "Seller response must be at most 1000 characters"],
      default: "",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

/**
 * Referential integrity: an enquiry must point at a real listing.
 * Runs only on create / when the listing reference changes.
 */
enquirySchema.pre("validate", async function ensureListingExists() {
  if (!this.isNew && !this.isModified("listing")) return;
  if (!this.listing) return;
  const exists = await Listing.exists({ _id: this.listing });
  if (!exists) {
    this.invalidate("listing", "Referenced listing does not exist");
  }
});

/* Indexes for the seller enquiry inbox and the buyer enquiry outbox. */
enquirySchema.index({ listing: 1, status: 1, createdAt: -1 }, { name: "enquiry_listing_status" });
enquirySchema.index({ buyerEmail: 1, createdAt: -1 }, { name: "enquiry_buyer_recent" });
enquirySchema.index({ buyer: 1, createdAt: -1 }, { name: "enquiry_buyer_account_recent" });

export const Enquiry =
  mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);

export default Enquiry;
