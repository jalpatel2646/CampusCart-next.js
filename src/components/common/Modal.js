"use client";

import { useEffect, useCallback, useRef } from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { IconButton } from "./IconButton";

/**
 * Modal/Dialog component with overlay, accessible keyboard support.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  className,
}) {
  const overlayRef = useRef(null);

  const SIZES = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-[calc(100vw-2rem)]",
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Escape") onClose?.();
    },
    [onClose]
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[var(--z-modal)]">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className={cn(
            "relative w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-card)] shadow-[var(--shadow-xl)]",
            "animate-fade-in",
            "max-h-[85vh] overflow-y-auto",
            SIZES[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || onClose) && (
            <div className="flex items-start justify-between p-5 pb-0">
              <div>
                {title && (
                  <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {title}
                  </h2>
                )}
                {description && (
                  <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                    {description}
                  </p>
                )}
              </div>
              {onClose && (
                <IconButton
                  icon={X}
                  label="Close dialog"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="shrink-0 -mt-1 -mr-1"
                />
              )}
            </div>
          )}

          {/* Body */}
          <div className="p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
