import { z } from "zod";
import { CONTACT_PREFERENCES } from "@/lib/constants";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const password = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters");

const optionalText = (max, message) =>
  z.string().trim().max(max, message).optional().or(z.literal(""));

/** Account fields accepted by the signup API. */
export const signupSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Your name must be at least 2 characters")
    .max(80, "Your name must be at most 80 characters"),
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  phone: optionalText(20, "Phone number must be at most 20 characters"),
  contactPreference: z.enum(CONTACT_PREFERENCES, {
    message: "Choose a contact preference",
  }),
  password,
});

/** Credentials accepted by the login API. */
export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().regex(EMAIL, "Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

/** Browser form schema: signup plus password confirmation. */
export const signupFormSchema = signupSchema
  .extend({ confirmPassword: password })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const EMPTY_SIGNUP_FORM = {
  name: "",
  email: "",
  phone: "",
  contactPreference: "email",
  password: "",
  confirmPassword: "",
};

export const EMPTY_LOGIN_FORM = {
  email: "",
  password: "",
};
