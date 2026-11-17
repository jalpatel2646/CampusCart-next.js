import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarDays, Mail, Phone, ShieldCheck } from "lucide-react";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PageContainer } from "@/components/layout/PageContainer";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { PriceDisplay } from "@/components/marketplace/PriceDisplay";
import { formatListedDateLong } from "@/lib/format";
import { getSellerProfile } from "@/lib/data";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getSellerProfile(id);

  if (!data) notFound();

  return {
    title: `${data.seller.name} – Seller`,
    description: `Browse current and past listings from ${data.seller.name} on CampusCart.`,
  };
}

export default async function SellerProfilePage({ params }) {
  const { id } = await params;
  const data = await getSellerProfile(id);

  if (!data) notFound();

  return (
    <PageContainer>
      <SellerProfileContent data={data} />
    </PageContainer>
  );
}

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "CC";
}

function SellerProfileContent({ data }) {
  const { seller, activeListings, history } = data;
  const showEmail = seller.contactPreference === "email" || seller.contactPreference === "both";
  const showPhone = seller.contactPreference === "phone" || seller.contactPreference === "both";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Marketplace", href: "/marketplace" },
          { label: seller.name },
        ]}
      />

      <header className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-lg font-semibold text-[var(--color-primary)]"
            >
              {initials(seller.name)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                Seller
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{seller.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                Member since {formatListedDateLong(seller.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button as={Link} href="/marketplace" variant="outline" size="sm" iconRight={ArrowRight}>
              Browse marketplace
            </Button>
          </div>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-[var(--color-border)] pt-5 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Active listings
            </dt>
            <dd className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">
              {activeListings.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Past listings
            </dt>
            <dd className="mt-1 text-xl font-bold text-[var(--color-text-primary)]">
              {history.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Contact
            </dt>
            <dd className="mt-1 flex flex-col gap-1 text-sm text-[var(--color-text-secondary)]">
              {showEmail && seller.email && (
                <a
                  href={`mailto:${seller.email}`}
                  className="inline-flex items-center gap-1.5 break-all transition-colors duration-150 hover:text-[var(--color-primary)]"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {seller.email}
                </a>
              )}
              {showPhone && seller.phone && (
                <a
                  href={`tel:${seller.phone.replace(/\s+/g, "")}`}
                  className="inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-[var(--color-primary)]"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {seller.phone}
                </a>
              )}
              {!showEmail && !showPhone && <span>Contact through a listing</span>}
            </dd>
          </div>
        </dl>

        <p className="mt-5 flex items-start gap-2 rounded-lg bg-[var(--color-bg-main)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
          Meet in a public campus spot and inspect items before paying. CampusCart does not
          process payments.
        </p>
      </header>

      <section className="mt-10">
        <SectionHeading
          title="Current listings"
          subtitle={`Items ${seller.name} has available right now.`}
        />
        {activeListings.length > 0 ? (
          <ListingGrid listings={activeListings} columns="three" className="mt-6" priorityCount={3} />
        ) : (
          <div className="mt-6 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)]">
            <EmptyState
              title="No active listings"
              description={`${seller.name} has no available items at the moment. Check back later or browse the marketplace.`}
            />
            <div className="flex justify-center pb-10">
              <Button as={Link} href="/marketplace" variant="outline" iconRight={ArrowRight}>
                Browse marketplace
              </Button>
            </div>
          </div>
        )}
      </section>

      {history.length > 0 && (
        <section className="mt-12">
          <SectionHeading
            title="Listing history"
            subtitle="Items that were sold or taken down."
          />
          <ul className="mt-5 divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)]">
            {history.map((listing) => {
              const row = (
                <div className="flex items-center gap-4 px-4 py-3 transition-colors duration-150 sm:px-5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                      {listing.name}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
                      {listing.category} · {formatListedDateLong(listing.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <PriceDisplay price={listing.listingType === "Exchange" ? 0 : listing.price} size="sm" />
                    <ListingStatusBadge status={listing.isActive ? listing.status : "Inactive"} size="sm" />
                  </div>
                </div>
              );

              return (
                <li key={listing._id}>
                  {listing.isActive ? (
                    <Link href={`/product/${listing._id}`} className="block hover:bg-[var(--color-bg-main)]">
                      {row}
                    </Link>
                  ) : (
                    row
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
}


