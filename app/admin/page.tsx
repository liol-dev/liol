import DonutChart from "./components/DonutChart";
import Link from "next/link";
import {
  PHOTOS,
  CATEGORIES,
  countByCategory,
  newestFirst,
  formatPhotoDate,
} from "@/app/lib/photos";

// ============================================================
// ADMIN OVERVIEW — /admin
// The dashboard landing screen: portfolio at a glance.
//   1. Stat cards — total photos, category count, last upload
//   2. Category distribution — hand-rolled SVG donut + legend
//   3. Recent uploads — strip of the latest six thumbnails
// All numbers derive from the mock data layer; when Supabase
// lands this page just swaps its imports for real queries.
// ============================================================

// Monochrome segment palette — brand-consistent grayscale ramp.
// Order matches CATEGORIES (couples, engagements, portraits).
const SEGMENT_COLORS = ["#FFFFFF", "#898989", "#4A4A4A"];

export default function AdminOverviewPage() {
  const counts = countByCategory(PHOTOS);
  const total = PHOTOS.length;

  const donutData = CATEGORIES.map((cat, i) => ({
    label: cat.label,
    value: counts[cat.id],
    color: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
  }));

  // Genuinely newest-first now that records carry real
  // created_at timestamps — no more "first entries" stand-in.
  const recentUploads = newestFirst(PHOTOS).slice(0, 6);

  return (
    <>
      {/* ── Page heading ─────────────────────────────────── */}
      <h1 className="text-xl font-light tracking-wide">Overview</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Welcome back. Here&apos;s your portfolio at a glance.
      </p>

      {/* ── Stat cards ───────────────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total photos" value={String(total)} />
        <StatCard label="Categories" value={String(CATEGORIES.length)} />
        <StatCard
          label="Last upload"
          value={formatPhotoDate(recentUploads[0].created_at)}
        />
      </div>

      {/* ── Distribution + recent uploads ────────────────── */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">

        {/* Category distribution — donut + legend */}
        <section
          aria-label="Category distribution"
          className="rounded-xl bg-liol-text/5 p-5"
        >
          <h2 className="text-xs text-liol-subtext">
            Category distribution
          </h2>

          <div className="mt-4 flex justify-center">
            <DonutChart data={donutData} />
          </div>

          {/* Legend — swatch + label + count per category */}
          <ul className="mt-5 flex flex-col gap-2">
            {donutData.map((d) => (
              <li
                key={d.label}
                className="flex items-center gap-2.5 text-sm"
              >
                <span
                  aria-hidden="true"
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: d.color }}
                />
                <span className="text-liol-subtext">{d.label}</span>
                <span className="ml-auto text-liol-text">{d.value}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Recent uploads — latest six, square thumbnails.
            "View all" hands off to the Library for the full
            searchable catalog (deep management lives there). */}
        <section aria-label="Recent uploads">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs text-liol-subtext">Recent uploads</h2>
            <Link
              href="/admin/library"
              className="text-xs text-liol-subtext hover:text-liol-text duration-200"
            >
              View all →
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {recentUploads.map((photo) => (
              <figure
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.src}
                  alt={photo.alt_text}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                {/* Name strip — bottom wash so titles stay legible */}
                <figcaption className="absolute inset-x-0 bottom-0 bg-liol-bg/70 px-2.5 py-1.5 text-[0.7rem] text-liol-text truncate">
                  {photo.name}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

      </div>
    </>
  );
}

// ── Stat card ───────────────────────────────────────────────
// Small label-over-value tile on a faint white wash.
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-liol-text/5 px-5 py-4">
      <p className="text-xs text-liol-subtext">{label}</p>
      <p className="mt-1 text-2xl font-light">{value}</p>
    </div>
  );
}
