import Link from "next/link";
import { ArrowRight, PlusCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageContainer } from "@/components/layout/PageContainer";

export function CtaBanner() {
  return (
    <section className="pb-16 pt-4">
      <PageContainer>
        <div className="relative overflow-hidden rounded-[var(--radius-3xl)] bg-[var(--color-primary)] px-6 py-12 sm:px-10 sm:py-16">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[var(--color-accent)] opacity-10 blur-2xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-white opacity-5 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
              Sell in two minutes
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Got stuff collecting dust? Turn it into someone&apos;s next semester.
            </h2>
            <p className="mt-4 text-sm text-white/75 sm:text-base">
              List it for free. No listing fees, no commission — just students helping students.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} href="/create-listing" variant="accent" size="lg" icon={PlusCircle}>
                Post a listing
              </Button>
              <Button
                as={Link}
                href="/marketplace"
                variant="outline"
                size="lg"
                iconRight={ArrowRight}
                className="border-white/25 text-white hover:border-white/40 hover:bg-white/10 hover:text-white"
              >
                Browse the marketplace
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
