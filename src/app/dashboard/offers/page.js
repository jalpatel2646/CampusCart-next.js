import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, Gavel } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { EnquiryList } from "@/components/dashboard/EnquiryList";
import { getDashboardData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Offers",
};

export default async function DashboardOffersPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/dashboard/offers");

  return (
    <Suspense fallback={<OffersSkeleton />}>
      <OffersContent sellerId={sellerId} />
    </Suspense>
  );
}

async function OffersContent({ sellerId }) {
  const { enquiries, metrics } = await getDashboardData(sellerId);
  const offers = enquiries.filter((enquiry) => enquiry.offerPrice !== null);

  if (offers.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <EmptyState
          icon={Gavel}
          title="No price offers yet"
          description="When a buyer names a price on one of your listings, the offer will appear here for you to accept or reject."
        />
        <div className="flex justify-center pb-10">
          <Button as={Link} href="/dashboard/listings" variant="outline" iconRight={ArrowRight}>
            Review your listings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {metrics.pendingOffers} pending · {metrics.acceptedOffers} accepted ·{" "}
        {metrics.rejectedOffers} rejected
      </p>
      <div className="mt-4">
        <EnquiryList enquiries={offers} />
      </div>
    </div>
  );
}

function OffersSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-64" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
