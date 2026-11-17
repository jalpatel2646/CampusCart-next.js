"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { signIn, signUp } from "@/lib/api";
import { safeRedirectPath } from "@/lib/redirects";
import {
  EMPTY_LOGIN_FORM,
  EMPTY_SIGNUP_FORM,
  loginSchema,
  signupFormSchema,
} from "@/lib/validation/auth";

const CONTACT_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "both", label: "Email or phone" },
];

/** Email/password sign-in and sign-up form. */
export function AuthForm({ mode = "login", next }) {
  const router = useRouter();
  const isSignup = mode === "signup";
  const [formError, setFormError] = useState("");
  const [formDetails, setFormDetails] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(isSignup ? signupFormSchema : loginSchema),
    defaultValues: isSignup ? EMPTY_SIGNUP_FORM : EMPTY_LOGIN_FORM,
    mode: "onTouched",
  });

  async function onSubmit(values) {
    setFormError("");
    setFormDetails([]);

    try {
      if (isSignup) {
        const { confirmPassword, ...payload } = values;
        await signUp(payload);
        toast.success("Account created — welcome to CampusCart");
      } else {
        await signIn(values);
        toast.success("Signed in");
      }

      router.replace(safeRedirectPath(next));
      router.refresh();
    } catch (error) {
      setFormError(error.message);
      setFormDetails(Array.isArray(error.details) ? error.details : []);
      toast.error(isSignup ? "Could not create your account" : "Could not sign you in");
    }
  }

  const switchHref = `${isSignup ? "/login" : "/signup"}${
    next ? `?next=${encodeURIComponent(next)}` : ""
  }`;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">{formError}</p>
            {formDetails.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs">
                {formDetails.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {isSignup && (
        <Input
          label="Full name"
          required
          autoComplete="name"
          placeholder="e.g. Aarav Mehta"
          {...register("name")}
          error={errors.name?.message}
        />
      )}

      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@campus.edu"
        {...register("email")}
        error={errors.email?.message}
      />

      {isSignup && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Phone (optional)"
            type="tel"
            autoComplete="tel"
            placeholder="+91 98765 43210"
            {...register("phone")}
            error={errors.phone?.message}
          />
          <Select
            label="Preferred contact method"
            options={CONTACT_OPTIONS}
            {...register("contactPreference")}
            error={errors.contactPreference?.message}
          />
        </div>
      )}

      <Input
        label="Password"
        type="password"
        required
        autoComplete={isSignup ? "new-password" : "current-password"}
        placeholder={isSignup ? "At least 8 characters" : "Your password"}
        {...register("password")}
        error={errors.password?.message}
      />

      {isSignup && (
        <Input
          label="Confirm password"
          type="password"
          required
          autoComplete="new-password"
          {...register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />
      )}

      <Button type="submit" fullWidth loading={isSubmitting}>
        {isSignup ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-[var(--color-text-secondary)]">
        {isSignup ? "Already have an account?" : "New to CampusCart?"}{" "}
        <Link
          href={switchHref}
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
