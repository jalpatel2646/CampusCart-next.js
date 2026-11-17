import mongoose, { Schema } from "mongoose";

/**
 * Notification document.
 * Delivered to an account when the seller acts on an enquiry the account
 * submitted. Read state is a single watermarked layout so the navbar can
 * show a cheap unread badge.
 */
const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Seller",
      required: [true, "A recipient is required"],
    },
    kind: {
      type: String,
      enum: ["enquiry_response"],
      default: "enquiry_response",
    },
    enquiry: {
      type: Schema.Types.ObjectId,
      ref: "Enquiry",
      required: [true, "An enquiry reference is required"],
    },
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: [true, "A listing reference is required"],
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    strict: "throw",
  }
);

notificationSchema.index(
  { recipient: 1, readAt: 1, createdAt: -1 },
  { name: "notification_unread_recent" }
);
notificationSchema.index(
  { recipient: 1, createdAt: -1 },
  { name: "notification_recipient_recent" }
);

export const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
