import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Heart } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { ProductCardSkeleton, Skeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { FavoriteCard } from "@/components/marketplace/FavoriteCard";
import { getFavoritesData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Saved listings",
  description: "Listings you have saved to your CampusCart account.",
};

export default async function FavoritesPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/favorites");

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "Saved listings" }]} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Your shortlist
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Saved listings</h1>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Items you have saved to your CampusCart account. They follow you across devices until
          you remove them.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesContent sellerId={sellerId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function FavoritesContent({ sellerId }) {
  const { items } = await getFavoritesData(sellerId);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          description="Tap “Save this listing” on any product page and it will appear here."
        />
        <div className="flex justify-center pb-10">
          <Button as={Link} href="/marketplace" iconRight={ArrowRight}>
            Browse the marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {items.length} saved {items.length === 1 ? "listing" : "listings"}
      </p>
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((favorite) => (
          <FavoriteCard key={favorite._id} favorite={favorite} />
        ))}
      </div>
    </>
  );
}

function FavoritesSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-32" />
      <div className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}
