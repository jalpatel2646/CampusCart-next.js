import Link from "next/link";
import { Suspense } from "react";
import { ArrowRight, Gift, Repeat2 } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ProductCardSkeleton, Skeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { CategorySection } from "@/components/home/CategorySection";
import { CtaBanner } from "@/components/home/CtaBanner";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { getHomeData } from "@/lib/data";

export const metadata = {
  title: { absolute: "CampusCart – Student Second-Hand Marketplace" },
  description:
    "Buy, sell, give away, or swap second-hand textbooks, electronics, furniture, and hostel essentials with students on your campus.",
};

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  const { featured, freeAndSwap, categoryCounts, stats } = await getHomeData(8);

  return (
    <>
      <HeroSection
        liveCount={stats.liveCount}
        freeCount={stats.freeCount}
        sellerCount={stats.sellerCount}
        heroImage={featured[0]?.images?.[0] ?? null}
      />

      <CategorySection counts={categoryCounts} />

      <section className="pb-14 sm:pb-20">
        <PageContainer className="py-0">
          <SectionHeading
            title="Fresh on campus"
            subtitle="The newest listings from students nearby."
            action={
              <Button as={Link} href="/marketplace" variant="outline" iconRight={ArrowRight}>
                Browse all
              </Button>
            }
          />
          {featured.length > 0 ? (
            <ListingGrid listings={featured} columns="four" priorityCount={4} className="mt-6" />
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
              <EmptyState
                title="No listings yet"
                description="Be the first to list something for your campus."
                actionLabel="Post a listing"
                action={undefined}
              />
              <div className="flex justify-center pb-10">
                <Button as={Link} href="/create-listing" icon={ArrowRight}>
                  Post a listing
                </Button>
              </div>
            </div>
          )}
        </PageContainer>
      </section>

      {freeAndSwap.length > 0 && (
        <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-lime)]">
          <PageContainer className="py-12 sm:py-16">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
              <div>
                <Badge variant="primary" icon={Gift}>
                  Free &amp; swap
                </Badge>
                <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                  Not everything needs a price tag.
                </h2>
                <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary)] sm:text-base">
                  Some students are giving things away or swapping for what they need. Take a
                  look — and pass on what you no longer use.
                </p>
                <div className="mt-6 flex flex-wrap items-center gap-4">
                  <Button as={Link} href="/marketplace" iconRight={ArrowRight}>
                    See what&apos;s available
                  </Button>
                  <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                    <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />
                    Exchange listings swap one item for another
                  </span>
                </div>
              </div>

              <ListingGrid listings={freeAndSwap} columns="two" />
            </div>
          </PageContainer>
        </section>
      )}

      <HowItWorks />
      <CtaBanner />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div>
      <div className="border-b border-[var(--color-border)]">
        <div className="mx-auto grid w-full max-w-[var(--container-2xl)] gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <div className="space-y-5">
            <Skeleton className="h-6 w-64 rounded-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-4/5" />
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-11 w-full max-w-lg" />
            <Skeleton className="h-16 w-full max-w-lg" />
          </div>
          <Skeleton className="mx-auto aspect-4/5 w-full max-w-[520px] rounded-[var(--radius-3xl)]" />
        </div>
      </div>

      <PageContainer>
        <Skeleton className="mt-12 h-8 w-56" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-40 rounded-xl" />
          ))}
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </PageContainer>
    </div>
  );
}
