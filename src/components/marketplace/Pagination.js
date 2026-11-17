import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buildListingHref } from "@/lib/listing-params";
import { cn } from "@/utils/cn";

function buildPageItems(page, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const items = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(totalPages - 1, page + 1);

  if (start > 2) items.push("start-ellipsis");
  for (let index = start; index <= end; index += 1) items.push(index);
  if (end < totalPages - 1) items.push("end-ellipsis");
  items.push(totalPages);

  return items;
}

const baseItem =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition-colors duration-150";

/**
 * URL-driven pagination for the marketplace (works without client JS).
 */
export function Pagination({ page = 1, totalPages = 1, searchParams = {}, className }) {
  if (totalPages <= 1) return null;

  const hrefFor = (target) => buildListingHref(searchParams, { page: target === 1 ? undefined : target });
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  return (
    <nav aria-label="Pagination" className={cn("mt-10 flex items-center justify-center gap-1.5", className)}>
      {hasPrev ? (
        <Link
          href={hrefFor(page - 1)}
          rel="prev"
          className={cn(
            baseItem,
            "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
          )}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </Link>
      ) : (
        <span className={cn(baseItem, "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50")}>
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Previous page</span>
        </span>
      )}

      {buildPageItems(page, totalPages).map((item) =>
        typeof item === "number" ? (
          <Link
            key={item}
            href={hrefFor(item)}
            aria-current={item === page ? "page" : undefined}
            className={cn(
              baseItem,
              item === page
                ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
            )}
          >
            {item}
          </Link>
        ) : (
          <span
            key={item}
            aria-hidden="true"
            className="inline-flex h-9 min-w-9 items-center justify-center text-sm text-[var(--color-text-muted)]"
          >
            …
          </span>
        )
      )}

      {hasNext ? (
        <Link
          href={hrefFor(page + 1)}
          rel="next"
          className={cn(
            baseItem,
            "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)]"
          )}
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </Link>
      ) : (
        <span className={cn(baseItem, "border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50")}>
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Next page</span>
        </span>
      )}
    </nav>
  );
}
