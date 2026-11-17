import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/auth/AuthForm";
import { Skeleton } from "@/components/common/Skeleton";
import { safeRedirectPath } from "@/lib/redirects";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Create an account",
  description:
    "Create a free CampusCart account to list items, save favourites, and manage buyer enquiries.",
};

export default function SignupPage({ searchParams }) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <header className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Join CampusCart
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Create an account</h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Free to join. List your items, save favourites, and talk to buyers directly.
          </p>
        </header>

        <Suspense fallback={<AuthSkeleton />}>
          <SignupContent searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function SignupContent({ searchParams }) {
  const { next } = await searchParams;
  const sellerId = await getSellerSession();
  if (sellerId) redirect(safeRedirectPath(next));

  return <AuthForm mode="signup" next={next} />;
}

function AuthSkeleton() {
  return <Skeleton className="h-96 w-full rounded-xl" />;
}
