import { forwardRef } from "react";
import { cn } from "@/utils/cn";
import { ChevronDown } from "lucide-react";

/**
 * Select dropdown component with label, helper text, and error state.
 */
export const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    placeholder = "Select an option",
    className,
    wrapperClassName,
    id,
    disabled,
    required,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          disabled={disabled}
          required={required}
          className={cn(
            "block w-full appearance-none rounded-lg border bg-[var(--color-bg-card)] px-3.5 py-2.5 pr-10 text-sm text-[var(--color-text-primary)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-navy)] focus:ring-offset-1 focus:border-[var(--color-border-focus)]",
            error
              ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
            disabled && "opacity-50 cursor-not-allowed bg-[var(--color-bg-main)]",
            className
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) =>
            typeof opt === "string" ? (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ) : (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            )
          )}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
        </div>
      </div>
      {(error || helperText) && (
        <p
          className={cn(
            "text-xs",
            error ? "text-[var(--color-error)]" : "text-[var(--color-text-muted)]"
          )}
        >
          {error || helperText}
        </p>
      )}
    </div>
  );
});
