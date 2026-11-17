import { forwardRef } from "react";
import { cn } from "@/utils/cn";

/**
 * Input component with label, helper text, and error state.
 */
export const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    className,
    wrapperClassName,
    id,
    disabled,
    required,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-4.5 w-4.5 text-[var(--color-text-muted)]" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          className={cn(
            "block w-full rounded-lg border bg-[var(--color-bg-card)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)]",
            "placeholder:text-[var(--color-text-muted)]",
            "transition-colors duration-150",
            "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-navy)] focus:ring-offset-1 focus:border-[var(--color-border-focus)]",
            error
              ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
            Icon && "pl-10",
            disabled && "opacity-50 cursor-not-allowed bg-[var(--color-bg-main)]",
            className
          )}
          {...props}
        />
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
