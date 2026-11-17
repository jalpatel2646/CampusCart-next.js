import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Bookmark, Search } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { MarkAllSeenButton } from "@/components/dashboard/MarkAllSeenButton";
import { SavedSearchCard } from "@/components/dashboard/SavedSearchCard";
import { getSavedSearchesData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Saved searches",
  description: "Get notified about new listings that match your saved marketplace searches.",
};

export default async function SavedSearchesPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/dashboard/searches");

  return (
    <Suspense fallback={<SearchesSkeleton />}>
      <SearchesContent sellerId={sellerId} />
    </Suspense>
  );
}

async function SearchesContent({ sellerId }) {
  const items = await getSavedSearchesData(sellerId);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <EmptyState
          icon={Bookmark}
          title="No saved searches yet"
          description="On the marketplace, filter by category, condition, price or keyword, then tap “Save this search”. New matches will show up here."
        />
        <div className="flex justify-center pb-10">
          <Button as={Link} href="/marketplace" icon={Search} iconRight={ArrowRight}>
            Explore the marketplace
          </Button>
        </div>
      </div>
    );
  }

  const totalNew = items.reduce((sum, item) => sum + item.newCount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          {items.length} saved {items.length === 1 ? "search" : "searches"}
          {totalNew > 0
            ? ` · ${totalNew} new ${totalNew === 1 ? "match" : "matches"}`
            : " · caught up"}
        </p>
        <MarkAllSeenButton disabled={totalNew === 0} />
      </div>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <SavedSearchCard key={item._id} savedSearch={item} />
        ))}
      </ul>
    </div>
  );
}

function SearchesSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-64" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
