import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, MessageSquare } from "lucide-react";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Skeleton } from "@/components/common/Skeleton";
import { EnquiryList } from "@/components/dashboard/EnquiryList";
import { getDashboardData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Enquiries",
};

export default async function DashboardEnquiriesPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/dashboard/enquiries");

  return (
    <Suspense fallback={<EnquiriesSkeleton />}>
      <EnquiriesContent sellerId={sellerId} />
    </Suspense>
  );
}

async function EnquiriesContent({ sellerId }) {
  const { enquiries, metrics } = await getDashboardData(sellerId);

  if (enquiries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
        <EmptyState
          icon={MessageSquare}
          title="No enquiries yet"
          description="When a buyer messages one of your listings, their question and contact details will appear here."
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
        {metrics.totalEnquiries} total · {metrics.pendingEnquiries} pending
      </p>
      <div className="mt-4">
        <EnquiryList enquiries={enquiries} />
      </div>
    </div>
  );
}

function EnquiriesSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-48" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
