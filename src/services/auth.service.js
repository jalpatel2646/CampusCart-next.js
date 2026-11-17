import { connectToDatabase } from "../lib/mongodb.js";
import { ServiceError, isDuplicateKeyError, normalizeError } from "../lib/errors.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import Seller from "../models/seller.js";

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/** Creates an account. Emails are unique and stored lowercased. */
export async function registerSeller(data = {}) {
  await connectToDatabase();

  const email = normalizeEmail(data.email);
  if (!email) {
    throw new ServiceError("Enter a valid email address", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const passwordHash = await hashPassword(String(data.password ?? ""));

  try {
    return await Seller.create({
      name: data.name,
      email,
      phone: data.phone ?? "",
      contactPreference: data.contactPreference ?? "email",
      passwordHash,
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ServiceError("An account with this email already exists", {
        statusCode: 409,
        code: "EMAIL_IN_USE",
      });
    }
    throw normalizeError(error, "Could not create your account");
  }
}

/** Verifies credentials and returns the seller document. */
export async function authenticateSeller({ email, password } = {}) {
  await connectToDatabase();

  const normalized = normalizeEmail(email);
  if (!normalized || typeof password !== "string" || !password) {
    throw new ServiceError("Enter your email and password", {
      statusCode: 400,
      code: "VALIDATION_ERROR",
    });
  }

  const seller = await Seller.findOne({ email: normalized }).select("+passwordHash");

  // Always run the hash comparison so a missing account takes similar time.
  const valid = await verifyPassword(password, seller?.passwordHash ?? "");
  if (!seller || !valid) {
    throw new ServiceError("Email or password is incorrect", {
      statusCode: 401,
      code: "INVALID_CREDENTIALS",
    });
  }

  return seller;
}

const authService = { registerSeller, authenticateSeller };

export default authService;
