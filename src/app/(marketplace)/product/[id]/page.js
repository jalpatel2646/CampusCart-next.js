import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowRight, LayoutDashboard, Pencil, Repeat2, LogIn } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { Button } from "@/components/common/Button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Skeleton, TextSkeleton } from "@/components/common/Skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { EnquiryForm } from "@/components/marketplace/EnquiryForm";
import { FavoriteButton } from "@/components/marketplace/FavoriteButton";
import { ImageGallery } from "@/components/marketplace/ImageGallery";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { ListingStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { PriceDisplay } from "@/components/marketplace/PriceDisplay";
import { ProductConditionBadge } from "@/components/marketplace/ProductConditionBadge";
import { SellerCard } from "@/components/marketplace/SellerCard";
import { formatListedDateLong } from "@/lib/format";
import { getFavoriteStatus, getListingDetail } from "@/lib/data";
import { referenceId } from "@/lib/ownership";
import { getSellerSession } from "@/lib/session";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const data = await getListingDetail(id);

  if (!data) notFound();

  return {
    title: data.listing.name,
    description: data.listing.description.slice(0, 160),
    openGraph: {
      title: data.listing.name,
      description: data.listing.description.slice(0, 160),
      images: data.listing.images.slice(0, 1),
    },
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const initialData = await getListingDetail(id);

  if (!initialData) notFound();

  return (
    <PageContainer>
      <Suspense fallback={<ProductDetailsSkeleton />}>
        <ProductDetails initialData={initialData} />
      </Suspense>
    </PageContainer>
  );
}

async function ProductDetails({ initialData }) {
  const { listing, similar } = initialData;
  const sellerId = await getSellerSession();
  const canManage = Boolean(sellerId) && referenceId(listing.seller) === sellerId;
  const isFavorite =
    sellerId && !canManage ? await getFavoriteStatus(sellerId, listing._id) : false;

  const isAvailable = listing.status === "Available";
  const isExchange = listing.listingType === "Exchange";
  const isFree = listing.listingType === "Free";

  return (
    <>
      <Breadcrumb
        items={[
          { label: "Marketplace", href: "/marketplace" },
          {
            label: listing.category,
            href: `/marketplace?category=${encodeURIComponent(listing.category)}`,
          },
          { label: listing.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="space-y-8">
          <ImageGallery images={listing.images} alt={listing.name} />

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)] sm:p-6">
            <h2 className="text-base font-semibold text-[var(--color-text-primary)]">Description</h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[var(--color-text-secondary)]">
              {listing.description}
            </p>

            {isExchange && listing.exchangeDescription && (
              <div className="mt-5 rounded-lg border border-dashed border-[var(--color-primary)]/25 bg-[var(--color-bg-lime)] p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                  <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Looking to swap for
                </p>
                <p className="mt-2 text-sm text-[var(--color-text-primary)]">
                  {listing.exchangeDescription}
                </p>
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-5 self-start lg:sticky lg:top-20">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {isFree && <Badge variant="accent">Free</Badge>}
              {isExchange && (
                <Badge variant="primary" icon={Repeat2}>
                  Exchange
                </Badge>
              )}
              <ListingStatusBadge status={listing.status} />
            </div>

            <h1 className="mt-3 text-2xl font-bold tracking-tight text-[var(--color-text-primary)] sm:text-3xl">
              {listing.name}
            </h1>

            <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
              {isExchange ? (
                <span className="inline-flex items-center gap-2 text-2xl font-bold text-[var(--color-primary)]">
                  <Repeat2 className="h-5 w-5" aria-hidden="true" />
                  Open to swaps
                </span>
              ) : (
                <PriceDisplay price={isFree ? 0 : listing.price} size="xl" />
              )}
              <ProductConditionBadge condition={listing.condition} />
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 text-sm shadow-[var(--shadow-card)]">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Category
              </dt>
              <dd className="mt-1 font-medium text-[var(--color-text-primary)]">{listing.category}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Listing type
              </dt>
              <dd className="mt-1 font-medium text-[var(--color-text-primary)]">{listing.listingType}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Posted
              </dt>
              <dd className="mt-1 font-medium text-[var(--color-text-primary)]">
                {formatListedDateLong(listing.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
                Status
              </dt>
              <dd className="mt-1 font-medium text-[var(--color-text-primary)]">{listing.status}</dd>
            </div>
          </dl>

          <SellerCard seller={listing.seller} />

          {canManage ? (
            <div className="rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-bg-lime)] p-5">
              <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                You manage this listing
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Update the details, mark it reserved, or track enquiries from your dashboard.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button as={Link} href={`/edit-listing/${listing._id}`} size="sm" icon={Pencil}>
                  Edit listing
                </Button>
                <Button
                  as={Link}
                  href="/dashboard/listings"
                  size="sm"
                  variant="outline"
                  icon={LayoutDashboard}
                >
                  Manage listings
                </Button>
              </div>
            </div>
          ) : (
            <>
              {sellerId ? (
                <FavoriteButton
                  listingId={listing._id}
                  initialFavorite={isFavorite}
                  disabled={listing.status === "Sold"}
                />
              ) : (
                <Button
                  as={Link}
                  href={`/login?next=/product/${listing._id}`}
                  variant="outline"
                  fullWidth
                  icon={LogIn}
                >
                  Sign in to save this listing
                </Button>
              )}
              {isAvailable ? (
                <EnquiryForm listingId={listing._id} listingName={listing.name} />
              ) : (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)]">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                    This listing is {listing.status.toLowerCase()}.
                  </p>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Enquiries are closed for this item. Browse the marketplace for similar finds.
                  </p>
                  <Button
                    as={Link}
                    href="/marketplace"
                    variant="outline"
                    iconRight={ArrowRight}
                    className="mt-4"
                  >
                    Browse marketplace
                  </Button>
                </div>
              )}
            </>
          )}
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-14">
          <SectionHeading
            title="Similar listings"
            subtitle={`More ${listing.category.toLowerCase()} from students nearby.`}
            action={
              <Button
                as={Link}
                href={`/marketplace?category=${encodeURIComponent(listing.category)}`}
                variant="outline"
                iconRight={ArrowRight}
              >
                See all
              </Button>
            }
          />
          <ListingGrid listings={similar} columns="three" className="mt-6" />
        </section>
      )}
    </>
  );
}

function ProductDetailsSkeleton() {
  return (
    <div>
      <Skeleton className="mb-6 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-12">
        <div className="space-y-8">
          <Skeleton className="aspect-4/3 w-full rounded-xl" />
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-6">
            <Skeleton className="h-4 w-32" />
            <TextSkeleton lines={4} className="mt-4" />
          </div>
        </div>
        <div className="space-y-5">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
