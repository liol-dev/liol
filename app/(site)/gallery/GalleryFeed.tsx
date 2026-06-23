"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  formatPhotoDate,
  type PhotoRecord,
  type CategoryRecord,
} from "@/app/lib/photos";

// ============================================================
// GALLERY FEED — "The Work"
// Categories are passed in from the server component (fetched
// from Supabase at render time) so filter pills, section headers,
// and the scroll spy all reflect live DB state — no hardcoded list.
//
// Desktop (md+): sectioned feed left + sticky category nav right.
//   Nav labels truncate at ~25 chars to prevent layout breakage.
// Mobile (<md):  outlined button opens a bottom-sheet modal picker.
//   Button reads "Browse N categories" on All, or the active
//   category name when one is selected.
// ============================================================

function PhotoTile({
  photo,
  onSelect,
  priority = false,
}: {
  photo: PhotoRecord;
  onSelect: (photo: PhotoRecord) => void;
  priority?: boolean;
}) {
  return (
    <button
      onClick={() => onSelect(photo)}
      aria-label={`View ${photo.name}`}
      className="group relative aspect-square md:aspect-4/5 overflow-hidden"
    >
      <Image
        src={photo.src}
        alt={photo.alt_text}
        fill
        sizes="(max-width: 768px) 33vw, 28vw"
        priority={priority}
        className="object-cover"
      />
      <div className="absolute inset-0 bg-liol-bg/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 duration-300 flex flex-col items-center justify-center text-center px-3">
        <p className="text-sm md:text-xl font-light tracking-[10%] text-liol-text">
          {photo.name}
        </p>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-liol-subtext">
          {formatPhotoDate(photo.date_taken)}
        </p>
        <svg
          className="absolute bottom-2 right-2 md:bottom-3 md:right-3 w-4 h-4 md:w-5 md:h-5 text-liol-text"
          viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <line x1="17" y1="17" x2="7" y2="7" />
          <polyline points="7 14 7 7 14 7" />
        </svg>
      </div>
    </button>
  );
}

interface GalleryFeedProps {
  photos: PhotoRecord[];
  categories: CategoryRecord[];
}

export default function GalleryFeed({ photos, categories }: GalleryFeedProps) {
  const [selected, setSelected] = useState<PhotoRecord | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [catModalOpen, setCatModalOpen] = useState(false);

  // Desktop scroll-spy — defaults to first category slug
  const [activeSection, setActiveSection] = useState<string>(
    categories[0]?.slug ?? ""
  );

  // ── Desktop scroll spy ───────────────────────────────────
  useEffect(() => {
    if (categories.length === 0) return;
    const sections = categories
      .map((c) => document.getElementById(`gallery-${c.slug}`))
      .filter((el): el is HTMLElement => el !== null);

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id.replace("gallery-", ""));
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [categories]);

  // ── Lightbox + category modal: Escape + scroll lock ──────
  useEffect(() => {
    const isOpen = !!selected || catModalOpen;
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelected(null);
        setCatModalOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, catModalOpen]);

  const scrollToCategory = (slug: string) => {
    document.getElementById(`gallery-${slug}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const navItemStyle = (isActive: boolean) =>
    `font-light tracking-[10%] duration-300 cursor-pointer text-left w-full max-w-[160px] truncate ${
      isActive ? "text-liol-text" : "text-liol-subtext hover:text-liol-text"
    }`;

  const filteredPhotos = filter === "all" ? photos : photos.filter((p) => p.category === filter);

  // Button label: active category name when filtered, count when on All
  const buttonLabel =
    filter === "all"
      ? `Browse ${categories.length} categor${categories.length === 1 ? "y" : "ies"}`
      : (categories.find((c) => c.slug === filter)?.label ?? filter);

  return (
    <>
      {/* ════════════════════════════════════════════════════
          MOBILE — category modal + filtered grid
         ════════════════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Outlined category button */}
        <div className="flex justify-center pb-8 px-8">
          <button
            onClick={() => setCatModalOpen(true)}
            className="flex items-center gap-2 text-sm font-light tracking-[0.05em] text-liol-subtext hover:text-liol-text border border-liol-text/20 hover:border-liol-text/50 rounded-full px-4 py-1.5 duration-300 cursor-pointer"
          >
            <span>{buttonLabel}</span>
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>

        {/* Photo grid */}
        <div key={filter} className="grid grid-cols-3 gap-0">
          {filteredPhotos.map((photo, i) => (
            <PhotoTile key={photo.id} photo={photo} onSelect={setSelected} priority={i < 6} />
          ))}
        </div>

        {/* Bottom-sheet category picker */}
        {catModalOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter by category"
            onClick={() => setCatModalOpen(false)}
            className="fixed inset-0 z-50 bg-liol-bg/80 flex items-end justify-center"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-liol-bg border border-liol-text/15 rounded-t-2xl px-6 pt-5 pb-10"
            >
              <div className="mx-auto w-10 h-1 rounded-full bg-liol-text/20 mb-6" />
              <p className="text-xs text-liol-subtext mb-4 tracking-[0.06em] uppercase">Filter by category</p>
              <ul className="flex flex-col">
                <li>
                  <button
                    onClick={() => { setFilter("all"); setCatModalOpen(false); }}
                    className={`w-full text-left py-3.5 border-b border-liol-text/8 text-base font-light tracking-[0.05em] duration-200 cursor-pointer ${
                      filter === "all" ? "text-liol-text" : "text-liol-subtext"
                    }`}
                  >
                    All
                    {filter === "all" && (
                      <svg className="inline w-3.5 h-3.5 ml-2 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => { setFilter(cat.slug); setCatModalOpen(false); }}
                      className={`w-full text-left py-3.5 border-b border-liol-text/8 last:border-0 text-base font-light tracking-[0.05em] duration-200 cursor-pointer ${
                        filter === cat.slug ? "text-liol-text" : "text-liol-subtext"
                      }`}
                    >
                      {cat.label}
                      {filter === cat.slug && (
                        <svg className="inline w-3.5 h-3.5 ml-2 -mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP — sectioned feed (85%) + sticky nav (15%)
         ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex px-12 gap-12">

        <div className="w-[85%] flex flex-col gap-24">
          {categories.map((cat, catIndex) => (
            <section
              key={cat.slug}
              id={`gallery-${cat.slug}`}
              className="scroll-mt-24"
            >
              <h2 className="mb-6 text-2xl font-light tracking-[10%] truncate max-w-[560px]">
                &mdash; {cat.label}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {photos.filter((p) => p.category === cat.slug).map((photo, i) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    onSelect={setSelected}
                    priority={catIndex === 0 && i < 3}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="w-[15%]">
          <div className="sticky top-24 flex flex-col items-start gap-4">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => scrollToCategory(cat.slug)}
                title={cat.label}
                className={`text-lg ${navItemStyle(activeSection === cat.slug)}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX — shared by both viewports
         ════════════════════════════════════════════════════ */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-liol-bg/95 flex items-center justify-center px-4 md:px-12"
        >
          <button
            onClick={() => setSelected(null)}
            aria-label="Close"
            className="absolute top-4 right-8 md:right-12 text-liol-text hover:text-liol-subtext duration-300"
          >
            <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="4" y1="4" x2="20" y2="20" />
              <line x1="20" y1="4" x2="4" y2="20" />
            </svg>
          </button>

          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-5xl w-full"
          >
            <div className="relative w-full h-[80vh]">
              <Image
                src={selected.src}
                alt={selected.alt_text}
                fill
                sizes="(max-width: 768px) 100vw, 80vw"
                className="object-contain"
              />
            </div>
            <figcaption className="mt-5 text-center">
              <p className="text-lg md:text-xl font-light tracking-[10%]">
                {selected.name}
              </p>
              <p className="mt-1 text-sm text-liol-subtext">
                {formatPhotoDate(selected.date_taken)}
              </p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
