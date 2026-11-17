import mongoose, { Schema } from "mongoose";
import {
  LISTING_SORTS,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "../lib/constants.js";

const MAX_PRICE = 10000000;
const MAX_NAME = 80;

/**
 * Saved search document.
 * One account owns many saved searches (SavedSearch.seller → Seller._id).
 * `lastSeenAt` is the watermark used to count listings created since the
 * account last checked its matches.
 */
const savedSearchSchema = new Schema(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "A seller reference is required"],
    },
    name: {
      type: String,
      required: [true, "Enter a name for this search"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [MAX_NAME, "Name must be at most 80 characters"],
    },
    search: {
      type: String,
      trim: true,
      maxlength: [100, "Search must be at most 100 characters"],
      default: "",
    },
    categories: {
      type: [String],
      default: [],
      validate: {
        validator(values) {
          return values.every((value) => PRODUCT_CATEGORIES.includes(value));
        },
        message: "Categories must be valid product categories",
      },
    },
    conditions: {
      type: [String],
      default: [],
      validate: {
        validator(values) {
          return values.every((value) => PRODUCT_CONDITIONS.includes(value));
        },
        message: "Conditions must be valid product conditions",
      },
    },
    minPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
      max: [MAX_PRICE, "Price is unrealistically high"],
      default: null,
    },
    maxPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
      max: [MAX_PRICE, "Price is unrealistically high"],
      default: null,
    },
    sort: {
      type: String,
      enum: {
        values: LISTING_SORTS,
        message: "Sort must be one of: newest, price_asc, price_desc, relevance",
      },
      default: "newest",
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

savedSearchSchema.pre("validate", function normalizeSavedSearch() {
  if (typeof this.search === "string") {
    this.search = this.search.trim();
  }
  if (Array.isArray(this.categories)) {
    this.categories = [...new Set(this.categories)];
  }
  if (Array.isArray(this.conditions)) {
    this.conditions = [...new Set(this.conditions)];
  }
});

savedSearchSchema.index(
  { seller: 1, createdAt: -1 },
  { name: "saved_search_seller_recent" }
);

export const SavedSearch =
  mongoose.models.SavedSearch || mongoose.model("SavedSearch", savedSearchSchema);

export default SavedSearch;
