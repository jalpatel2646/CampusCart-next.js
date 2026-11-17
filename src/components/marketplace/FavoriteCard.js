"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { ListingCard } from "@/components/marketplace/ListingCard";
import { removeFavorite } from "@/lib/api";

/** Listing card with a working remove control for the favourites page. */
export function FavoriteCard({ favorite }) {
  const router = useRouter();
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState(false);

  if (!favorite?.listing || removed) return null;

  async function handleRemove() {
    setRemoving(true);
    try {
      await removeFavorite(favorite.listing._id);
      setRemoved(true);
      toast.success("Removed from favourites");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not remove this listing");
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="relative">
      <ListingCard listing={favorite.listing} />
      <button
        type="button"
        onClick={handleRemove}
        disabled={removing}
        aria-label={`Remove ${favorite.listing.name} from favourites`}
        className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-secondary)] shadow-[var(--shadow-sm)] transition-colors duration-150 hover:border-[var(--color-error)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
