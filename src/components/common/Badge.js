import { cn } from "@/utils/cn";

const VARIANTS = {
  default: "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
  primary: "bg-[var(--color-primary-navy)] text-[var(--color-accent-lime)]",
  accent: "bg-[var(--color-accent-lime)] text-[var(--color-primary-navy)] font-semibold",
  success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
  error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
  info: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
  outline: "bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)]",
};

const SIZES = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1 text-sm",
};

/**
 * Badge component for status indicators, labels, and tags.
 */
export function Badge({
  children,
  variant = "default",
  size = "md",
  icon: Icon,
  dot,
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium whitespace-nowrap",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            variant === "success" && "bg-[var(--color-success)]",
            variant === "warning" && "bg-[var(--color-warning)]",
            variant === "error" && "bg-[var(--color-error)]",
            variant === "info" && "bg-[var(--color-info)]",
            variant === "default" && "bg-[var(--color-text-muted)]",
            variant === "primary" && "bg-[var(--color-accent-lime)]",
            variant === "accent" && "bg-[var(--color-primary-navy)]"
          )}
        />
      )}
      {Icon && <Icon className="h-3 w-3 shrink-0" />}
      {children}
    </span>
  );
}
