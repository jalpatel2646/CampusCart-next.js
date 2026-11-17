"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { addFavorite, removeFavorite } from "@/lib/api";

/** Saves a listing to the signed-in account and keeps the button in sync. */
export function FavoriteButton({ listingId, initialFavorite = false, disabled = false }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialFavorite);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (disabled || loading) return;
    setLoading(true);

    try {
      if (saved) {
        await removeFavorite(listingId);
        setSaved(false);
        toast.success("Removed from favourites");
      } else {
        await addFavorite(listingId);
        setSaved(true);
        toast.success("Saved to favourites");
      }
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not update your favourites");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : "outline"}
      fullWidth
      loading={loading}
      disabled={disabled}
      icon={Heart}
      onClick={toggle}
      aria-pressed={saved}
      className={saved ? "[&_svg]:fill-current" : undefined}
    >
      {disabled ? "Saving closed for this listing" : saved ? "Saved to favourites" : "Save this listing"}
    </Button>
  );
}
