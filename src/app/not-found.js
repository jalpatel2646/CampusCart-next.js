import Link from "next/link";
import { ArrowRight, Compass, Search } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)]">
        <Compass className="h-8 w-8 text-[var(--color-text-muted)]" aria-hidden="true" />
      </span>

      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Error 404
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
        This page does not exist
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary)] sm:text-base">
        The link may be out of date, or the listing may have been sold, deactivated, or removed
        by its seller. Try the marketplace instead.
      </p>

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button as={Link} href="/marketplace" icon={Search}>
          Browse the marketplace
        </Button>
        <Button as={Link} href="/" variant="outline" iconRight={ArrowRight}>
          Go to the homepage
        </Button>
      </div>
    </section>
  );
}
