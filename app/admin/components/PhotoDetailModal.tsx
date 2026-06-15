"use client";

import { useEffect, useState } from "react";
import {
  CATEGORIES,
  formatPhotoDate,
  type PhotoRecord,
  type PhotoCategory,
} from "@/app/lib/photos";

// ============================================================
// PHOTO DETAIL MODAL — fullscreen view + edit + delete
// Established overlay pattern (fixed inset-0 z-50 bg-liol-bg/95).
//
// Left: the photo at its native aspect ratio, contained to the
//   viewport (object-contain — never cropped, never stretched).
// Right: metadata panel —
//   • name, category, date taken, caption, alt text → editable
//   • uploaded (created_at) → IMMUTABLE, visibly locked
//   • Save enables only when something actually changed
//   • Delete is two-stage: trash → "Confirm delete?" morph,
//     auto-reverting after 3s so a stray click can't nuke a photo
//
// Closes via X, backdrop click, or Escape. Body scroll locks
// while open (same contract as the public lightbox).
// Save/Delete are delegated up via props — today they mutate
// React state; next session they call Supabase. The modal
// doesn't know or care which.
// ============================================================

interface PhotoDetailModalProps {
  photo: PhotoRecord;
  onClose: () => void;
  onSave: (updated: PhotoRecord) => void;
  onDelete: (id: string) => void;
}

export default function PhotoDetailModal({
  photo,
  onClose,
  onSave,
  onDelete,
}: PhotoDetailModalProps) {
  // ── Editable draft — initialized from the record ──────────
  const [draft, setDraft] = useState({
    name: photo.name,
    category: photo.category as PhotoCategory,
    date_taken: photo.date_taken,
    caption: photo.caption,
    alt_text: photo.alt_text,
  });

  // ── Two-stage delete ──────────────────────────────────────
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  // Dirty check — Save only lights up when a field changed
  const isDirty =
    draft.name !== photo.name ||
    draft.category !== photo.category ||
    draft.date_taken !== photo.date_taken ||
    draft.caption !== photo.caption ||
    draft.alt_text !== photo.alt_text;

  // ── Escape-to-close + body scroll lock ────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  // Confirm state auto-reverts so an abandoned first click
  // doesn't leave a live "Confirm delete?" trap behind
  useEffect(() => {
    if (!confirmingDelete) return;
    const timer = setTimeout(() => setConfirmingDelete(false), 3000);
    return () => clearTimeout(timer);
  }, [confirmingDelete]);

  const set = <K extends keyof typeof draft>(key: K, value: (typeof draft)[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = () => {
    if (!isDirty) return;
    onSave({ ...photo, ...draft });
  };

  const handleDelete = () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    onDelete(photo.id);
  };

  // Shared field styles
  const labelCls =
    "text-[0.65rem] tracking-[0.08em] uppercase text-liol-subtext";
  const inputCls =
    "mt-1.5 w-full rounded-lg bg-liol-text/5 border border-liol-text/15 px-3.5 py-2 text-sm text-liol-text outline-none focus:border-liol-text/40 duration-200";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Photo details: ${photo.name}`}
      onClick={onClose}
      className="fixed inset-0 z-50 bg-liol-bg/95 flex items-center justify-center p-3 max-xs:p-2 md:p-8"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl 3xl:max-w-6xl max-h-full overflow-y-auto md:overflow-visible bg-liol-bg border border-liol-text/15 rounded-xl flex flex-col md:flex-row"
      >

        {/* ── Image — native ratio, contained, never cropped ── */}
        <div className="relative md:flex-1 bg-black/40 flex items-center justify-center rounded-t-xl md:rounded-l-xl md:rounded-tr-none min-h-[40vh] md:min-h-[70vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.src}
            alt={photo.alt_text}
            className="max-h-[40vh] md:max-h-[70vh] max-w-full object-contain"
          />

          {/* Close — top-left over the image */}
          <button
            onClick={onClose}
            aria-label="Close"
            autoFocus
            className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-liol-bg/70 flex items-center justify-center text-liol-text hover:text-liol-subtext duration-200 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>
        </div>

        {/* ── Metadata panel ─────────────────────────────────── */}
        <div className="md:w-80 shrink-0 p-5 max-xs:p-4 flex flex-col gap-4 border-t md:border-t-0 md:border-l border-liol-text/10">

          {/* Name */}
          <div>
            <label htmlFor="photo-name" className={labelCls}>Name</label>
            <input
              id="photo-name"
              type="text"
              value={draft.name}
              onChange={(e) => set("name", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="photo-category" className={labelCls}>Category</label>
            <select
              id="photo-category"
              value={draft.category}
              onChange={(e) => set("category", e.target.value as PhotoCategory)}
              className={`${inputCls} cursor-pointer appearance-none`}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-liol-bg">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date taken (editable) + Uploaded (locked) — stacks
              to one column below 400px so neither field crushes */}
          <div className="grid grid-cols-2 max-xs:grid-cols-1 gap-3">
            <div>
              <label htmlFor="photo-date-taken" className={labelCls}>Date taken</label>
              <input
                id="photo-date-taken"
                type="date"
                value={draft.date_taken}
                onChange={(e) => set("date_taken", e.target.value)}
                className={`${inputCls} [color-scheme:dark]`}
              />
            </div>
            <div>
              <span className={labelCls}>
                Uploaded
                <svg aria-hidden="true" className="inline w-2.5 h-2.5 ml-1 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V7a4 4 0 018 0v4" />
                </svg>
              </span>
              {/* Immutable — dashed, muted, not a form control */}
              <p
                title="Upload date can't be changed"
                className="mt-1.5 w-full rounded-lg border border-dashed border-liol-text/15 px-3.5 py-2 text-sm text-liol-subtext select-none"
              >
                {formatPhotoDate(photo.created_at)}
              </p>
            </div>
          </div>

          {/* Caption */}
          <div>
            <label htmlFor="photo-caption" className={labelCls}>Caption</label>
            <textarea
              id="photo-caption"
              rows={3}
              value={draft.caption}
              onChange={(e) => set("caption", e.target.value)}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Alt text */}
          <div>
            <label htmlFor="photo-alt" className={labelCls}>Alt text</label>
            <textarea
              id="photo-alt"
              rows={2}
              value={draft.alt_text}
              onChange={(e) => set("alt_text", e.target.value)}
              className={`${inputCls} resize-none`}
            />
            <p className="mt-1 text-[0.65rem] text-liol-subtext">
              Describes the photo for screen readers & SEO.
            </p>
          </div>

          {/* ── Actions ──────────────────────────────────────── */}
          <div className="mt-auto pt-2 flex gap-2.5">
            <button
              onClick={handleSave}
              disabled={!isDirty}
              className={`flex-1 rounded-lg text-sm font-medium py-2.5 duration-200 ${
                isDirty
                  ? "bg-liol-text text-liol-bg hover:bg-liol-text/85 cursor-pointer"
                  : "bg-liol-text/10 text-liol-subtext cursor-not-allowed"
              }`}
            >
              {isDirty ? "Save changes" : "Saved"}
            </button>

            {/* Two-stage delete — morphs in place, no second modal */}
            <button
              onClick={handleDelete}
              aria-label={confirmingDelete ? "Confirm delete" : "Delete photo"}
              className={`rounded-lg text-sm py-2.5 duration-200 cursor-pointer border ${
                confirmingDelete
                  ? "px-4 bg-red-500/15 border-red-400/50 text-red-300"
                  : "px-3.5 bg-transparent border-liol-text/15 text-liol-subtext hover:text-red-300 hover:border-red-400/40"
              }`}
            >
              {confirmingDelete ? (
                "Confirm delete?"
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                  <path d="M10 11v6M14 11v6" />
                  <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                </svg>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
