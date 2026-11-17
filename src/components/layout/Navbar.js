"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ShoppingBag,
  Menu,
  X,
  Home,
  Store,
  Grid3X3,
  Heart,
  PlusCircle,
  LayoutDashboard,
  ChevronDown,
  BookOpen,
  Monitor,
  Armchair,
  Pencil,
  Package,
  LogOut,
} from "lucide-react";
import { cn } from "@/utils/cn";
import { PRODUCT_CATEGORIES } from "@/lib/constants";
import { signOut } from "@/lib/api";

const CATEGORY_ICONS = {
  Books: BookOpen,
  Electronics: Monitor,
  Furniture: Armchair,
  Stationery: Pencil,
  Other: Package,
};

const NAV_LINKS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: Store },
];

const SECONDARY_LINKS = [
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar({ user = null }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const dropdownRef = useRef(null);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not sign you out");
      setSigningOut(false);
    }
  }

  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "";
  const initials =
    user?.name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  // Track scroll for subtle shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 2);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile menu on Escape
  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const isActive = (href) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-[var(--z-sticky)] w-full transition-shadow duration-200",
        "bg-[var(--color-bg-card)] border-b border-[var(--color-border)]",
        scrolled && "shadow-[var(--shadow-nav)]"
      )}
    >
      <nav className="mx-auto flex max-w-[var(--container-2xl)] items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
          aria-label="CampusCart Home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-primary-navy)] transition-transform duration-200 group-hover:scale-105">
            <ShoppingBag className="h-5 w-5 text-[var(--color-accent-lime)]" />
          </span>
          <span className="text-xl font-bold tracking-tight text-[var(--color-primary-navy)]">
            Campus<span className="text-[var(--color-text-secondary)]">Cart</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                  isActive(link.href)
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-navy)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}

          {/* Categories Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setCategoriesOpen(!categoriesOpen)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                categoriesOpen
                  ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-navy)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)]"
              )}
              aria-expanded={categoriesOpen}
              aria-haspopup="true"
            >
              <Grid3X3 className="h-4 w-4" />
              Categories
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  categoriesOpen && "rotate-180"
                )}
              />
            </button>

            {categoriesOpen && (
              <div className="animate-slide-down absolute left-0 top-full mt-1 w-52 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-card)] p-2 shadow-[var(--shadow-lg)] z-[var(--z-dropdown)]">
                {PRODUCT_CATEGORIES.map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat] || Package;
                  return (
                    <Link
                      key={cat}
                      href={`/marketplace?category=${encodeURIComponent(cat)}`}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                      onClick={() => setCategoriesOpen(false)}
                    >
                      <CatIcon className="h-4 w-4" />
                      {cat}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {SECONDARY_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150",
                  isActive(link.href)
                    ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-navy)]"
                    : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)]"
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/create-listing"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-navy)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-lime)] shadow-sm hover:bg-[var(--color-secondary-navy)] active:scale-[0.98] transition-all duration-150"
              >
                <PlusCircle className="h-4 w-4" />
                Sell Product
              </Link>
              <div className="flex items-center gap-1 border-l border-[var(--color-border)] pl-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-secondary)] text-xs font-semibold text-[var(--color-primary-navy)]">
                    {initials}
                  </span>
                  <span className="max-w-28 truncate">{firstName || "Account"}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  title="Sign out"
                  aria-label="Sign out"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary-navy)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-lime)] shadow-sm hover:bg-[var(--color-secondary-navy)] active:scale-[0.98] transition-all duration-150"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] transition-colors duration-150"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileOpen && (
        <div className="animate-slide-down md:hidden border-t border-[var(--color-border)] bg-[var(--color-bg-card)]">
          <div className="mx-auto max-w-[var(--container-2xl)] px-4 py-3 space-y-1">
            {NAV_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    isActive(link.href)
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-navy)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Categories */}
            <div className="px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {PRODUCT_CATEGORIES.map((cat) => {
                  const CatIcon = CATEGORY_ICONS[cat] || Package;
                  return (
                    <Link
                      key={cat}
                      href={`/marketplace?category=${encodeURIComponent(cat)}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)] transition-colors duration-150"
                    >
                      <CatIcon className="h-4 w-4" />
                      {cat}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[var(--color-border)] my-2" />

            {SECONDARY_LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                    isActive(link.href)
                      ? "bg-[var(--color-bg-secondary)] text-[var(--color-primary-navy)]"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]"
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile CTA */}
            {user ? (
              <div className="mt-2 space-y-1.5">
                <Link
                  href="/create-listing"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-navy)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-lime)] hover:bg-[var(--color-secondary-navy)] transition-colors duration-150"
                >
                  <PlusCircle className="h-4 w-4" />
                  Sell Product
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    handleSignOut();
                  }}
                  disabled={signingOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] transition-colors duration-150 disabled:opacity-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out ({user.name})
                </button>
              </div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-lg border border-[var(--color-border)] px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] transition-colors duration-150"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center rounded-lg bg-[var(--color-primary-navy)] px-4 py-3 text-sm font-semibold text-[var(--color-accent-lime)] hover:bg-[var(--color-secondary-navy)] transition-colors duration-150"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
