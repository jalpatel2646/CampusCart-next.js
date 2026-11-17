import Link from "next/link";
import { ArrowRight, Mail, Phone, ShieldCheck } from "lucide-react";

const PREFERENCE_LABEL = {
  email: "Prefers email",
  phone: "Prefers phone calls",
  both: "Email or phone",
};

function initials(name = "") {
  const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase()).join("") || "CC";
}

/**
 * Seller contact panel shown on the product detail page (FR-050, FR-053).
 */
export function SellerCard({ seller }) {
  if (!seller) return null;

  return (
    <section
      aria-labelledby="seller-heading"
      className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)]"
    >
      <h2
        id="seller-heading"
        className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]"
      >
        Seller
      </h2>

      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)] text-sm font-semibold text-[var(--color-primary)]"
        >
          {initials(seller.name)}
        </span>
        <div className="min-w-0">
          <Link
            href={`/seller/${seller._id}`}
            className="truncate text-sm font-semibold text-[var(--color-text-primary)] transition-colors duration-150 hover:text-[var(--color-primary)]"
          >
            {seller.name}
          </Link>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {PREFERENCE_LABEL[seller.contactPreference] ?? "Contact via email"}
          </p>
        </div>
      </div>

      <dl className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
        {seller.email && (
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Email</dt>
            <dd className="min-w-0">
              <a
                href={`mailto:${seller.email}`}
                className="break-all transition-colors duration-150 hover:text-[var(--color-primary)]"
              >
                {seller.email}
              </a>
            </dd>
          </div>
        )}
        {seller.phone && (
          <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
            <Phone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <dt className="sr-only">Phone</dt>
            <dd>
              <a
                href={`tel:${seller.phone.replace(/\s+/g, "")}`}
                className="transition-colors duration-150 hover:text-[var(--color-primary)]"
              >
                {seller.phone}
              </a>
            </dd>
          </div>
        )}
      </dl>

      <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-[var(--color-bg-main)] px-3 py-2 text-[11px] text-[var(--color-text-secondary)]">
        <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--color-success)]" aria-hidden="true" />
        Meet in a public campus spot and inspect the item before paying.
      </p>

      <Link
        href={`/seller/${seller._id}`}
        className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] transition-colors duration-150 hover:text-[var(--color-primary-hover)]"
      >
        View seller listings
        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
      </Link>
    </section>
  );
}
