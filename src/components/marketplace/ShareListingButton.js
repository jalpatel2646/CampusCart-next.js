"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Check, Copy, Download, Share2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode-generator";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";

const MARGIN_MODULES = 4;
const CELL_PX = 8;
const PNG_SCALE = 16;

/** Builds the QR matrix once per URL, shared by the inline SVG and canvas. */
function useQrMatrix(url) {
  return useMemo(() => {
    const qr = QRCode(0, "M");
    qr.addData(url);
    qr.make();

    const moduleCount = qr.getModuleCount();
    const modules = [];
    for (let row = 0; row < moduleCount; row += 1) {
      const line = [];
      for (let col = 0; col < moduleCount; col += 1) {
        line.push(qr.isDark(row, col) ? 1 : 0);
      }
      modules.push(line);
    }
    return { moduleCount, modules };
  }, [url]);
}

function slugify(value) {
  const slug = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
  return slug || "listing";
}

/** Detect native Web Share support without hydration mismatch. */
const subscribeNoop = () => () => {};
const getShareSnapshot = () =>
  typeof navigator !== "undefined" && typeof navigator.share === "function";
const getServerShareSnapshot = () => false;

/** Share control for the product page: QR code, copy link, PNG download. */
export function ShareListingButton({ url, title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const canNativeShare = useSyncExternalStore(
    subscribeNoop,
    getShareSnapshot,
    getServerShareSnapshot
  );
  const { moduleCount, modules } = useQrMatrix(url);

  const totalModules = moduleCount + MARGIN_MODULES * 2;
  const size = Math.max(totalModules * CELL_PX, 240);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Older browsers without the clipboard API fall back to execCommand.
      try {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (ok) {
          setCopied(true);
          toast.success("Link copied to clipboard");
          window.setTimeout(() => setCopied(false), 1800);
        } else {
          throw new Error("copy failed");
        }
      } catch {
        toast.error("Could not copy the link — select it and copy manually instead");
      }
    }
  }

  function downloadPng() {
    const canvas = document.createElement("canvas");
    const pixelSize = totalModules * PNG_SCALE;
    canvas.width = pixelSize;
    canvas.height = pixelSize;

    const context = canvas.getContext("2d");
    if (!context) {
      toast.error("Could not create the image");
      return;
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pixelSize, pixelSize);
    context.fillStyle = "#111827";

    for (let row = 0; row < moduleCount; row += 1) {
      for (let col = 0; col < moduleCount; col += 1) {
        if (modules[row][col]) {
          context.fillRect(
            (col + MARGIN_MODULES) * PNG_SCALE,
            (row + MARGIN_MODULES) * PNG_SCALE,
            PNG_SCALE,
            PNG_SCALE
          );
        }
      }
    }

    const anchor = document.createElement("a");
    anchor.href = canvas.toDataURL("image/png");
    anchor.download = `campuscart-${slugify(title)}.png`;
    anchor.click();
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: `Check out this listing on CampusCart`, url });
    } catch (error) {
      // Not fatal — the user may have dismissed the share sheet.
      if (error?.name !== "AbortError") {
        toast.error(error?.message || "Could not open the share sheet");
      }
    }
  }

  const cells = [];
  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (modules[row][col]) {
        cells.push(
          <rect
            key={`${row}-${col}`}
            x={(col + MARGIN_MODULES) * CELL_PX}
            y={(row + MARGIN_MODULES) * CELL_PX}
            width={CELL_PX}
            height={CELL_PX}
          />
        );
      }
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        fullWidth
        icon={Share2}
        onClick={() => setOpen(true)}
      >
        Share this listing
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Share this listing"
        description="Drop it on a poster, the hostel noticeboard, or a group chat — scan to open."
        size="sm"
      >
        <div className="flex flex-col items-center">
          <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-[var(--shadow-card)]">
            <svg
              role="img"
              aria-label={`QR code linking to ${url}`}
              width={size}
              height={size}
              viewBox={`0 0 ${totalModules * CELL_PX} ${totalModules * CELL_PX}`}
              fill="#111827"
              shapeRendering="crispEdges"
            >
              <rect width="100%" height="100%" fill="#ffffff" />
              {cells}
            </svg>
          </div>

          <p className="mt-4 w-full truncate rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-3 py-2 text-center text-xs text-[var(--color-text-secondary)]">
            {url}
          </p>

          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant={copied ? "success" : "outline"}
              size="sm"
              icon={copied ? Check : Copy}
              onClick={copyLink}
            >
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button type="button" variant="outline" size="sm" icon={Download} onClick={downloadPng}>
              Save PNG
            </Button>
            {canNativeShare && (
              <Button type="button" variant="ghost" size="sm" icon={Smartphone} onClick={nativeShare}>
                More…
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
