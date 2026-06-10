"use client";

// ============================================================
// PORTFOLIO GRID COMPONENT
// Masonry-style photo grid with cascading crossfade rotation.
//
// LAYOUT — perfect rectangle guarantee:
//   Column counts are LOCKED per breakpoint (1 / 2 / 4) instead
//   of auto-fit, and the slot pattern below totals exactly 24
//   cells. 24 divides evenly at every breakpoint:
//     - lg : 4 cols × 6 rows
//     - md : 2 cols × 12 rows
//     - base: 1 col × 17 rows (spans disabled below md)
//   So the grid always resolves to a clean rectangle with no
//   hanging cells or dead space at the bottom.
//   ⚠ If you add/remove slots, keep total cells divisible by 4
//     (std=1, wide=2, tall=2, big=4).
//
// ROTATION — cascading crossfade waves:
//   Rotation happens in WAVES. Each wave preloads a full batch
//   of replacement photos, then sweeps through the tiles in
//   order — each tile starts its fade just CASCADE_STAGGER_MS
//   after the previous one, WITHOUT waiting for it to finish.
//   Fades overlap freely, creating a fluid ripple across the
//   grid. After the wave lands, the full mosaic rests for
//   SHOW_DURATION_MS before the next wave begins.
//
// DATA — placeholder Unsplash pool for now. In production,
//   feed POOL from ImageKit/Supabase; layout logic stays put.
// ============================================================

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ── Tuning knobs ────────────────────────────────────────────
const SHOW_DURATION_MS = 8000;  // rest time between waves (full mosaic on display)
const CASCADE_STAGGER_MS = 350; // delay between each tile STARTING its fade
const FADE_DURATION_MS = 1500;  // crossfade length — fades overlap freely

// ── Image pool ──────────────────────────────────────────────
// Larger than the number of visible slots (17), so the rotation
// always has fresh photos to pull from. Pool pointer advances
// round-robin; since pool > slots, an image is always off-screen
// before it comes back around (no duplicates visible at once).
const POOL: string[] = [
  "https://images.unsplash.com/photo-1541845157-a6d2d100c931?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1588282322673-c31965a75c3e?auto=format&fit=crop&w=1351&q=80",
  "https://images.unsplash.com/photo-1588117472013-59bb13edafec?auto=format&fit=crop&w=800&q=70",
  "https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1558980663-3685c1d673c4?auto=format&fit=crop&w=1000&q=70",
  "https://images.unsplash.com/photo-1588499756884-d72584d84df5?auto=format&fit=crop&w=1400&q=80",
  "https://images.unsplash.com/photo-1588492885706-b8917f06df77?auto=format&fit=crop&w=1951&q=80",
  "https://images.unsplash.com/photo-1588247866001-68fa8c438dd7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1572914857229-37bf6ee8101c?auto=format&fit=crop&w=1951&q=80",
  "https://images.unsplash.com/photo-1588453862014-cd1a9ad06a12?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1588414734732-660b07304ddb?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1588224575346-501f5880ef29?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1574798834926-b39501d8eda2?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1353&q=80",
  "https://images.unsplash.com/photo-1588263823647-ce3546d42bfe?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1587732608058-5ccfedd3ea63?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1587897773780-fe72528d5081?auto=format&fit=crop&w=1489&q=80",
  "https://images.unsplash.com/photo-1588083949404-c4f1ed1323b3?auto=format&fit=crop&w=1489&q=80",
  "https://images.unsplash.com/photo-1587572236558-a3751c6d42c0?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1583542225715-473a32c9b0ef?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1527928159272-7d012024eb74?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1553984840-b8cbc34f5215?auto=format&fit=crop&w=1350&q=80",
  "https://images.unsplash.com/photo-1433446787703-42d5bf446876?auto=format&fit=crop&w=1351&q=80",
  "https://images.unsplash.com/photo-1541187714594-731deadcd16a?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1421930866250-aa0594cea05c?auto=format&fit=crop&w=1355&q=80",
  "https://images.unsplash.com/photo-1493306454986-c8877a09cbeb?auto=format&fit=crop&w=1381&q=80",
  "https://images.unsplash.com/photo-1536466528142-f752ae7bdd0c?auto=format&fit=crop&w=1350&q=80",
];

// ── Slot pattern ────────────────────────────────────────────
// 17 slots = 24 cells. Order matters: this exact sequence tiles
// perfectly at both 4-col and 2-col with grid-flow-dense.
//   std = 1 cell · wide = 2 · tall = 2 · big = 4
type PhotoSize = "wide" | "tall" | "big";

const SLOTS: { size?: PhotoSize }[] = [
  { size: "wide" }, // 1
  {},               // 2
  { size: "tall" }, // 3
  {},               // 4
  {},               // 5
  {},               // 6
  { size: "big" },  // 7
  { size: "tall" }, // 8
  {},               // 9
  {},               // 10
  {},               // 11
  {},               // 12
  { size: "wide" }, // 13
  {},               // 14
  {},               // 15
  {},               // 16
  {},               // 17
];

// Full static class strings so Tailwind's JIT generates them.
// Spans only apply at md+ (mobile is a single column).
const sizeClasses: Record<PhotoSize, string> = {
  wide: "md:col-span-2",
  tall: "md:row-span-2",
  big: "md:col-span-2 md:row-span-2",
};

// ============================================================
// CROSSFADE IMAGE
// Renders the current photo; when `src` changes, keeps the old
// layer underneath and fades the new one in over it, then drops
// the old layer once the animation finishes.
// ============================================================
function CrossfadeImage({ src }: { src: string }) {
  const [current, setCurrent] = useState(src);
  const [previous, setPrevious] = useState<string | null>(null);

  useEffect(() => {
    if (src === current) return;
    setPrevious(current);
    setCurrent(src);
    const t = setTimeout(() => setPrevious(null), FADE_DURATION_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div className="relative h-full w-full overflow-hidden transition-transform duration-500 group-hover:scale-[1.03]">
      {/* Old layer — sits underneath during the fade */}
      {previous && (
        <img
          src={previous}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* Current layer — fades in over the old one.
          `key` forces a fresh element so the animation re-runs. */}
      <img
        key={current}
        src={current}
        alt="Life in Our Lens portfolio photograph"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={
          previous
            ? { animation: `liol-fade-in ${FADE_DURATION_MS}ms ease both` }
            : undefined
        }
      />
    </div>
  );
}

// ============================================================
// PORTFOLIO GRID
// ============================================================
export default function PortfolioGrid() {
  // Which pool image each slot is currently showing
  const [images, setImages] = useState<string[]>(() =>
    SLOTS.map((_, i) => POOL[i % POOL.length])
  );

  const nextPoolRef = useRef(SLOTS.length); // next pool image to use

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    // Resolve once an image is cached (or errors — never stall a wave)
    const preload = (src: string) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = src;
      });

    const runWave = async () => {
      if (cancelled) return;

      // Pick the next full batch from the pool (round-robin).
      // Batch order matches slot order — combined with the
      // ascending sweep, this guarantees a recycled image has
      // already left its old slot before reappearing in a new one.
      const start = nextPoolRef.current;
      const batch = SLOTS.map((_, i) => POOL[(start + i) % POOL.length]);
      nextPoolRef.current = (start + SLOTS.length) % POOL.length;

      // Preload the ENTIRE wave before the first fade starts,
      // so the stagger rhythm is driven purely by timers —
      // never disrupted by network timing. No pop-in.
      await Promise.all(batch.map(preload));
      if (cancelled) return;

      // The ripple: each tile starts CASCADE_STAGGER_MS after
      // the previous one — no waiting for fades to finish.
      batch.forEach((src, slot) => {
        timers.push(
          window.setTimeout(() => {
            setImages((prev) =>
              prev.map((s, i) => (i === slot ? src : s))
            );
          }, slot * CASCADE_STAGGER_MS)
        );
      });

      // Schedule the next wave: after this one fully lands
      // (last stagger + its fade), rest for SHOW_DURATION_MS.
      const waveLength =
        (SLOTS.length - 1) * CASCADE_STAGGER_MS + FADE_DURATION_MS;
      timers.push(
        window.setTimeout(runWave, waveLength + SHOW_DURATION_MS)
      );
    };

    // Let the initial mosaic breathe before the first wave
    timers.push(window.setTimeout(runWave, SHOW_DURATION_MS));

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    // ── Section wrapper ─────────────────────────────────────
    // Mobile: full-bleed. Desktop: padded frame per design.
    <section className="bg-liol-bg md:px-24 md:pb-24">

      {/* ── Masonry grid ──────────────────────────────────────
          1px gap (near-flush, per design). Fixed column counts
          per breakpoint keep the 24-cell pattern a perfect
          rectangle — see header comment for the math.
      ──────────────────────────────────────────────────────── */}
      <div
        className="
          grid grid-flow-dense gap-px
          grid-cols-1 auto-rows-[320px]
          md:grid-cols-2 md:auto-rows-[240px]
          lg:grid-cols-4 lg:auto-rows-[220px]
          3xl:auto-rows-[250px]
        "
      >
        {SLOTS.map((slot, i) => (
          <Link
            key={i}
            href="/gallery"
            aria-label="View the full gallery"
            className={`group block overflow-hidden ${slot.size ? sizeClasses[slot.size] : ""}`}
          >
            <CrossfadeImage src={images[i]} />
          </Link>
        ))}
      </div>
    </section>
  );
}
