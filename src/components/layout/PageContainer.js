import { cn } from "@/utils/cn";

/**
 * Reusable Container component for consistent max-width and padding.
 */
export function Container({ children, className, as: Tag = "div", ...props }) {
  return (
    <Tag
      className={cn(
        "mx-auto w-full max-w-[var(--container-2xl)] px-4 sm:px-6 lg:px-8",
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
}

/**
 * Page-level container with vertical padding.
 */
export function PageContainer({ children, className, ...props }) {
  return (
    <Container
      className={cn("py-8 sm:py-10 lg:py-12", className)}
      {...props}
    >
      {children}
    </Container>
  );
}
