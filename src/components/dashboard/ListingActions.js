"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { LISTING_STATUSES } from "@/lib/constants";
import {
  deactivateListing,
  deleteListing,
  reactivateListing,
  setListingStatus,
} from "@/lib/api";

const STATUS_VARIANT = {
  Available: "success",
  Reserved: "warning",
  Sold: "error",
};

/** Status, visibility, edit, and delete controls for one seller listing. */
export function ListingActions({ listing }) {
  const router = useRouter();
  const [pendingStatus, setPendingStatus] = useState(null);
  const [busy, setBusy] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const status = pendingStatus ?? listing.status;

  async function changeStatus(nextStatus) {
    if (nextStatus === status || busy) return;
    setBusy("status");
    try {
      await setListingStatus(listing._id, nextStatus);
      setPendingStatus(nextStatus);
      toast.success(`Listing marked ${nextStatus.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not update the status");
      setPendingStatus(null);
    } finally {
      setBusy("");
    }
  }

  async function toggleVisibility() {
    setBusy("visibility");
    try {
      if (listing.isActive) {
        await deactivateListing(listing._id);
        toast.success("Listing deactivated");
      } else {
        await reactivateListing(listing._id);
        toast.success("Listing reactivated");
      }
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not change the listing visibility");
    } finally {
      setBusy("");
    }
  }

  async function handleDelete() {
    setBusy("delete");
    try {
      await deleteListing(listing._id);
      toast.success("Listing deleted");
      setConfirmDelete(false);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not delete the listing");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!listing.isActive && (
        <Badge variant="default" size="sm">
          Inactive
        </Badge>
      )}

      <label className="sr-only" htmlFor={`status-${listing._id}`}>
        Change status for {listing.name}
      </label>
      <select
        id={`status-${listing._id}`}
        value={status}
        disabled={busy !== "" || status === "Sold"}
        onChange={(event) => changeStatus(event.target.value)}
        className="h-9 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-2.5 text-sm text-[var(--color-text-primary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {LISTING_STATUSES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <Button as={Link} href={`/edit-listing/${listing._id}`} variant="outline" size="sm" icon={Pencil}>
        Edit
      </Button>

      {listing.status !== "Sold" || listing.isActive ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={listing.isActive ? EyeOff : Eye}
          loading={busy === "visibility"}
          disabled={busy !== ""}
          onClick={toggleVisibility}
        >
          {listing.isActive ? "Deactivate" : "Reactivate"}
        </Button>
      ) : null}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        icon={Trash2}
        className="text-[var(--color-error)] hover:bg-[var(--color-error-bg)] hover:text-[var(--color-error)]"
        disabled={busy !== ""}
        onClick={() => setConfirmDelete(true)}
      >
        Delete
      </Button>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Delete this listing?"
        description="This permanently removes the listing, its photos, and its saved favourites. Enquiries stay in your history."
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" loading={busy === "delete"} onClick={handleDelete}>
            Delete listing
          </Button>
        </div>
      </Modal>

      <span className="sr-only" aria-live="polite">
        {busy ? "Updating listing" : ""}
      </span>
    </div>
  );
}
