import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthForm } from "@/components/auth/AuthForm";
import { Skeleton } from "@/components/common/Skeleton";
import { safeRedirectPath } from "@/lib/redirects";
import { getSellerSession } from "@/lib/session";

export const metadata = {
  title: "Sign in",
  description: "Sign in to your CampusCart account to list items and manage enquiries.",
};

export default function LoginPage({ searchParams }) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-8 sm:py-14">
        <header className="mb-7 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Welcome back
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Sign in</h1>
          <p className="mt-3 text-sm text-[var(--color-text-secondary)]">
            Manage your listings, saved items, and enquiries.
          </p>
        </header>

        <Suspense fallback={<AuthSkeleton />}>
          <LoginContent searchParams={searchParams} />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function LoginContent({ searchParams }) {
  const { next } = await searchParams;
  const sellerId = await getSellerSession();
  if (sellerId) redirect(safeRedirectPath(next));

  return <AuthForm mode="login" next={next} />;
}

function AuthSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />;
}
