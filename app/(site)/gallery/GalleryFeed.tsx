"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CATEGORIES,
  formatPhotoDate,
  type PhotoRecord,
} from "@/app/lib/photos";

// ============================================================
// GALLERY FEED COMPONENT
// The interactive body of the gallery page. Desktop and mobile
// have DIFFERENT navigation models, so they render as separate
// trees sharing the same PhotoTile + lightbox:
//
//   Desktop (md+): 80/20 split — sectioned feed left ("— Label"
//     + 3-col grid per category), sticky category nav right.
//     Labels smooth-SCROLL to sections; a scroll-spy highlights
//     the section currently in view. No "All" — nothing is
//     filtered, every section is always on the page.
//
//   Mobile (<md): Instagram-style single feed. The tag bar
//     ("All | Couples | ...") FILTERS the one big grid — no
//     sections, no scrolling behavior. "All" exists here as
//     the show-everything filter state.
//
// PHOTO INTERACTIONS (both viewports):
//   Hover/focus: dark overlay fades in with name + date +
//     corner arrow (per design).
//   Click: fullscreen lightbox (established overlay pattern:
//     fixed inset-0 z-50 bg-liol-bg/*). Closes via X, backdrop
//     click, or Escape. Body scroll locks while open.
// ============================================================

// ── Shared photo tile ───────────────────────────────────────
// Square on mobile (IG-style), 4:5 portrait cells on desktop.
// `priority` preloads the handful of above-the-fold tiles so the
// gallery's LCP lands fast; everything else lazy-loads on scroll.
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

      {/* Hover overlay — dark wash + metadata. Also shows on
          keyboard focus for accessibility. */}
      <div className="absolute inset-0 bg-liol-bg/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 duration-300 flex flex-col items-center justify-center text-center px-3">
        <p className="text-sm md:text-xl font-light tracking-[10%] text-liol-text">
          {photo.name}
        </p>
        <p className="mt-1 md:mt-2 text-xs md:text-sm text-liol-subtext">
          {formatPhotoDate(photo.date_taken)}
        </p>

        {/* Corner arrow (↖) — hints the tile opens the lightbox */}
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

export default function GalleryFeed({ photos }: { photos: PhotoRecord[] }) {
  // Lightbox state — null means closed (shared by both trees)
  const [selected, setSelected] = useState<PhotoRecord | null>(null);

  // MOBILE: active filter — "all" or a category id
  const [filter, setFilter] = useState<string>("all");

  // DESKTOP: scroll-spy highlight — defaults to first section
  const [activeSection, setActiveSection] = useState<string>(
    CATEGORIES[0].id
  );

  // ── Desktop scroll spy ───────────────────────────────────
  // Highlights whichever section crosses the upper-third
  // "reading band" of the viewport. Sections are hidden on
  // mobile, so they never intersect there — observer is inert.
  useEffect(() => {
    const sections = CATEGORIES
      .map((c) => document.getElementById(`gallery-${c.id}`))
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
  }, []);

  // ── Lightbox: Escape-to-close + body scroll lock ─────────
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected]);

  // ── Desktop: scroll to a category section ────────────────
  const scrollToCategory = (id: string) => {
    document
      .getElementById(`gallery-${id}`)
      ?.scrollIntoView({ behavior: "smooth" });
  };

  // Shared label styling — active is white, rest subtext
  const navItemStyle = (isActive: boolean) =>
    `font-light tracking-[10%] duration-300 cursor-pointer ${isActive ? "text-liol-text" : "text-liol-subtext hover:text-liol-text"
    }`;

  // Mobile filter options: "All" + categories
  const filterItems = [{ id: "all", label: "All" }, ...CATEGORIES];

  // Mobile feed contents under the current filter
  const filteredPhotos =
    filter === "all"
      ? photos
      : photos.filter((p) => p.category === filter);

  return (
    <>
      {/* ════════════════════════════════════════════════════
          MOBILE — filterable single feed
         ════════════════════════════════════════════════════ */}
      <div className="md:hidden">

        {/* Filter tag bar — buttons swap the filter state.
            max-xs: tighter padding + gaps reclaim ~64px on narrow
            phones (Pixel 3 @ 393px) so the full row fits one line
            instead of orphaning "| Portraits". */}
        <div className="flex flex-wrap justify-center items-center gap-3 max-xs:gap-2 px-8 max-xs:px-3 pb-8">
          {filterItems.map((item, i) => (
            <span key={item.id} className="flex items-center gap-3 max-xs:gap-2">
              {i > 0 && <span className="text-liol-subtext font-light">|</span>}
              <button
                onClick={() => setFilter(item.id)}
                aria-pressed={filter === item.id}
                className={`text-[0.9rem] ${navItemStyle(filter === item.id)}`}
              >
                {item.label}
              </button>
            </span>
          ))}
        </div>

        {/* One big Instagram-style grid of the filtered set —
            full-bleed on mobile (kisses screen edges, like the
            homepage masonry) for maximum photo space.
            key={filter} remounts the grid per filter so images
            don't visually "morph" between unrelated photos. */}
        <div key={filter} className="grid grid-cols-3 gap-0">
          {filteredPhotos.map((photo, i) => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              onSelect={setSelected}
              priority={i < 6}
            />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════
          DESKTOP — sectioned feed (85%) + sticky nav (15%)
         ════════════════════════════════════════════════════ */}
      <div className="hidden md:flex px-12 gap-12">

        {/* Sectioned photo feed — every category always present */}
        <div className="w-[85%] flex flex-col gap-24">
          {CATEGORIES.map((cat, catIndex) => (
            <section
              key={cat.id}
              id={`gallery-${cat.id}`}
              // scroll-mt offsets the sticky navbar so scrolled-to
              // section headers don't hide under it
              className="scroll-mt-24"
            >
              {/* Section label — "— Couples" style per design */}
              <h2 className="mb-6 text-2xl font-light tracking-[10%]">
                &mdash; {cat.label}
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {photos.filter((p) => p.category === cat.id).map((photo, i) => (
                  <PhotoTile
                    key={photo.id}
                    photo={photo}
                    onSelect={setSelected}
                    // Only the first row of the first section is
                    // above the fold on desktop — preload just those.
                    priority={catIndex === 0 && i < 3}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Sticky category nav — scroll handlers, no "All" since
            nothing filters here; scroll-spy drives the highlight */}
        <aside className="w-[15%]">
          <div className="sticky top-24 flex flex-col items-start gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className={`text-lg ${navItemStyle(activeSection === cat.id)}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </aside>

      </div>

      {/* ════════════════════════════════════════════════════
          LIGHTBOX — shared by both viewports
          Established fullscreen overlay pattern. Backdrop click
          closes; the figure stops propagation so clicking the
          photo itself doesn't.
         ════════════════════════════════════════════════════ */}
      {selected && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selected.name}
          onClick={() => setSelected(null)}
          className="fixed inset-0 z-50 bg-liol-bg/95 flex items-center justify-center px-4 md:px-12"
        >
          {/* Close button */}
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

          {/* Enlarged photo + metadata */}
          <figure
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center max-w-5xl w-full"
          >
            {/* fill needs a sized box: full figure width × 80vh.
                object-contain keeps the photo's true ratio inside it. */}
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
