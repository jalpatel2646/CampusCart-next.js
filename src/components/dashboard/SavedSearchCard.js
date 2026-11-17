"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { formatListedDateLong } from "@/lib/format";
import { describeSavedSearch, savedSearchHref } from "@/lib/listing-params";
import { deleteSavedSearch, markSavedSearchSeen } from "@/lib/api";

/** One saved search: filter chips, counts, and new/delete actions. */
export function SavedSearchCard({ savedSearch }) {
  const router = useRouter();
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const labels = describeSavedSearch(savedSearch);
  const href = savedSearchHref(savedSearch);
  const lastSeen = savedSearch.lastSeenAt
    ? ` · checked ${formatListedDateLong(savedSearch.lastSeenAt)}`
    : "";

  async function viewNew() {
    setBusy("seen");
    try {
      await markSavedSearchSeen(savedSearch._id);
    } catch (error) {
      toast.error(error.message || "Could not update this search");
    } finally {
      setBusy("");
    }
    router.push(href);
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      await deleteSavedSearch(savedSearch._id);
      toast.success("Saved search removed");
      setConfirmDelete(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not remove this search");
    } finally {
      setBusy("");
    }
  }

  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
              {savedSearch.name}
            </h2>
            {savedSearch.newCount > 0 && (
              <Badge variant="accent" size="sm">
                {savedSearch.newCount} new
              </Badge>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {labels.map((label) => (
              <Badge key={label} variant="outline" size="sm">
                {label}
              </Badge>
            ))}
          </div>

          <p className="mt-2 text-xs text-[var(--color-text-muted)]">
            {savedSearch.matchCount} live{" "}
            {savedSearch.matchCount === 1 ? "match" : "matches"}
            {lastSeen}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {savedSearch.newCount > 0 ? (
            <Button
              type="button"
              size="sm"
              icon={Sparkles}
              loading={busy === "seen"}
              disabled={busy !== ""}
              onClick={viewNew}
            >
              View {savedSearch.newCount} new
            </Button>
          ) : (
            <Button
              as={Link}
              href={href}
              variant="outline"
              size="sm"
              iconRight={ArrowRight}
            >
              View matches
            </Button>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon={Trash2}
            disabled={busy !== ""}
            onClick={() => setConfirmDelete(true)}
            className="text-[var(--color-error)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error)]"
            aria-label={`Remove saved search ${savedSearch.name}`}
          >
            Remove
          </Button>
        </div>
      </div>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Remove this saved search?"
        description="Your listings and favourites are not affected — this only stops new-match tracking for this search."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            loading={busy === "delete"}
            onClick={handleDelete}
          >
            Remove search
          </Button>
        </div>
      </Modal>
    </li>
  );
}
