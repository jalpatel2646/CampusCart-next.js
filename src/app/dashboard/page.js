import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import {
  ArrowRight,
  Gavel,
  ListChecks,
  MessageSquare,
  PackageCheck,
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton } from "@/components/common/Skeleton";
import { formatListedDateLong } from "@/lib/format";
import { getDashboardData } from "@/lib/data";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Overview",
};

export default async function DashboardPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/dashboard");

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent sellerId={sellerId} />
    </Suspense>
  );
}

async function DashboardContent({ sellerId }) {
  const { seller, listings, enquiries, metrics } = await getDashboardData(sellerId);

  const cards = [
    {
      label: "Active listings",
      value: metrics.activeListings,
      hint: `${metrics.totalListings} total`,
      icon: ListChecks,
      href: "/dashboard/listings",
    },
    {
      label: "Pending enquiries",
      value: metrics.pendingEnquiries,
      hint: `${metrics.totalEnquiries} all time`,
      icon: MessageSquare,
      href: "/dashboard/enquiries",
    },
    {
      label: "Pending offers",
      value: metrics.pendingOffers,
      hint: `${metrics.acceptedOffers} accepted`,
      icon: Gavel,
      href: "/dashboard/offers",
    },
    {
      label: "Sold items",
      value: metrics.soldListings,
      hint: `${metrics.inactiveListings} inactive`,
      icon: PackageCheck,
      href: "/dashboard/listings",
    },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Signed in as <span className="font-semibold text-[var(--color-text-primary)]">{seller.name}</span>.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)] transition-colors duration-150 hover:border-[var(--color-border-hover)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                    {card.label}
                  </p>
                  <Icon className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                </div>
                <p className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
                  {card.value}
                </p>
                <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{card.hint}</p>
              </Link>
            );
          })}
        </div>
      </div>

      <section>
        <SectionHeading
          title="Recent listings"
          subtitle="The latest items you posted."
          action={
            <Button as={Link} href="/dashboard/listings" variant="outline" size="sm" iconRight={ArrowRight}>
              Manage listings
            </Button>
          }
        />

        {listings.length > 0 ? (
          <ul className="mt-5 divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {listings.slice(0, 5).map((listing) => (
              <li key={listing._id}>
                <Link
                  href={listing.isActive ? `/product/${listing._id}` : `/edit-listing/${listing._id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-150 hover:bg-[var(--color-bg-main)] sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {listing.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {listing.category} · {formatListedDateLong(listing.createdAt)}
                    </p>
                  </div>
                  <Badge variant={listing.status === "Sold" ? "error" : listing.status === "Reserved" ? "warning" : "success"} size="sm">
                    {listing.isActive ? listing.status : "Inactive"}
                  </Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No listings yet</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              Post your first item and it will appear here.
            </p>
            <Button as={Link} href="/create-listing" className="mt-4" iconRight={ArrowRight}>
              Post a listing
            </Button>
          </div>
        )}
      </section>

      <section>
        <SectionHeading
          title="Recent enquiries"
          subtitle="Questions and offers from buyers."
          action={
            <Button as={Link} href="/dashboard/enquiries" variant="outline" size="sm" iconRight={ArrowRight}>
              View all
            </Button>
          }
        />

        {enquiries.length > 0 ? (
          <ul className="mt-5 divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {enquiries.slice(0, 4).map((enquiry) => (
              <li key={enquiry._id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                    {enquiry.buyerName} · {enquiry.listing?.name ?? "Listing removed"}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-[var(--color-text-secondary)]">
                    {enquiry.message}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[var(--color-text-muted)]">
                    {formatListedDateLong(enquiry.createdAt)}
                  </span>
                  <Badge
                    variant={
                      enquiry.status === "Pending"
                        ? "warning"
                        : enquiry.status === "Accepted"
                          ? "success"
                          : enquiry.status === "Rejected"
                            ? "error"
                            : "default"
                    }
                    size="sm"
                  >
                    {enquiry.status}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] p-8 text-center">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">No enquiries yet</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              When a buyer messages one of your listings, it will show up here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div>
      <Skeleton className="h-4 w-64" />
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="mt-10 h-6 w-40" />
      <Skeleton className="mt-4 h-64 rounded-xl" />
    </div>
  );
}
