"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/Textarea";
import { createEnquiry } from "@/lib/api";
import { EMPTY_ENQUIRY_FORM, enquiryFormSchema, toEnquiryPayload } from "@/lib/validation/enquiry";

/**
 * Buyer enquiry form with an optional price offer (FR-060..FR-062).
 */
export function EnquiryForm({ listingId, listingName }) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(enquiryFormSchema),
    defaultValues: EMPTY_ENQUIRY_FORM,
    mode: "onTouched",
  });

  async function onSubmit(values) {
    setFormError("");
    try {
      await createEnquiry(toEnquiryPayload(values, listingId));
      toast.success("Enquiry sent — the seller will get back to you.");
      reset(EMPTY_ENQUIRY_FORM);
    } catch (error) {
      setFormError(error.message);
      toast.error("Could not send your enquiry");
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-labelledby="enquiry-heading"
      className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)]"
    >
      <div>
        <h2
          id="enquiry-heading"
          className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]"
        >
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          Send an enquiry
        </h2>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Ask about {listingName} or offer a price. Your name and email are shared with the
          seller.
        </p>
      </div>

      <Input
        label="Your name"
        required
        autoComplete="name"
        placeholder="e.g. Riya Sharma"
        {...register("buyerName")}
        error={errors.buyerName?.message}
      />

      <Input
        label="Email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@campus.edu"
        {...register("buyerEmail")}
        error={errors.buyerEmail?.message}
      />

      <Textarea
        label="Message"
        required
        rows={3}
        placeholder="Is this still available? Would you consider ₹…?"
        {...register("message")}
        error={errors.message?.message}
      />

      <Input
        label="Offer price (optional)"
        type="number"
        min="0"
        step="1"
        inputMode="numeric"
        placeholder="₹"
        helperText="Leave blank if you just want to ask a question."
        {...register("offerPrice")}
        error={errors.offerPrice?.message}
      />

      {formError && (
        <p
          role="alert"
          className="rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] px-3 py-2 text-xs text-[var(--color-error)]"
        >
          {formError}
        </p>
      )}

      <Button type="submit" fullWidth loading={isSubmitting} icon={Send}>
        Send enquiry
      </Button>
    </form>
  );
}
