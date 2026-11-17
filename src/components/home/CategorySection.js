import Link from "next/link";
import { Armchair, ArrowRight, BookOpen, Monitor, Package, Pencil } from "lucide-react";
import { Button } from "@/components/common/Button";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PageContainer } from "@/components/layout/PageContainer";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { listingCount } from "@/lib/format";

const CATEGORY_META = {
  Books: { icon: BookOpen, blurb: "Textbooks, novels & notes" },
  Electronics: { icon: Monitor, blurb: "Laptops, audio & gadgets" },
  Furniture: { icon: Armchair, blurb: "Desks, chairs & lamps" },
  Stationery: { icon: Pencil, blurb: "Notebooks, pens & kits" },
  Other: { icon: Package, blurb: "Everything else" },
};

export function CategorySection({ counts = {} }) {
  return (
    <PageContainer className="py-12 sm:py-16">
      <SectionHeading
        title="Shop by category"
        subtitle="Everything you need for the semester, already used by someone else."
        action={
          <Button as={Link} href="/marketplace" variant="ghost" iconRight={ArrowRight}>
            All listings
          </Button>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PRODUCT_CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category] ?? CATEGORY_META.Other;
          const Icon = meta.icon;
          const count = counts[category] ?? 0;

          return (
            <Link
              key={category}
              href={`/marketplace?category=${encodeURIComponent(category)}`}
              className="group flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-border-hover)] hover:shadow-[var(--shadow-card-hover)]"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary-soft)] text-[var(--color-primary)] transition-colors duration-200 group-hover:bg-[var(--color-accent)]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{category}</h3>
                <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">{meta.blurb}</p>
              </div>
              <p className="mt-auto text-xs font-medium text-[var(--color-text-muted)]">
                {listingCount(count)}
              </p>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}
