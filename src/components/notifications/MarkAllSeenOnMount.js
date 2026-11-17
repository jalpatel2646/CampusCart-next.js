"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { markAllNotificationsSeen } from "@/lib/api";

/**
 * Marks all notifications as seen on mount and refreshes the navbar badge.
 * Placing it on the buyer inbox means the badge clears on visit, matching
 * how an inbox behaves in most apps.
 */
export function MarkAllSeenOnMount() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    markAllNotificationsSeen()
      .then((result) => {
        if (!cancelled && result?.marked > 0) {
          router.refresh();
        }
      })
      .catch(() => {
        // The badge is cosmetic; a failed clear should not disrupt the page.
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
