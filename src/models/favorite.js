import mongoose, { Schema } from "mongoose";
import Listing from "./listing.js";

/**
 * Favorite document.
 * One saved listing per buyer; enforced by the compound unique index.
 * Many favorites belong to one listing (Favorite.listing → Listing._id).
 */
const favoriteSchema = new Schema(
  {
    buyerId: {
      type: String,
      required: [true, "Buyer id is required"],
      trim: true,
      maxlength: [120, "Buyer id is too long"],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "A listing reference is required"],
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

/**
 * Referential integrity: a favorite must point at a real listing.
 * Runs only on create / when the listing reference changes.
 */
favoriteSchema.pre("validate", async function ensureListingExists() {
  if (!this.isNew && !this.isModified("listing")) return;
  if (!this.listing) return;
  const exists = await Listing.exists({ _id: this.listing });
  if (!exists) {
    this.invalidate("listing", "Referenced listing does not exist");
  }
});

/* One saved listing per account. */
favoriteSchema.index(
  { buyerId: 1, listing: 1 },
  { name: "favorite_buyer_listing_unique", unique: true }
);

export const Favorite =
  mongoose.models.Favorite || mongoose.model("Favorite", favoriteSchema);

export default Favorite;
