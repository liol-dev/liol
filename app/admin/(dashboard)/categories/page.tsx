import CategoriesManager from "../../components/CategoriesManager";

// ============================================================
// ADMIN CATEGORIES — /admin/categories
// Server shell. All interactivity lives in CategoriesManager.
// Protected by middleware like the rest of /admin.
// ============================================================

export default function AdminCategoriesPage() {
  return (
    <>
      <h1 className="text-xl font-light tracking-wide">Categories</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Manage the categories used to organise photos in the gallery.
      </p>

      {/* Character limit advisory */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-400/25 bg-amber-400/5 px-4 py-3">
        <svg className="w-4 h-4 text-amber-400/80 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <p className="text-xs text-amber-400/80 leading-relaxed">
          Category names longer than ~25 characters will be truncated in the gallery&apos;s
          desktop navigation. Keep names short and descriptive for the best display.
        </p>
      </div>

      <div className="mt-8">
        <CategoriesManager />
      </div>
    </>
  );
}
