import { ListingCard } from "@/components/marketplace/ListingCard";
import { cn } from "@/utils/cn";

const LAYOUTS = {
  two: "grid gap-5 sm:grid-cols-2",
  three: "grid gap-5 sm:grid-cols-2 xl:grid-cols-3",
  four: "grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/**
 * Responsive grid of listing cards.
 */
export function ListingGrid({ listings = [], columns = "four", className, priorityCount = 0 }) {
  return (
    <div className={cn(LAYOUTS[columns] ?? LAYOUTS.four, className)}>
      {listings.map((listing, index) => (
        <ListingCard key={listing._id} listing={listing} priority={index < priorityCount} />
      ))}
    </div>
  );
}
