import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, LayoutGrid, Repeat2, Search } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

const POPULAR_SEARCHES = ["Textbooks", "Laptop", "Study desk", "Calculator"];

const STATS_GRID = "grid grid-cols-3 gap-4";

export function HeroSection({ liveCount = 0, freeCount = 0, sellerCount = 0 }) {
  const stats = [
    { value: liveCount, label: "Live listings" },
    { value: freeCount, label: "Free or swap" },
    { value: sellerCount, label: "Student sellers" },
  ];

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-main)]">
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_72%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-[var(--container-2xl)] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] shadow-[var(--shadow-xs)]">
            <span className="lime-dot h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
            Built for campus life · no sign-up needed
          </span>

          <h1 className="mt-6 text-[length:var(--font-size-display)] font-bold leading-[1.02] tracking-tight">
            Textbooks, tech,
            <br />
            <span className="lime-underline">and dorm gear.</span>
            <br />
            Second-hand, nearby.
          </h1>

          <p className="mt-5 max-w-xl text-base text-[var(--color-text-secondary)] sm:text-lg">
            Buy, sell, give away, or swap the things campus actually uses. Message the
            seller, meet on campus, and skip the shipping and the markup.
          </p>

          <form action="/marketplace" role="search" className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
                aria-hidden="true"
              />
              <input
                type="search"
                name="search"
                placeholder="Search an item, e.g. calculator or desk lamp"
                aria-label="Search the marketplace"
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] py-3 pl-10 pr-4 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-xs)] transition-colors duration-150 placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 text-sm font-semibold text-[var(--color-accent)] shadow-sm transition-all duration-150 hover:bg-[var(--color-primary-hover)] active:scale-[0.98]"
            >
              Search
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
              Popular:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <Link
                key={term}
                href={`/marketplace?search=${encodeURIComponent(term)}`}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1 text-xs font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
              >
                {term}
              </Link>
            ))}
          </div>

          <dl className={`${STATS_GRID} mt-10 max-w-lg border-t border-[var(--color-border)] pt-6`}>
            {stats.map((stat) => (
              <div key={stat.label}>
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
                    {stat.value}
                  </span>
                  <span className="mt-0.5 block text-xs text-[var(--color-text-secondary)]">
                    {stat.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-[520px]">
          <div className="relative aspect-4/5 w-full overflow-hidden rounded-[var(--radius-3xl)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-xl)]">
            <Image
              src="/images/products/laptop.jpg"
              alt="A second-hand laptop listed on CampusCart"
              fill
              priority
              sizes="(max-width: 1024px) 90vw, 480px"
              className="object-cover"
            />
          </div>

          <div className="absolute -left-4 bottom-14 hidden items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-4 py-3 shadow-[var(--shadow-lg)] sm:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg-lime)] text-[var(--color-primary)]">
              <Gift className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-semibold text-[var(--color-text-primary)]">Free listings</p>
              <p className="text-[11px] text-[var(--color-text-secondary)]">Pass it on, pay nothing</p>
            </div>
          </div>

          <div className="absolute -right-3 top-10 hidden items-center gap-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3.5 py-2.5 shadow-[var(--shadow-lg)] sm:flex">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)]">
              <Repeat2 className="h-4 w-4" aria-hidden="true" />
            </span>
            <p className="text-xs font-semibold text-[var(--color-text-primary)]">Swap, don&apos;t buy</p>
          </div>

          <div className="absolute -right-2 bottom-6 hidden items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-1.5 text-[11px] font-medium text-[var(--color-text-secondary)] shadow-[var(--shadow-md)] lg:flex">
            <LayoutGrid className="h-3.5 w-3.5 text-[var(--color-primary)]" aria-hidden="true" />
            {PRODUCT_CATEGORIES.length} categories to browse
          </div>
        </div>
      </div>
    </section>
  );
}
