"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  formatPhotoDate,
  type PhotoRecord,
  type PhotoCategory,
  type CategoryRecord,
} from "@/app/lib/photos";

// ============================================================
// PHOTO LIBRARY — searchable, filterable grid of ALL photos
// Categories are passed in from LibraryManager (fetched once
// there, shared here + PhotoDetailModal) so filter pills always
// reflect whatever's in the DB — no hardcoded list.
// ============================================================

type FilterValue = "all" | PhotoCategory;

interface PhotoLibraryProps {
  photos: PhotoRecord[];
  categories: CategoryRecord[];
  onSelect?: (photo: PhotoRecord) => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

export default function PhotoLibrary({
  photos,
  categories,
  onSelect,
  onBulkDelete,
}: PhotoLibraryProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  // ── Selection state (bulk mode) ───────────────────────────
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmingBulk, setConfirmingBulk] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Build filter pill list from live categories (All + each slug)
  const filterItems: { id: FilterValue; label: string }[] = [
    { id: "all", label: "All" },
    ...categories.map((c) => ({ id: c.slug as FilterValue, label: c.label })),
  ];

  // Slug → label lookup for hover overlay
  const categoryLabel = (slug: string) =>
    categories.find((c) => c.slug === slug)?.label ?? slug;

  // ── Filtering ─────────────────────────────────────────────
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

  // Reset filter to "all" if the active filter slug no longer exists
  // (e.g. a category was deleted/renamed externally)
  useEffect(() => {
    if (filter === "all") return;
    const stillExists = categories.some((c) => c.slug === filter);
    if (!stillExists) setFilter("all");
  }, [categories, filter]);

  // Prune selected ids when photos list changes after a delete
  useEffect(() => {
    setSelected((prev) => {
      const next = new Set<string>();
      for (const p of photos) if (prev.has(p.id)) next.add(p.id);
      return next.size === prev.size ? prev : next;
    });
  }, [photos]);

  useEffect(() => {
    if (!confirmingBulk) return;
    const t = setTimeout(() => setConfirmingBulk(false), 3000);
    return () => clearTimeout(t);
  }, [confirmingBulk]);

  // ── Selection helpers ─────────────────────────────────────
  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
    setConfirmingBulk(false);
  };

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));

  const toggleSelectAllFiltered = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (allFilteredSelected) filtered.forEach((p) => next.delete(p.id));
      else filtered.forEach((p) => next.add(p.id));
      return next;
    });

  const handleTileClick = (photo: PhotoRecord) => {
    if (selectMode) toggleOne(photo.id);
    else onSelect?.(photo);
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0 || !onBulkDelete) return;
    if (!confirmingBulk) { setConfirmingBulk(true); return; }
    setIsBulkDeleting(true);
    try {
      await onBulkDelete(Array.from(selected));
      setConfirmingBulk(false);
      setSelectMode(false);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // ── True empty state ──────────────────────────────────────
  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-liol-text/15 px-6 py-16 text-center">
        <svg aria-hidden="true" className="mx-auto w-10 h-10 text-liol-subtext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
        <p className="mt-4 text-sm text-liol-text">No photos yet.</p>
        <p className="mt-1 text-xs text-liol-subtext">Upload your first photo to start building the gallery.</p>
        <Link href="/admin/upload" className="mt-5 inline-block rounded-lg bg-liol-text text-liol-bg text-sm font-medium px-5 py-2.5 hover:bg-liol-text/85 duration-200">
          Upload photos
        </Link>
      </div>
    );
  }

  const inSelection = selectMode && Boolean(onBulkDelete);

  return (
    <div>

      {/* ── Controls: search + filter pills + select toggle ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">

        <div className="relative sm:max-w-xs w-full">
          <svg aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-liol-subtext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
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

        {/* Dynamic category filter pills */}
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

        <div className="sm:ml-auto flex items-center gap-3">
          <p className="text-xs text-liol-subtext" aria-live="polite">
            {filtered.length} of {photos.length} photos
          </p>
          {onBulkDelete && (
            <button
              onClick={() => (inSelection ? exitSelectMode() : setSelectMode(true))}
              className={`rounded-lg px-3 py-1.5 text-xs border duration-200 cursor-pointer ${
                inSelection
                  ? "border-liol-text/40 text-liol-text"
                  : "border-liol-text/15 text-liol-subtext hover:text-liol-text hover:border-liol-text/40"
              }`}
            >
              {inSelection ? "Cancel" : "Select"}
            </button>
          )}
        </div>
      </div>

      {/* ── Bulk action bar ───────────────────────────────── */}
      {inSelection && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-liol-text/15 bg-liol-text/5 px-4 py-3">
          <span className="text-sm text-liol-text">{selected.size} selected</span>
          <button onClick={toggleSelectAllFiltered} className="text-xs text-liol-subtext hover:text-liol-text underline underline-offset-4 duration-200 cursor-pointer">
            {allFilteredSelected ? "Clear all" : "Select all shown"}
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={selected.size === 0 || isBulkDeleting}
            className={`ml-auto rounded-lg text-sm py-2 px-4 border duration-200 ${
              selected.size === 0
                ? "border-liol-text/15 text-liol-subtext cursor-not-allowed"
                : isBulkDeleting
                ? "bg-red-500/15 border-red-400/50 text-red-300 cursor-wait"
                : confirmingBulk
                ? "bg-red-500/15 border-red-400/50 text-red-300 cursor-pointer"
                : "bg-transparent border-red-400/40 text-red-300 hover:bg-red-500/10 cursor-pointer"
            }`}
          >
            {isBulkDeleting
              ? "Deleting…"
              : confirmingBulk
              ? `Confirm delete ${selected.size}?`
              : `Delete selected${selected.size ? ` (${selected.size})` : ""}`}
          </button>
        </div>
      )}

      {/* ── Photo grid ──────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 3xl:grid-cols-5 gap-2.5 max-xs:gap-2">
          {filtered.map((photo, index) => {
            const isSel = selected.has(photo.id);
            return (
              <button
                key={photo.id}
                onClick={() => handleTileClick(photo)}
                aria-label={inSelection ? `${isSel ? "Deselect" : "Select"} ${photo.name}` : `Open ${photo.name}`}
                aria-pressed={inSelection ? isSel : undefined}
                className={`group relative aspect-square overflow-hidden rounded-lg text-left cursor-pointer ${isSel ? "ring-2 ring-liol-text" : ""}`}
              >
                <Image
                  src={photo.src}
                  alt={photo.alt_text}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 20vw"
                  priority={index < 5}
                  className="object-cover duration-300 group-hover:scale-[1.03]"
                />

                {inSelection && (
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 left-2 z-10 w-5 h-5 rounded-full border flex items-center justify-center duration-200 ${
                      isSel ? "bg-liol-text border-liol-text text-liol-bg" : "bg-liol-bg/60 border-liol-text/50 text-transparent"
                    }`}
                  >
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}

                {/* Hover overlay — uses live category label, not raw slug */}
                <div className="absolute inset-0 bg-liol-bg/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 duration-300 flex flex-col justify-end p-3">
                  <p className="text-sm text-liol-text truncate">{photo.name}</p>
                  <p className="mt-0.5 text-[0.7rem] text-liol-subtext capitalize">
                    {categoryLabel(photo.category)} · {formatPhotoDate(photo.date_taken)}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-liol-text/5 px-6 py-12 text-center">
          <p className="text-sm text-liol-subtext">
            No photos match{query ? ` "${query}"` : ""} in this category.
          </p>
          <button
            onClick={() => { setQuery(""); setFilter("all"); }}
            className="mt-3 text-sm text-liol-text underline underline-offset-4 hover:text-liol-subtext duration-200 cursor-pointer"
          >
            Clear search & filters
          </button>
        </div>
      )}

    </div>
  );
}
