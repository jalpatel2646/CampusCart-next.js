"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gavel, LayoutDashboard, ListChecks, MessageSquare } from "lucide-react";
import { cn } from "@/utils/cn";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/listings", label: "Listings", icon: ListChecks },
  { href: "/dashboard/enquiries", label: "Enquiries", icon: MessageSquare },
  { href: "/dashboard/offers", label: "Offers", icon: Gavel },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Dashboard sections" className="flex flex-wrap gap-1.5">
      {LINKS.map((link) => {
        const Icon = link.icon;
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-accent)]"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text-primary)]"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
