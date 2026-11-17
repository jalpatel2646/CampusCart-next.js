import { forwardRef } from "react";
import { cn } from "@/utils/cn";

const SIZES = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

const VARIANTS = {
  ghost:
    "bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:text-[var(--color-text-primary)]",
  outline:
    "border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-main)] hover:border-[var(--color-border-hover)]",
  filled:
    "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]",
};

/**
 * Icon-only button for compact actions.
 */
export const IconButton = forwardRef(function IconButton(
  {
    icon: Icon,
    variant = "ghost",
    size = "md",
    className,
    disabled,
    label,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-lg transition-all duration-150 cursor-pointer",
        "active:scale-[0.95]",
        SIZES[size],
        VARIANTS[variant],
        disabled && "opacity-50 pointer-events-none",
        className
      )}
      disabled={disabled}
      aria-label={label}
      {...props}
    >
      <Icon className={cn(size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5.5 w-5.5" : "h-5 w-5")} />
    </button>
  );
});
