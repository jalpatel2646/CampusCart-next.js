"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AlertCircle, Loader2, Save, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { Select } from "@/components/common/Select";
import { Textarea } from "@/components/common/Textarea";
import { ImageUploader } from "@/components/listings/ImageUploader";
import { createListing, updateListing, assistClassify, assistDescribe } from "@/lib/api";
import {
  LISTING_TYPES,
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
} from "@/lib/constants";
import {
  EMPTY_LISTING_FORM,
  listingFormSchema,
  listingToFormValues,
  toListingPayload,
} from "@/lib/validation/listing";
import { cn } from "@/utils/cn";

const SECTION_CLASS =
  "space-y-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)] sm:p-6";

/**
 * Shared create/edit listing form (FR-010..FR-024).
 * The seller is taken from the signed-in account on the server.
 */
export function ListingForm({ mode = "create", listing = null, assistEnabled = false }) {
  const router = useRouter();
  const [formError, setFormError] = useState("");
  const [formDetails, setFormDetails] = useState([]);
  const [imagesUploading, setImagesUploading] = useState(false);
  const [assistBusy, setAssistBusy] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: listing ? listingToFormValues(listing) : EMPTY_LISTING_FORM,
    mode: "onTouched",
  });

  const listingType = useWatch({ control, name: "listingType" });
  const images = useWatch({ control, name: "images" }) ?? [];
  const description = useWatch({ control, name: "description" }) ?? "";
  const name = useWatch({ control, name: "name" }) ?? "";
  const category = useWatch({ control, name: "category" }) ?? "";
  const condition = useWatch({ control, name: "condition" }) ?? "";
  const price = useWatch({ control, name: "price" });
  const isEdit = mode === "edit";
  const assistTitle = assistEnabled
    ? "Uses AI on the current item details. Review before saving."
    : "AI assist is not configured on this server (OPENROUTER_API_KEY is missing).";

  async function handleGenerateDescription() {
    if (assistBusy) return;
    if (name.trim().length < 3) {
      toast.error("Add a product name first (at least 3 characters)");
      return;
    }
    if (description.trim().length > 0) {
      toast.info("Keeping your existing description — clear it to regenerate");
      return;
    }

    setAssistBusy("describe");
    try {
      const result = await assistDescribe({
        name,
        category,
        condition,
        listingType,
        price: listingType === "For Sale" ? price : 0,
      });
      setValue("description", result?.description ?? "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success("Description generated — review it before publishing");
    } catch (error) {
      toast.error(error.message || "Could not generate a description");
    } finally {
      setAssistBusy("");
    }
  }

  async function handleSuggestCategory() {
    if (assistBusy) return;
    if (name.trim().length < 3) {
      toast.error("Add a product name first (at least 3 characters)");
      return;
    }

    setAssistBusy("classify");
    try {
      const result = await assistClassify({ name, description });
      setValue("category", result?.category ?? "Other", {
        shouldValidate: true,
        shouldDirty: true,
      });
      toast.success(`Suggested category: ${result?.category ?? "Other"}`);
    } catch (error) {
      toast.error(error.message || "Could not suggest a category");
    } finally {
      setAssistBusy("");
    }
  }

  async function onSubmit(values) {
    setFormError("");
    setFormDetails([]);
    const payload = toListingPayload(values);

    try {
      if (isEdit) {
        await updateListing(listing._id, payload);
        toast.success("Listing updated");
        router.push(`/product/${listing._id}`);
      } else {
        const created = await createListing(payload);
        toast.success("Listing published");
        router.push(created?._id ? `/product/${created._id}` : "/marketplace");
      }
    } catch (error) {
      setFormError(error.message);
      setFormDetails(Array.isArray(error.details) ? error.details : []);
      toast.error(isEdit ? "Could not update the listing" : "Could not publish the listing");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {formError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] px-4 py-3 text-sm text-[var(--color-error)]"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-medium">Could not save the listing</p>
            <p className="mt-0.5 text-xs">{formError}</p>
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

      <section className={SECTION_CLASS}>
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            What are you listing?
          </h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Clear photos and honest details sell faster.
          </p>
        </div>

        <Input
          label="Product name"
          required
          placeholder="e.g. Casio FX-991 Scientific Calculator"
          {...register("name")}
          error={errors.name?.message}
        />

        <div>
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="listing-description"
              className="block text-sm font-medium text-[var(--color-text-primary)]"
            >
              Description <span className="text-[var(--color-error)] ml-0.5">*</span>
            </label>
            <button
              type="button"
              disabled={!assistEnabled || assistBusy !== ""}
              onClick={handleGenerateDescription}
              title={assistTitle}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors duration-150 hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assistBusy === "describe" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              Generate with AI
            </button>
          </div>
          <div className="mt-1.5">
            <Textarea
              id="listing-description"
              aria-label="Description"
              required
              rows={5}
              placeholder="Condition, what's included, why you're selling…"
              helperText={`${description.length}/2000 characters`}
              {...register("description")}
              error={errors.description?.message}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor="listing-category"
                className="block text-sm font-medium text-[var(--color-text-primary)]"
              >
                Category <span className="text-[var(--color-error)] ml-0.5">*</span>
              </label>
              <button
                type="button"
                disabled={!assistEnabled || assistBusy !== ""}
                onClick={handleSuggestCategory}
                title={assistTitle}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-[var(--color-primary)] transition-colors duration-150 hover:bg-[var(--color-primary-soft)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assistBusy === "classify" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                AI suggest
              </button>
            </div>
            <div className="mt-1.5">
              <Select
                id="listing-category"
                aria-label="Category"
                placeholder="Choose a category"
                options={PRODUCT_CATEGORIES}
                {...register("category")}
                error={errors.category?.message}
              />
            </div>
          </div>
          <Select
            label="Condition"
            required
            placeholder="Choose a condition"
            options={PRODUCT_CONDITIONS}
            {...register("condition")}
            error={errors.condition?.message}
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-[var(--color-text-primary)]">
            Listing type <span className="text-[var(--color-error)]">*</span>
          </legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {LISTING_TYPES.map((type) => (
              <label
                key={type}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm text-[var(--color-text-primary)] transition-colors duration-150",
                  "hover:border-[var(--color-border-hover)]",
                  "has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-soft)]"
                )}
              >
                <input
                  type="radio"
                  value={type}
                  {...register("listingType")}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                />
                {type}
              </label>
            ))}
          </div>
          {errors.listingType && (
            <p className="mt-1.5 text-xs text-[var(--color-error)]">{errors.listingType.message}</p>
          )}
        </fieldset>

        {listingType === "For Sale" ? (
          <Input
            label="Price (₹)"
            type="number"
            min="0"
            step="1"
            inputMode="numeric"
            required
            placeholder="e.g. 750"
            helperText="Buyers can still make an offer on the listing page."
            {...register("price")}
            error={errors.price?.message}
          />
        ) : (
          <p className="rounded-lg bg-[var(--color-bg-secondary)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
            {listingType === "Free"
              ? "Free listings are published with a price of ₹0."
              : "Exchange listings have no price — describe the swap you have in mind below."}
          </p>
        )}

        {listingType === "Exchange" && (
          <Textarea
            label="What do you want in exchange?"
            required
            rows={3}
            placeholder="e.g. A scientific calculator or a geometry box in working condition"
            {...register("exchangeDescription")}
            error={errors.exchangeDescription?.message}
          />
        )}

        <Input
          label="Pickup location (optional)"
          placeholder="e.g. Girls Hostel, Library, Main Gate"
          helperText="Where buyers meet you for the handoff. Leave blank for campus-wide."
          maxLength={80}
          {...register("location")}
          error={errors.location?.message}
        />
      </section>

      <section className={SECTION_CLASS}>
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Photos</h2>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            The first photo becomes the cover image on the marketplace.
          </p>
        </div>

        <ImageUploader
          label="Listing photos"
          value={images}
          onChange={(urls) =>
            setValue("images", urls, { shouldValidate: true, shouldDirty: true })
          }
          onUploadingChange={setImagesUploading}
          error={errors.images?.message}
        />
        {imagesUploading && (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Wait for the photos to finish uploading before publishing.
          </p>
        )}
      </section>

      {!isEdit && (
        <p className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 text-xs text-[var(--color-text-secondary)]">
          Buyers will see the name, email, and phone number saved on your CampusCart account.
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
        <Button as={Link} href={isEdit ? `/product/${listing._id}` : "/marketplace"} variant="ghost">
          Cancel
        </Button>
        <Button
          type="submit"
          loading={isSubmitting || imagesUploading}
          disabled={imagesUploading}
          icon={Save}
        >
          {isEdit ? "Save changes" : "Publish listing"}
        </Button>
      </div>

      <p className="text-center text-xs text-[var(--color-text-muted)]">
        By publishing you confirm the details are accurate and the item is yours to sell.
      </p>
    </form>
  );
}
