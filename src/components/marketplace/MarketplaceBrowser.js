"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Checkbox } from "@/components/common/Checkbox";
import { Input } from "@/components/common/Input";
import { Radio } from "@/components/common/Radio";
import { SaveSearchButton } from "@/components/marketplace/SaveSearchButton";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/lib/constants";
import { cn } from "@/utils/cn";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: low to high" },
  { value: "price_desc", label: "Price: high to low" },
  { value: "relevance", label: "Best match" },
];

function setOrDelete(params, key, value) {
  if (value === undefined || value === null || value === "") params.delete(key);
  else params.set(key, value);
}

/**
 * Interactive marketplace shell: search, sort, and filter sidebar.
 * Filter state lives in the URL so results stay shareable and server-rendered.
 */
export function MarketplaceBrowser({ summary, categoryCounts = {}, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // The query string is the single source of truth. Uncontrolled inputs are
  // re-keyed when it changes so the form always mirrors the active filters.
  const paramsKey = searchParams.toString();
  const searchValue = searchParams.get("search") ?? "";
  const sort = searchParams.get("sort") ?? "newest";
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedConditions = searchParams.getAll("condition");

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedConditions.length +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0);

  function navigate(mutate) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    mutate(params);
    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  function handleSearch(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value = String(data.get("search") ?? "").trim();
    navigate((params) => setOrDelete(params, "search", value));
  }

  function handleApplyFilters(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const category = String(data.get("category") ?? "");
    const conditions = data.getAll("condition").map(String);
    const minPrice = String(data.get("minPrice") ?? "").trim();
    const maxPrice = String(data.get("maxPrice") ?? "").trim();

    navigate((params) => {
      setOrDelete(params, "category", category);
      params.delete("condition");
      conditions.forEach((condition) => params.append("condition", condition));
      setOrDelete(params, "minPrice", minPrice);
      setOrDelete(params, "maxPrice", maxPrice);
    });
    setFiltersOpen(false);
  }

  function handleReset() {
    setFiltersOpen(false);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  function handleSort(event) {
    const value = event.target.value;
    navigate((params) => setOrDelete(params, "sort", value === "newest" ? "" : value));
  }

  return (
    <div>
      {/* Search + sort toolbar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form onSubmit={handleSearch} role="search" className="w-full md:max-w-md">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <input
              key={`search-${paramsKey}`}
              type="search"
              name="search"
              defaultValue={searchValue}
              placeholder="Search textbooks, laptops, chairs…"
              aria-label="Search listings"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-24 text-sm text-[var(--color-text-primary)] transition-colors duration-150 placeholder:text-[var(--color-text-muted)] hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-accent)] transition-colors duration-150 hover:bg-[var(--color-primary-hover)]"
            >
              Search
            </button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            aria-expanded={filtersOpen}
            aria-controls="marketplace-filters"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3.5 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-semibold text-[var(--color-accent)]">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="relative">
            <label htmlFor="sort-listings" className="sr-only">
              Sort listings
            </label>
            <ArrowUpDown
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
            <select
              id="sort-listings"
              value={sort}
              onChange={handleSort}
              className="appearance-none rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-card)] py-2.5 pl-9 pr-9 text-sm font-medium text-[var(--color-text-primary)] transition-colors duration-150 hover:border-[var(--color-border-hover)] focus:border-[var(--color-border-focus)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-1"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]"
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Filter sidebar / mobile drawer */}
        <aside
          id="marketplace-filters"
          className={cn(
            "mb-6 lg:sticky lg:top-20 lg:mb-0 lg:block",
            filtersOpen ? "block" : "hidden"
          )}
        >
          <form
            key={`filters-${paramsKey}`}
            onSubmit={handleApplyFilters}
            className="space-y-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-5 shadow-[var(--shadow-card)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Filters</h2>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[var(--color-text-muted)] transition-colors duration-150 hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)] lg:hidden"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Category
              </legend>
              <div className="mt-3 space-y-2.5">
                <Radio
                  name="category"
                  value=""
                  label="All categories"
                  defaultChecked={selectedCategory === ""}
                />
                {PRODUCT_CATEGORIES.map((option) => (
                  <div key={option} className="flex items-center justify-between gap-2">
                    <Radio
                      name="category"
                      value={option}
                      label={option}
                      defaultChecked={selectedCategory === option}
                    />
                    <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
                      {categoryCounts[option] ?? 0}
                    </span>
                  </div>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Condition
              </legend>
              <div className="mt-3 flex flex-col gap-2.5">
                {PRODUCT_CONDITIONS.map((option) => (
                  <Checkbox
                    key={option}
                    name="condition"
                    value={option}
                    label={option}
                    defaultChecked={selectedConditions.includes(option)}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Price range
              </legend>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Input
                  id="filter-min-price"
                  name="minPrice"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Min ₹"
                  aria-label="Minimum price in rupees"
                  defaultValue={searchParams.get("minPrice") ?? ""}
                />
                <Input
                  id="filter-max-price"
                  name="maxPrice"
                  type="number"
                  min="0"
                  inputMode="numeric"
                  placeholder="Max ₹"
                  aria-label="Maximum price in rupees"
                  defaultValue={searchParams.get("maxPrice") ?? ""}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                Tip: leave blank for any price. Free listings are ₹0.
              </p>
            </fieldset>

            <div className="space-y-2 border-t border-[var(--color-border)] pt-5">
              <Button type="submit" fullWidth loading={isPending}>
                Apply filters
              </Button>
              <Button type="button" variant="ghost" fullWidth icon={RotateCcw} onClick={handleReset}>
                Reset all
              </Button>
            </div>
          </form>
        </aside>

        {/* Results */}
        <section
          aria-live="polite"
          className={cn("transition-opacity duration-200", isPending && "opacity-60")}
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[var(--color-text-secondary)]">{summary}</p>
            <SaveSearchButton />
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}
