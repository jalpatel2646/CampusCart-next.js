import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { ListingStatusBadge } from "@/components/marketplace/ListingStatusBadge";
import { formatListedDateLong } from "@/lib/format";

const STATUS_VARIANT = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
  Closed: "default",
};

const RUPEES = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** One outgoing enquiry, with the seller's response when there is one. */
export function BuyerEnquiryCard({ enquiry }) {
  const listing = enquiry.listing;
  const cover = listing?.images?.[0];
  const status = enquiry.status ?? "Pending";
  const hasResponse = Boolean(enquiry.sellerResponse?.trim());

  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {cover ? (
          <Link
            href={listing ? `/product/${listing._id}` : "#"}
            className="relative block h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
          >
            <Image
              src={cover}
              alt={listing?.name ?? "Listing"}
              fill
              sizes="80px"
              className="object-cover"
            />
          </Link>
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[10px] text-[var(--color-text-muted)]">
            No photo
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={listing ? `/product/${listing._id}` : "#"}
              className="line-clamp-1 text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-150 hover:text-[var(--color-primary)]"
            >
              {listing?.name ?? "Listing removed"}
            </Link>
            <Badge variant={STATUS_VARIANT[status] ?? "default"} size="sm">
              {status}
            </Badge>
            {listing?.status && (
              <ListingStatusBadge status={listing.status} />
            )}
          </div>

          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            {listing?.category ? `${listing.category} · ` : ""}Sent{" "}
            {formatListedDateLong(enquiry.createdAt)}
            {enquiry.offerPrice !== null && enquiry.offerPrice !== undefined
              ? ` · offered ${RUPEES.format(enquiry.offerPrice)}`
              : ""}
          </p>

          {hasResponse ? (
            <div className="mt-3 rounded-lg border border-[var(--color-primary)]/25 bg-[var(--color-bg-lime)] px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                Seller’s response
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-[var(--color-text-primary)]">
                {enquiry.sellerResponse}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[var(--color-text-muted)]">
              Waiting for the seller to respond.
            </p>
          )}

          {listing && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button as={Link} href={`/product/${listing._id}`} variant="ghost" size="sm" iconRight={ArrowRight}>
                View listing
              </Button>
              {status === "Pending" && (
                <span className="text-[11px] text-[var(--color-text-muted)]">
                  You can make a new offer from the listing page.
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
