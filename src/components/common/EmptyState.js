import { cn } from "@/utils/cn";
import { PackageOpen } from "lucide-react";
import { Button } from "./Button";

/**
 * Empty state component for when there's no data to display.
 */
export function EmptyState({
  icon: Icon = PackageOpen,
  title = "No items found",
  description,
  action,
  actionLabel = "Get started",
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-16 px-4",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-bg-secondary)] mb-4">
        <Icon className="h-8 w-8 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 text-sm text-[var(--color-text-secondary)] max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button variant="primary" onClick={action}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
