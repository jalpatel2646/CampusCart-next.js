"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

/**
 * Product photo gallery with thumbnail switching.
 */
export function ImageGallery({ images = [], alt = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, Math.max(images.length - 1, 0));
  const activeImage = images[safeIndex];

  return (
    <div>
      <div className="relative aspect-4/3 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-[var(--color-text-muted)]">
            No photo available
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === safeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-colors duration-150",
                index === safeIndex
                  ? "border-[var(--color-primary)]"
                  : "border-transparent hover:border-[var(--color-border-hover)]"
              )}
            >
              <Image src={image} alt="" fill sizes="120px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
