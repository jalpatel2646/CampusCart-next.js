import { redirect } from "next/navigation";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { ListingForm } from "@/components/listings/ListingForm";
import { isOpenRouterEnabled } from "@/lib/openrouter";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Sell a product",
  description:
    "List textbooks, electronics, furniture, or stationery for students on your campus. Free to list, no commission.",
};

export default async function CreateListingPage() {
  const sellerId = await getSellerSession();
  if (!sellerId) redirect("/login?next=/create-listing");

  return (
    <PageContainer>
      <Breadcrumb
        items={[{ label: "Marketplace", href: "/marketplace" }, { label: "Sell a product" }]}
      />

      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Sell on CampusCart
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">List a product</h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
            Takes about two minutes. Your listing goes live immediately and buyers reach you
            directly — no listing fees.
          </p>
        </header>

        <ListingForm mode="create" assistEnabled={isOpenRouterEnabled} />
      </div>
    </PageContainer>
  );
}
