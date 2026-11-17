"use client";

import { useEffect, useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { uploadImages } from "@/lib/api";
import { cn } from "@/utils/cn";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

let idCounter = 0;
const nextId = () => {
  idCounter += 1;
  return `image-${idCounter}`;
};

/**
 * Photo picker that uploads each file through /api/uploads and reports only
 * successfully stored Cloudinary URLs back to the form.
 */
export function ImageUploader({
  value = [],
  onChange,
  onUploadingChange,
  max = 5,
  error,
  label = "Photos",
}) {
  const inputRef = useRef(null);
  const itemsRef = useRef([]);
  const [items, setItems] = useState(() =>
    (value ?? []).map((url) => ({ id: nextId(), url, status: "done" }))
  );
  const [uploadingCount, setUploadingCount] = useState(0);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    onUploadingChange?.(uploadingCount > 0);
  }, [uploadingCount, onUploadingChange]);

  useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.preview) URL.revokeObjectURL(item.preview);
      }
    },
    []
  );

  function sync(nextItems) {
    itemsRef.current = nextItems;
    setItems(nextItems);
    onChange(nextItems.filter((item) => item.status === "done").map((item) => item.url));
  }

  function addFiles(fileList) {
    setUploadError("");
    const files = Array.from(fileList ?? []);
    const room = max - itemsRef.current.length;
    if (room <= 0) {
      setUploadError(`You can add up to ${max} photos.`);
      return;
    }

    const accepted = [];
    for (const file of files.slice(0, room)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError("Photos must be JPG, PNG, or WebP.");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setUploadError("Each photo must be 5 MB or smaller.");
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length === 0) return;

    const pending = accepted.map((file) => ({
      id: nextId(),
      file,
      preview: URL.createObjectURL(file),
      url: null,
      status: "uploading",
    }));

    sync([...itemsRef.current, ...pending]);
    setUploadingCount((count) => count + pending.length);

    for (const item of pending) {
      uploadItem(item.id, item.file);
    }
  }

  async function uploadItem(id, file) {
    try {
      const result = await uploadImages([file]);
      const url = result?.urls?.[0];
      if (!url) throw new Error("The upload finished without a URL. Please try again.");

      const target = itemsRef.current.find((item) => item.id === id);
      if (!target) return;

      if (target.preview) URL.revokeObjectURL(target.preview);
      sync(
        itemsRef.current.map((item) =>
          item.id === id ? { ...item, url, preview: undefined, status: "done" } : item
        )
      );
    } catch (uploadFailure) {
      const target = itemsRef.current.find((item) => item.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      sync(itemsRef.current.filter((item) => item.id !== id));
      setUploadError(uploadFailure.message || "The photo could not be uploaded.");
    } finally {
      setUploadingCount((count) => Math.max(0, count - 1));
    }
  }

  function removeItem(id) {
    const target = itemsRef.current.find((item) => item.id === id);
    if (target?.preview) URL.revokeObjectURL(target.preview);
    sync(itemsRef.current.filter((item) => item.id !== id));
  }

  const shownError = error || uploadError;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          {label} <span className="text-[var(--color-error)]">*</span>
        </p>
        <span className="text-xs tabular-nums text-[var(--color-text-muted)]">
          {items.filter((item) => item.status === "done").length}/{max}
        </span>
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "mt-2 rounded-xl border-2 border-dashed p-4 transition-colors duration-150",
          shownError
            ? "border-[var(--color-error)] bg-[var(--color-error-bg)]"
            : "border-[var(--color-border)] bg-[var(--color-bg-main)] hover:border-[var(--color-border-hover)]"
        )}
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => {
            const preview = item.preview ?? item.url;
            const isUploading = item.status === "uploading";

            return (
              <div
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]"
              >
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="h-full w-full object-cover" />
                ) : null}

                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white">
                    <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                    <span className="text-[11px] font-medium">Uploading</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove photo"
                  className="absolute right-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-md bg-black/60 text-white transition-colors duration-150 hover:bg-black/80"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            );
          })}

          {items.length < max && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-bg-card)] text-[var(--color-text-muted)] transition-colors duration-150 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              <ImagePlus className="h-6 w-6" aria-hidden="true" />
              <span className="text-xs font-medium">Add photo</span>
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />

        <p className="mt-3 text-xs text-[var(--color-text-muted)]">
          Drag and drop or click to add. JPG, PNG, or WebP, up to 5 MB each and {max} photos
          total.
        </p>
      </div>

      {shownError && <p className="mt-1.5 text-xs text-[var(--color-error)]">{shownError}</p>}
    </div>
  );
}
