import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with clsx for conditional classes
 * and tailwind-merge for deduplication.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
