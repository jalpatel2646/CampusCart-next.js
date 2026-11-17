"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { markAllSavedSearchesSeen } from "@/lib/api";

/** Marks every saved search on the account as seen (clears "new" badges). */
export function MarkAllSeenButton({ disabled = false }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleClick() {
    if (busy || disabled) return;
    setBusy(true);
    try {
      await markAllSavedSearchesSeen();
      toast.success("All saved searches marked as seen");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not update your searches");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      icon={CheckCheck}
      loading={busy}
      disabled={disabled || busy}
      onClick={handleClick}
    >
      Mark all seen
    </Button>
  );
}
