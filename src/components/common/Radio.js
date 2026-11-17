import { forwardRef } from "react";
import { cn } from "@/utils/cn";

/**
 * Radio button component with label support.
 */
export const Radio = forwardRef(function Radio(
  { label, className, disabled, id, ...props },
  ref
) {
  const radioId = id || (label ? `radio-${label.toLowerCase().replace(/\s+/g, "-")}` : undefined);

  return (
    <label
      htmlFor={radioId}
      className={cn(
        "inline-flex items-center gap-2.5 cursor-pointer select-none group",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <input
        ref={ref}
        type="radio"
        id={radioId}
        disabled={disabled}
        className={cn(
          "h-5 w-5 shrink-0 appearance-none rounded-full border-2 border-[var(--color-border)]",
          "bg-[var(--color-bg-card)] transition-all duration-150 cursor-pointer",
          "checked:border-[var(--color-primary-navy)] checked:bg-[var(--color-primary-navy)]",
          "checked:shadow-[inset_0_0_0_3px_var(--color-bg-card)]",
          "hover:border-[var(--color-border-hover)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-primary-navy)] focus-visible:ring-offset-1",
          disabled && "cursor-not-allowed",
          className
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-[var(--color-text-primary)] group-hover:text-[var(--color-primary-navy)] transition-colors duration-150">
          {label}
        </span>
      )}
    </label>
  );
});
