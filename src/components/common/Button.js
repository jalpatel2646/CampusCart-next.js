import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Loader2 } from "lucide-react";

const VARIANTS = {
  primary:
    "bg-[var(--color-primary-navy)] text-[var(--color-accent-lime)] hover:bg-[var(--color-secondary-navy)] shadow-sm",
  secondary:
    "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)] shadow-sm",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text-primary)] hover:bg-[var(--color-bg-main)] hover:border-[var(--color-border-hover)]",
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]",
  accent:
    "bg-[var(--color-accent-lime)] text-[var(--color-primary-navy)] hover:bg-[var(--color-accent-lime-hover)] shadow-sm font-semibold",
  danger:
    "bg-[var(--color-error)] text-white hover:bg-red-700 shadow-sm",
  success:
    "bg-[var(--color-success)] text-white hover:bg-green-700 shadow-sm",
};

const SIZES = {
  xs: "h-7 px-2.5 text-xs gap-1 rounded-md",
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2 rounded-lg",
  xl: "h-14 px-8 text-base gap-2.5 rounded-xl font-semibold",
};

/**
 * Versatile Button component with multiple variants and sizes.
 */
export const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    className,
    disabled,
    loading,
    icon: Icon,
    iconRight: IconRight,
    fullWidth,
    as: Tag = "button",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <Tag
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none",
        "active:scale-[0.98]",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        isDisabled && "opacity-50 pointer-events-none cursor-not-allowed",
        className
      )}
      disabled={Tag === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight className="h-4 w-4 shrink-0" />
      )}
    </Tag>
  );
});
