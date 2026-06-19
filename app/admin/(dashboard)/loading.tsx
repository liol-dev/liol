// ============================================================
// ADMIN DASHBOARD — loading skeleton
// Shown by Next during the server fetch / navigation for any
// route in the (dashboard) group (overview, library, upload).
// Mirrors the rough shape of those pages — a title, a row of
// cards, and a thumbnail grid — so the jump from skeleton to
// content doesn't lurch.
// ============================================================

export default function DashboardLoading() {
  return (
    <div className="animate-pulse" aria-hidden="true">
      {/* Title + subtitle */}
      <div className="h-6 w-40 rounded bg-liol-text/10" />
      <div className="mt-2 h-4 w-64 rounded bg-liol-text/5" />

      {/* Card row */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-liol-text/5" />
        ))}
      </div>

      {/* Thumbnail grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-liol-text/5" />
        ))}
      </div>

      <span className="sr-only">Loading…</span>
    </div>
  );
}
