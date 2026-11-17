import Image from "next/image";
import Link from "next/link";
import { Repeat2, UserRound } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { PriceDisplay } from "@/components/marketplace/PriceDisplay";
import { ProductConditionBadge } from "@/components/marketplace/ProductConditionBadge";
import { ListingStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { formatListedDate, formatListedDateLong } from "@/lib/format";
import { cn } from "@/utils/cn";

/**
 * Marketplace product card. Renders a listing summary and links to its detail page.
 */
export function ListingCard({ listing, priority = false, className }) {
  const cover = listing.images?.[0];
  const isExchange = listing.listingType === "Exchange";
  const isFree = listing.listingType === "Free";

  return (
    <Link
      href={`/product/${listing._id}`}
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-xl border border-[var(--color-border)]",
        "bg-[var(--color-bg-card)] shadow-[var(--shadow-card)] transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-card-hover)]",
        className
      )}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-[var(--color-bg-secondary)]">
        {cover ? (
          <Image
            src={cover}
            alt={listing.name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-[var(--color-text-muted)]">
            No image
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
          {isFree && (
            <Badge variant="accent" size="sm">
              Free
            </Badge>
          )}
          {isExchange && (
            <Badge variant="primary" size="sm" icon={Repeat2}>
              Exchange
            </Badge>
          )}
          {listing.status !== "Available" && (
            <ListingStatusBadge status={listing.status} size="sm" />
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
          <span>{listing.category}</span>
          <span aria-hidden="true">·</span>
          <time
            dateTime={listing.createdAt}
            title={`Listed ${formatListedDateLong(listing.createdAt)}`}
            className="normal-case tracking-normal"
          >
            {formatListedDate(listing.createdAt)}
          </time>
        </div>

        <h3 className="mt-1.5 line-clamp-2 text-[15px] font-semibold leading-snug text-[var(--color-text-primary)] transition-colors duration-150 group-hover:text-[var(--color-primary)]">
          {listing.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {isExchange ? (
            <span className="inline-flex items-center gap-1.5 text-base font-bold text-[var(--color-primary)]">
              <Repeat2 className="h-4 w-4" aria-hidden="true" />
              Exchange
            </span>
          ) : (
            <PriceDisplay price={isFree ? 0 : listing.price} size="md" />
          )}
          <ProductConditionBadge condition={listing.condition} size="sm" />
        </div>

        <div className="mt-3 flex items-center gap-1.5 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">
          <UserRound className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{listing.seller?.name ?? "CampusCart seller"}</span>
        </div>
      </div>
    </Link>
  );
}
