import Link from "next/link";
import { Suspense } from "react";
import { RotateCcw, SearchX } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton, ProductCardSkeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { Pagination } from "@/components/marketplace/Pagination";
import { listingCount } from "@/lib/format";
import { hasActiveListingFilters, parseListingParams } from "@/lib/listing-params";
import { getMarketplaceData } from "@/lib/data";

export const metadata = {
  title: "Marketplace",
  description:
    "Browse affordable second-hand textbooks, electronics, furniture, and stationery listed by students on your campus.",
};

export default function MarketplacePage({ searchParams }) {
  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Marketplace" }]} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Campus marketplace
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Find it used. Pay less. Keep it on campus.
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Every listing comes from a student nearby — no shipping, no middlemen. Search,
          filter, and message the seller directly.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<MarketplaceFallback />}>
          <MarketplaceResults searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function MarketplaceResults({ searchParams }) {
  const rawParams = (await searchParams) ?? {};
  const filters = parseListingParams(rawParams);
  const result = await getMarketplaceData(filters);
  const categoryCounts = result.categoryCounts;

  const summary =
    result.total === 0
      ? "No listings match your filters"
      : result.totalPages > 1
        ? `Showing ${result.rangeStart}–${result.rangeEnd} of ${result.total} listings`
        : `${listingCount(result.total)} found`;

  return (
    <MarketplaceBrowser
      summary={summary}
      categoryCounts={categoryCounts}
      locationCounts={result.locationCounts}
    >
      {result.items.length > 0 ? (
        <>
          <ListingGrid listings={result.items} columns="three" priorityCount={3} />
          <Pagination page={result.page} totalPages={result.totalPages} searchParams={rawParams} />
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <EmptyState
            icon={SearchX}
            title="Nothing matches those filters"
            description="Try a different keyword, widen the price range, or clear everything to see all listings."
          />
          {(hasActiveListingFilters(rawParams) || filters.search) && (
            <div className="flex justify-center pb-10">
              <Button as={Link} href="/marketplace" variant="outline" icon={RotateCcw}>
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}
    </MarketplaceBrowser>
  );
}

function MarketplaceFallback() {
  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Skeleton className="h-11 w-full rounded-lg md:max-w-md" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-11 w-24 rounded-lg lg:hidden" />
          <Skeleton className="h-11 w-44 rounded-lg" />
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <Skeleton className="mb-6 hidden h-[460px] rounded-xl lg:mb-0 lg:block" />
        <div>
          <Skeleton className="mb-4 h-4 w-40" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
