import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, ListChecks } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { ListingActions } from "@/components/dashboard/ListingActions";
import { PriceDisplay } from "@/components/marketplace/PriceDisplay";
import { formatListedDateLong } from "@/lib/format";
import { getDashboardData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Your listings",
};

export default async function DashboardListingsPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/dashboard/listings");

  return (
    <Suspense fallback={<ListingsSkeleton />}>
      <ListingsContent sellerId={sellerId} />
    </Suspense>
  );
}

async function ListingsContent({ sellerId }) {
  const { listings, metrics } = await getDashboardData(sellerId);

  if (listings.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <EmptyState
          icon={ListChecks}
          title="No listings yet"
          description="Post an item and you can change its status, edit it, or take it down from this page."
        />
        <div className="flex justify-center pb-10">
          <Button as={Link} href="/create-listing" iconRight={ArrowRight}>
            Post a listing
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {metrics.activeListings} active · {metrics.inactiveListings} inactive ·{" "}
          {metrics.soldListings} sold
        </p>
        <Button as={Link} href="/create-listing" size="sm" iconRight={ArrowRight}>
          New listing
        </Button>
      </div>

      <ul className="mt-4 divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
        {listings.map((listing) => {
          const cover = listing.images?.[0];

          return (
            <li key={listing._id} className="p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-center gap-4">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={listing.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-[var(--color-text-muted)]">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <Link
                      href={listing.isActive ? `/product/${listing._id}` : `/edit-listing/${listing._id}`}
                      className="line-clamp-1 text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-150 hover:text-[var(--color-primary)]"
                    >
                      {listing.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {listing.category} · {listing.condition} · Listed{" "}
                      {formatListedDateLong(listing.createdAt)}
                    </p>
                    <div className="mt-1.5">
                      {listing.listingType === "Exchange" ? (
                        <span className="text-sm font-semibold text-[var(--color-primary)]">
                          Open to swaps
                        </span>
                      ) : (
                        <PriceDisplay
                          price={listing.listingType === "Free" ? 0 : listing.price}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 lg:pl-4">
                  <ListingActions listing={listing} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ListingsSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-64" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
