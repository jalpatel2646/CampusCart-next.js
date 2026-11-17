import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { PageContainer } from "@/components/layout/PageContainer";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const metadata = {
  title: "Seller dashboard",
  description: "Manage your CampusCart listings, enquiries, and offers.",
};

export default function DashboardLayout({ children }) {
  return (
    <PageContainer>
      <header className="border-b border-[var(--color-border)] pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Seller workspace
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Your CampusCart dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-secondary)]">
              Manage availability, answer enquiries, and keep track of offers from your
              CampusCart account.
            </p>
          </div>
          <Button as={Link} href="/create-listing" icon={PlusCircle} className="shrink-0">
            Post a listing
          </Button>
        </div>

        <div className="mt-6">
          <DashboardNav />
        </div>
      </header>

      <div className="mt-8">{children}</div>
    </PageContainer>
  );
}
