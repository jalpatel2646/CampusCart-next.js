import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, MessageSquareText } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { BuyerEnquiryCard } from "@/components/marketplace/BuyerEnquiryCard";
import { MarkAllSeenOnMount } from "@/components/notifications/MarkAllSeenOnMount";
import { getBuyerEnquiriesData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "My enquiries",
  description: "Track the enquiries and offers you sent to sellers and read their responses.",
};

export default async function BuyerEnquiriesPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/enquiries");

  return (
    <PageContainer>
      <Breadcrumb items={[{ label: "My enquiries" }]} />

      <header className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          Buyer inbox
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          My enquiries
        </h1>
        <p className="mt-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
          Every enquiry and offer you send appears here, along with the seller’s
          response. Newest first.
        </p>
      </header>

      <div className="mt-8">
        <Suspense fallback={<EnquiriesSkeleton />}>
          <EnquiriesContent sellerId={sellerId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function EnquiriesContent({ sellerId }) {
  const { items } = await getBuyerEnquiriesData(sellerId, { limit: 100 });

  return (
    <>
      <MarkAllSeenOnMount />

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <EmptyState
            icon={MessageSquareText}
            title="No enquiries yet"
            description="Message a seller or offer a price from any listing and it will show up here, together with their answer."
          />
          <div className="flex justify-center pb-10">
            <Button as={Link} href="/marketplace" iconRight={ArrowRight}>
              Browse the marketplace
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {items.length} outgoing {items.length === 1 ? "enquiry" : "enquiries"}
          </p>
          <ul className="mt-4 space-y-3">
            {items.map((enquiry) => (
              <BuyerEnquiryCard key={enquiry._id} enquiry={enquiry} />
            ))}
          </ul>
        </div>
      )}
    </>
  );
}

function EnquiriesSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-40" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-36 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
