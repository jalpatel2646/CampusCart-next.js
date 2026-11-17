import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

/**
 * Checkbox component with label support.
 */
export const Checkbox = forwardRef(function Checkbox(
  { label, className, disabled, id, ...props },
  ref
) {
  const checkboxId = id || (label ? `cb-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={checkboxId}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          disabled={disabled}
          className={cn(
            "peer h-5 w-5 shrink-0 appearance-none rounded-md border border-[var(--color-border)]",
            "bg-[var(--color-bg-card)] transition-all duration-150 cursor-pointer",
            "checked:bg-[var(--color-primary-navy)] checked:border-[var(--color-primary-navy)]",
            "hover:border-[var(--color-border-hover)]",
            "focus-visible:ring-2 focus-visible:ring-[var(--color-primary-navy)] focus-visible:ring-offset-1",
            disabled && "cursor-not-allowed",
            className
          )}
          {...props}
        />
        <Check className="absolute h-3.5 w-3.5 text-[var(--color-accent-lime)] pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-150" />
      </div>
      {label && (
        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-navy)] transition-colors duration-150">
          {label}
        </span>
      )}
    </label>
  );
});
