import { Handshake, MessageCircle, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SectionHeading } from "@/components/common/SectionHeading";

const STEPS = [
  {
    icon: Search,
    title: "Find your thing",
    description: "Search the campus catalogue or filter by category, condition, and budget.",
  },
  {
    icon: MessageCircle,
    title: "Ask & make an offer",
    description: "Message the seller directly. Offer a price if the listed one is not quite right.",
  },
  {
    icon: Handshake,
    title: "Meet on campus",
    description: "Agree on a spot, meet up, and hand it over. No shipping, no waiting.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-card)]">
      <PageContainer className="py-12 sm:py-16">
        <SectionHeading
          title="How CampusCart works"
          subtitle="Three steps between you and a much cheaper semester."
        />

        <ol className="mt-8 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-main)] p-6"
              >
                <span className="absolute right-5 top-5 font-mono text-xs font-semibold text-[var(--color-text-muted)]">
                  0{index + 1}
                </span>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--color-primary)] text-[var(--color-accent)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[var(--color-text-primary)]">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-text-secondary)]">{step.description}</p>
              </li>
            );
          })}
        </ol>
      </PageContainer>
    </section>
  );
}
