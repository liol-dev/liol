"use client";

import { useMemo, useState } from "react";
import {
  CATEGORIES,
  formatPhotoDate,
  type PhotoRecord,
  type PhotoCategory,
} from "@/app/lib/photos";

// ============================================================
// PHOTO LIBRARY — searchable, filterable grid of ALL photos
// The client-facing "find anything fast" surface:
//   • Search box — matches photo name (and caption) as you type
//   • Category pills — All | Couples | Engagements | Portraits
//   • Live result count so Corey & Ed always know what they're
//     looking at
//   • Uniform square grid; hover reveals name + category + date
//
// Reusable: rendered on the Overview (below Recent uploads)
// AND as the body of /admin/library. Pass the full dataset in;
// all filtering happens client-side (fine at portfolio scale —
// hundreds of photos, not millions).
//
// NEXT SESSION: tiles open the fullscreen detail modal with
// metadata editing + delete. The onSelect seam is already here.
// ============================================================

type FilterValue = "all" | PhotoCategory;

interface PhotoLibraryProps {
  photos: PhotoRecord[];
  /** Hook for the upcoming detail modal — optional until then */
  onSelect?: (photo: PhotoRecord) => void;
}

export default function PhotoLibrary({ photos, onSelect }: PhotoLibraryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  // ── Filtering ─────────────────────────────────────────────
  // Category narrows first, then the text query matches against
  // name OR caption (case-insensitive) so a half-remembered word
  // from either still finds the photo.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return photos.filter((p) => {
      if (filter !== "all" && p.category !== filter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.caption.toLowerCase().includes(q)
      );
    });
  }, [photos, query, filter]);

  const filterItems: { id: FilterValue; label: string }[] = [
    { id: "all", label: "All" },
    ...CATEGORIES,
  ];

  return (
    <div>

      {/* ── Controls row: search + category pills ──────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Search box with leading magnifier icon */}
        <div className="relative sm:max-w-xs w-full">
          <svg
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-liol-subtext"
            viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.5" y2="16.5" />
          </svg>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search photos…"
            aria-label="Search photos by name"
            className="w-full rounded-lg bg-liol-text/5 border border-liol-text/15 pl-10 pr-4 py-2 text-sm text-liol-text placeholder:text-liol-subtext outline-none focus:border-liol-text/40 duration-200"
          />
        </div>

        {/* Category pills — max-xs tightens gaps/padding so all
            four fit one row on narrow phones (≤400px) */}
        <div className="flex flex-wrap items-center gap-2 max-xs:gap-1.5" role="group" aria-label="Filter by category">
          {filterItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`rounded-full px-3.5 max-xs:px-2.5 py-1.5 text-xs duration-200 cursor-pointer border ${
                filter === item.id
                  ? "bg-liol-text text-liol-bg border-liol-text"
                  : "text-liol-subtext border-liol-text/15 hover:text-liol-text hover:border-liol-text/40"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Live result count — pushed right on desktop */}
        <p className="sm:ml-auto text-xs text-liol-subtext" aria-live="polite">
          {filtered.length} of {photos.length} photos
        </p>
      </div>

      {/* ── Photo grid ─────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-2.5 max-xs:gap-2">
          {filtered.map((photo) => (
            <button
              key={photo.id}
              onClick={() => onSelect?.(photo)}
              aria-label={`Open ${photo.name}`}
              className="group relative aspect-square overflow-hidden rounded-lg text-left cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt_text}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover duration-300 group-hover:scale-[1.03]"
              />

              {/* Hover/focus overlay — name, category, date */}
              <div className="absolute inset-0 bg-liol-bg/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 duration-300 flex flex-col justify-end p-3">
                <p className="text-sm text-liol-text truncate">
                  {photo.name}
                </p>
                <p className="mt-0.5 text-[0.7rem] text-liol-subtext capitalize">
                  {photo.category} · {formatPhotoDate(photo.date_taken)}
                </p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        /* Empty state — dead ends should always offer a way out */
        <div className="mt-5 rounded-xl bg-liol-text/5 px-6 py-12 text-center">
          <p className="text-sm text-liol-subtext">
            No photos match{query ? ` "${query}"` : ""} in this category.
          </p>
          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
            }}
            className="mt-3 text-sm text-liol-text underline underline-offset-4 hover:text-liol-subtext duration-200 cursor-pointer"
          >
            Clear search & filters
          </button>
        </div>
      )}

    </div>
  );
}
