"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-gray-500">{error?.message ?? "Unexpected error"}</p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-md bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </main>
  );
}
