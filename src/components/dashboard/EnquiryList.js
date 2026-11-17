import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { EnquiryActions } from "@/components/dashboard/EnquiryActions";
import { formatListedDateLong } from "@/lib/format";

const STATUS_VARIANT = {
  Pending: "warning",
  Accepted: "success",
  Rejected: "error",
  Closed: "default",
};

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/** Shared enquiry/offer list used by the dashboard enquiry and offer pages. */
export function EnquiryList({ enquiries }) {
  return (
    <ul className="space-y-4">
      {enquiries.map((enquiry) => {
        const listing = enquiry.listing;
        const cover = listing?.images?.[0];

        return (
          <li
            key={enquiry._id}
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                {cover ? (
                  <Image
                    src={cover}
                    alt={listing.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-[var(--color-text-muted)]">
                    No photo
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    {listing ? (
                      listing.isActive ? (
                        <Link
                          href={`/product/${listing._id}`}
                          className="text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-150 hover:text-[var(--color-primary)]"
                        >
                          {listing.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {listing.name} <span className="text-xs font-normal text-[var(--color-text-muted)]">(inactive)</span>
                        </span>
                      )
                    ) : (
                      <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                        Listing removed
                      </span>
                    )}

                    <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                      From <span className="font-medium text-[var(--color-text-primary)]">{enquiry.buyerName}</span>
                      {" · "}
                      <a
                        href={`mailto:${enquiry.buyerEmail}`}
                        className="inline-flex items-center gap-1 break-all transition-colors duration-150 hover:text-[var(--color-primary)]"
                      >
                        <Mail className="h-3 w-3 shrink-0" aria-hidden="true" />
                        {enquiry.buyerEmail}
                      </a>
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={STATUS_VARIANT[enquiry.status] ?? "default"} size="sm" dot>
                      {enquiry.status}
                    </Badge>
                    <time
                      dateTime={enquiry.createdAt ?? undefined}
                      className="text-[11px] text-[var(--color-text-muted)]"
                    >
                      {formatListedDateLong(enquiry.createdAt)}
                    </time>
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-line text-sm text-[var(--color-text-secondary)]">
                  {enquiry.message}
                </p>

                {enquiry.offerPrice !== null && (
                  <p className="mt-2 inline-flex items-center rounded-md bg-[var(--color-bg-lime)] px-2 py-1 text-xs font-semibold text-[var(--color-primary)]">
                    Offer: {priceFormatter.format(enquiry.offerPrice)}
                    {listing?.price ? (
                      <span className="ml-1 font-normal text-[var(--color-text-secondary)]">
                        (listed at {priceFormatter.format(listing.price)})
                      </span>
                    ) : null}
                  </p>
                )}

                {enquiry.sellerResponse && enquiry.status !== "Pending" && (
                  <p className="mt-3 rounded-lg bg-[var(--color-bg-main)] px-3 py-2 text-xs text-[var(--color-text-secondary)]">
                    <span className="font-semibold text-[var(--color-text-primary)]">Your note:</span>{" "}
                    {enquiry.sellerResponse}
                  </p>
                )}
              </div>
            </div>

            {listing ? <EnquiryActions enquiry={enquiry} /> : null}
          </li>
        );
      })}
    </ul>
  );
}
