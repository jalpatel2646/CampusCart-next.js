"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { createSavedSearch } from "@/lib/api";
import {
  describeSavedSearch,
  savedSearchFromParams,
  suggestSavedSearchName,
} from "@/lib/listing-params";

/**
 * Saves the current /marketplace URL filters as a named search.
 * Guests are sent to the login page and returned after signing in.
 */
export function SaveSearchButton() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  // The marketplace keeps filters in the URL, so the query string is the
  // single source of truth for what is about to be saved.
  const values = savedSearchFromParams({
    search: searchParams.get("search"),
    category: searchParams.get("category"),
    condition: searchParams.getAll("condition"),
    minPrice: searchParams.get("minPrice"),
    maxPrice: searchParams.get("maxPrice"),
    sort: searchParams.get("sort"),
  });

  const labels = describeSavedSearch(values);
  if (labels.length === 0) return null;

  function toggle() {
    if (!open) setName(suggestSavedSearchName(values));
    setOpen((current) => !current);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast.error("Give your search a name of at least 2 characters");
      return;
    }

    setSaving(true);
    try {
      await createSavedSearch({ ...values, name: trimmed });
      toast.success("Search saved", {
        description: "New matches will appear under Dashboard → Searches.",
      });
      setOpen(false);
    } catch (error) {
      if (error.status === 401) {
        const query = searchParams.toString();
        const next = encodeURIComponent(query ? `${pathname}?${query}` : pathname);
        router.push(`/login?next=${next}`);
        return;
      }
      if (error.status === 409) {
        toast.error("You have saved 20 searches. Remove one to save another.");
        return;
      }
      toast.error(error.message || "Could not save this search");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        icon={BookmarkPlus}
        onClick={toggle}
        aria-expanded={open}
        aria-controls="save-search-panel"
      >
        Save this search
      </Button>

      {open && (
        <form
          id="save-search-panel"
          onSubmit={handleSubmit}
          className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 text-left shadow-[var(--shadow-card-hover)]"
        >
          <label
            htmlFor="saved-search-name"
            className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
          >
            Name this search
          </label>
          <Input
            id="saved-search-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={80}
            className="mt-2"
            aria-label="Name for this saved search"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
            {labels.join(" · ")}
          </p>
          <div className="mt-3 flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={saving}>
              Save search
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
