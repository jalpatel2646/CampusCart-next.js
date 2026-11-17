import mongoose, { Schema } from "mongoose";
import { CONTACT_PREFERENCES } from "../lib/constants.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Seller document.
 * One seller owns many listings (Listing.seller → Seller._id).
 */
const sellerSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Seller name is required"],
      trim: true,
      minlength: [2, "Seller name must be at least 2 characters"],
      maxlength: [80, "Seller name must be at most 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Seller email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [EMAIL_PATTERN, "Enter a valid email address"],
    },
    passwordHash: {
      type: String,
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone number must be at most 20 characters"],
      default: "",
    },
    contactPreference: {
      type: String,
      enum: {
        values: CONTACT_PREFERENCES,
        message: "Contact preference must be one of: email, phone, both",
      },
      default: "email",
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

export const Seller =
  mongoose.models.Seller || mongoose.model("Seller", sellerSchema);

export default Seller;
