import { forwardRef } from "react";
import { cn } from "@/utils/cn";

/**
 * Textarea component with label, helper text, and error state.
 */
export const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className,
    wrapperClassName,
    id,
    disabled,
    required,
    rows = 4,
    ...props
  },
  ref
) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
          {required && <span className="text-[var(--color-error)] ml-0.5">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        disabled={disabled}
        required={required}
        className={cn(
          "block w-full rounded-lg border bg-[var(--color-bg-card)] px-3.5 py-2.5 text-sm text-[var(--color-text-primary)] resize-y",
          "placeholder:text-[var(--color-text-muted)]",
          "transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-navy)] focus:ring-offset-1 focus:border-[var(--color-border-focus)]",
          error
            ? "border-[var(--color-error)] focus:ring-[var(--color-error)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
          disabled && "opacity-50 cursor-not-allowed bg-[var(--color-bg-main)]",
          className
        )}
        {...props}
      />
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
