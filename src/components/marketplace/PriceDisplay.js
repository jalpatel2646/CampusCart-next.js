import { cn } from "@/utils/cn";

const FORMAT_OPTIONS = {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
};

/**
 * Consistent price display component.
 */
export function PriceDisplay({
  price,
  originalPrice,
  free,
  size = "md",
  className,
}) {
  const sizes = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  };

  if (free || price === 0) {
    return (
      <span
        className={cn(
          "font-bold text-[var(--color-success)]",
          sizes[size],
          className
        )}
      >
        FREE
      </span>
    );
  }

  const formatted = new Intl.NumberFormat("en-IN", FORMAT_OPTIONS).format(price);

  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span
        className={cn(
          "font-bold text-[var(--color-text-primary)]",
          sizes[size]
        )}
      >
        {formatted}
      </span>
      {originalPrice && originalPrice > price && (
        <span className="text-sm text-[var(--color-text-muted)] line-through">
          {new Intl.NumberFormat("en-IN", FORMAT_OPTIONS).format(originalPrice)}
        </span>
      )}
    </span>
  );
}
