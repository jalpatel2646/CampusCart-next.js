"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    console.error("[CampusCart] Unhandled route error", error);
  }, [error]);

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-error-bg)]">
        <AlertTriangle className="h-8 w-8 text-[var(--color-error)]" aria-hidden="true" />
      </span>

      <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-[var(--color-text-secondary)] sm:text-base">
        This page could not be loaded. The problem has been logged. Try again, and if it keeps
        happening, let us know through the project issue tracker.
      </p>

      {error?.digest && (
        <p className="mt-2 font-mono text-xs text-[var(--color-text-muted)]">
          Reference: {error.digest}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button type="button" onClick={() => reset()} icon={RotateCcw}>
          Try again
        </Button>
        <Button as={Link} href="/" variant="outline">
          Go to the homepage
        </Button>
      </div>
    </section>
  );
}
