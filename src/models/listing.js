import mongoose, { Schema } from "mongoose";
import {
  LISTING_STATUSES,
  LISTING_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "../lib/constants.js";

const MAX_PRICE = 10000000;
const MAX_IMAGES = 5;

/** Absolute http(s) URLs or site-relative paths (e.g. /images/products/x.jpg). */
function isValidImageUrl(value) {
  if (typeof value !== "string") return false;
  const url = value.trim();
  if (!url) return false;
  if (url.startsWith("/")) return !url.startsWith("//");
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Listing document.
 * Many listings belong to one seller (Listing.seller → Seller._id).
 * Enquiries and favorites reference a listing.
 */
const listingSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name must be at most 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [2000, "Description must be at most 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      default: 0,
      min: [0, "Price cannot be negative"],
      max: [MAX_PRICE, "Price is unrealistically high"],
      validate: {
        validator(value) {
          if (this.listingType !== "For Sale") return true;
          return Number(value) > 0;
        },
        message: "For Sale listings need a price greater than 0",
      },
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: "Category must be one of: Books, Electronics, Furniture, Stationery, Other",
      },
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      enum: {
        values: PRODUCT_CONDITIONS,
        message: "Condition must be one of: Like New, Good, Fair, Used",
      },
    },
    images: {
      type: [String],
      required: [true, "At least one image is required"],
      validate: [
        {
          validator(images) {
            return Array.isArray(images) && images.length >= 1 && images.length <= MAX_IMAGES;
          },
          message: `Listings need between 1 and ${MAX_IMAGES} images`,
        },
        {
          validator(images) {
            return Array.isArray(images) && images.every(isValidImageUrl);
          },
          message: "Every image must be a valid URL or site-relative path",
        },
      ],
    },
    listingType: {
      type: String,
      required: [true, "Listing type is required"],
      enum: {
        values: LISTING_TYPES,
        message: "Listing type must be one of: For Sale, Free, Exchange",
      },
    },
    exchangeDescription: {
      type: String,
      trim: true,
      maxlength: [500, "Exchange details must be at most 500 characters"],
      default: "",
      validate: {
        validator(value) {
          if (this.listingType !== "Exchange") return true;
          return typeof value === "string" && value.trim().length > 0;
        },
        message: "Describe what you want in exchange",
      },
    },
    status: {
      type: String,
      enum: {
        values: LISTING_STATUSES,
        message: "Status must be one of: Available, Reserved, Sold",
      },
      default: "Available",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "A seller reference is required"],
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

/**
 * Business rules applied before validation:
 * - Free/Exchange listings are normalised to price 0.
 * - Only Exchange listings keep an exchange description.
 */
listingSchema.pre("validate", function normalizeBusinessFields() {
  if (this.listingType && this.listingType !== "For Sale") {
    this.price = 0;
  }
  if (this.listingType && this.listingType !== "Exchange") {
    this.exchangeDescription = "";
  }
  if (typeof this.exchangeDescription === "string") {
    this.exchangeDescription = this.exchangeDescription.trim();
  }
  if (Array.isArray(this.images)) {
    this.images = this.images.map((image) => (typeof image === "string" ? image.trim() : image));
  }
});

/**
 * Sold is terminal, even for direct model writes that bypass the service.
 * The service layer also throws a 409 before reaching this guard.
 */
listingSchema.pre("validate", async function preventSoldReopen() {
  if (this.isNew || !this.isModified("status") || this.status === "Sold") return;
  if (!this._id) return;

  const previous = await this.constructor
    .findById(this._id)
    .select("status")
    .lean();
  if (previous?.status === "Sold") {
    this.invalidate("status", "Sold listings cannot be reopened");
  }
});

/* Indexes for discovery and category browsing. */
listingSchema.index(
  { name: "text", description: "text" },
  { name: "listing_text_search", weights: { name: 5, description: 1 }, default_language: "english" }
);
listingSchema.index({ isActive: 1, status: 1, createdAt: -1 }, { name: "listing_discovery" });
listingSchema.index({ category: 1, status: 1, price: 1 }, { name: "listing_category_price" });
listingSchema.index({ seller: 1, createdAt: -1 }, { name: "listing_seller_recent" });

export const Listing =
  mongoose.models.Listing || mongoose.model("Listing", listingSchema);

export default Listing;
