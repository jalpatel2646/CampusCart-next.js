import { cn } from "@/utils/cn";

/**
 * Section heading component for consistent page section titles.
 */
export function SectionHeading({
  title,
  subtitle,
  action,
  className,
  as: Tag = "h2",
  size = "md",
}) {
  const sizes = {
    sm: "text-lg sm:text-xl",
    md: "text-xl sm:text-2xl",
    lg: "text-2xl sm:text-3xl",
    xl: "text-3xl sm:text-4xl",
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 sm:gap-4",
        className
      )}
    >
      <div>
        <Tag
          className={cn(
            "font-bold tracking-tight text-[var(--color-text-primary)]",
            sizes[size]
          )}
        >
          {title}
        </Tag>
        {subtitle && (
          <p className="mt-1 text-sm sm:text-base text-[var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
