"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Save, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Textarea } from "@/components/common/Textarea";
import { updateEnquiryStatus } from "@/lib/api";

const ACTION_COPY = {
  Accepted: {
    title: "Accept this offer?",
    description:
      "The enquiry will be recorded as accepted. Contact the buyer directly to arrange payment and handover.",
    confirmLabel: "Accept offer",
  },
  Rejected: {
    title: "Reject this offer?",
    description:
      "The enquiry will be recorded as rejected. Contact the buyer directly if you want to explain why.",
    confirmLabel: "Reject offer",
  },
  Closed: {
    title: "Close this enquiry?",
    description:
      "Closed enquiries cannot be reopened. Use this when the conversation is finished or the item is no longer available.",
    confirmLabel: "Close enquiry",
  },
};

/** Seller controls for accepting, rejecting, closing, and annotating an enquiry. */
export function EnquiryActions({ enquiry }) {
  const router = useRouter();
  const [reply, setReply] = useState(enquiry.sellerResponse ?? "");
  const [busy, setBusy] = useState("");
  const [confirmStatus, setConfirmStatus] = useState(null);

  async function applyStatus(target, { skipConfirm = false } = {}) {
    if (!target || busy) return;
    if (!skipConfirm && target !== enquiry.status) {
      setConfirmStatus(target);
      return;
    }

    setBusy(target);
    try {
      await updateEnquiryStatus(enquiry._id, {
        status: target,
        sellerResponse: reply.trim(),
      });
      toast.success(
        target === enquiry.status ? "Response saved" : `Enquiry marked ${target.toLowerCase()}`
      );
      setConfirmStatus(null);
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not update the enquiry");
    } finally {
      setBusy("");
    }
  }

  const canAccept = enquiry.status === "Pending";
  const canReject = enquiry.status === "Pending";
  const canClose = enquiry.status === "Pending" || enquiry.status === "Accepted" || enquiry.status === "Rejected";

  return (
    <div className="mt-4 border-t border-[var(--color-border)] pt-4">
      <Textarea
        label="Response note"
        rows={2}
        value={reply}
        onChange={(event) => setReply(event.target.value)}
        placeholder="e.g. Still available — meet at the library entrance after 4 pm."
        helperText="Saved with the enquiry. Saving a note does not send an email, so contact the buyer directly at the address above."
      />

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {canAccept && (
          <Button
            type="button"
            variant="success"
            size="sm"
            icon={Check}
            loading={busy === "Accepted"}
            disabled={busy !== ""}
            onClick={() => applyStatus("Accepted")}
          >
            Accept offer
          </Button>
        )}
        {canReject && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            icon={X}
            loading={busy === "Rejected"}
            disabled={busy !== ""}
            onClick={() => applyStatus("Rejected")}
          >
            Reject offer
          </Button>
        )}
        {canClose && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={busy === "Closed"}
            disabled={busy !== ""}
            onClick={() => applyStatus("Closed")}
          >
            Close enquiry
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          icon={Save}
          loading={busy === enquiry.status}
          disabled={busy !== "" || reply.trim() === (enquiry.sellerResponse ?? "")}
          onClick={() => applyStatus(enquiry.status, { skipConfirm: true })}
        >
          Save note
        </Button>
      </div>

      <Modal
        open={Boolean(confirmStatus)}
        onClose={() => setConfirmStatus(null)}
        title={confirmStatus ? ACTION_COPY[confirmStatus]?.title : ""}
        description={confirmStatus ? ACTION_COPY[confirmStatus]?.description : ""}
        size="sm"
      >
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setConfirmStatus(null)}>
            Cancel
          </Button>
          <Button
            variant={confirmStatus === "Accepted" ? "success" : confirmStatus === "Rejected" ? "danger" : "primary"}
            loading={busy === confirmStatus}
            onClick={() => applyStatus(confirmStatus, { skipConfirm: true })}
          >
            {confirmStatus ? ACTION_COPY[confirmStatus]?.confirmLabel : "Confirm"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
