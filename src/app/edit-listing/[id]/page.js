import { notFound, redirect } from "next/navigation";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { PageContainer } from "@/components/layout/PageContainer";
import { ListingForm } from "@/components/listings/ListingForm";
import { ServiceError } from "@/lib/errors";
import { referenceId } from "@/lib/ownership";
import { serializeListing } from "@/lib/serializers";
import { isOpenRouterEnabled } from "@/lib/openrouter";
import { getSellerSession } from "@/lib/session";
import { getListingById } from "@/services/listing.service";

export const metadata = {
  title: "Edit listing",
  description: "Update the details, price, or photos of your CampusCart listing.",
};

export default async function EditListingPage({ params }) {
  const { id } = await params;
  const sellerId = await getSellerSession();
  if (!sellerId) redirect(`/login?next=/edit-listing/${id}`);

  let listing;
  try {
    listing = await getListingById(id, { includeInactive: true });
  } catch (error) {
    if (error instanceof ServiceError && [400, 404].includes(error.statusCode)) notFound();
    throw error;
  }

  if (referenceId(listing.seller) !== sellerId) notFound();

  const serialized = serializeListing(listing);

  return (
    <PageContainer>
      <Breadcrumb
        items={[
          { label: "Marketplace", href: "/marketplace" },
          { label: serialized.name, href: `/product/${serialized._id}` },
          { label: "Edit" },
        ]}
      />

      <div className="mx-auto max-w-3xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Edit listing
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{serialized.name}</h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)] sm:text-base">
            Update the price, description, or photos. Changes appear on the marketplace right away.
          </p>
        </header>

        <ListingForm mode="edit" listing={serialized} assistEnabled={isOpenRouterEnabled} />
      </div>
    </PageContainer>
  );
}
