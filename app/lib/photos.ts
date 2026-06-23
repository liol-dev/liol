// ============================================================
// PHOTOS DATA LAYER — single source of truth for site imagery
//
// PhotoRecord mirrors the Supabase `photos` table
// COLUMN-FOR-COLUMN (snake_case on purpose: Supabase returns
// rows exactly as columns are named, so keeping the TS shape
// identical means swapping mock → fetched requires NO field
// mapping anywhere in the UI).
//
// Categories are now dynamic — managed via the `categories`
// Supabase table and the /admin/categories dashboard.
// Use fetchCategories() from @/app/lib/categories.server
// (Server Components only) or /api/categories (client).
// ============================================================

// category is now a plain string — slug from the categories table
export type PhotoCategory = string;

export interface PhotoRecord {
  id: string;
  src: string;
  name: string;
  category: PhotoCategory;
  date_taken: string;
  created_at: string;
  caption: string;
  alt_text: string;
  image_kit_file_id?: string | null;
}

export interface CategoryRecord {
  id: string;
  slug: string;
  label: string;
  protected: boolean;
  created_at: string;
}

// ── Static fallback ─────────────────────────────────────────
// Used only where a server fetch isn't practical. Prefer
// fetchCategories() from @/app/lib/categories.server instead.
export const CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: "couples",     label: "Couples" },
  { id: "engagements", label: "Engagements" },
  { id: "portraits",   label: "Portraits" },
];

// ── Display helpers ─────────────────────────────────────────

/** ISO date/timestamp → "March 2026" (site display convention) */
export function formatPhotoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Photos sorted newest-first by upload time */
export function newestFirst(photos: PhotoRecord[]): PhotoRecord[] {
  return [...photos].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  );
}

/** Photo counts per category slug — works with any slug set */
export function countByCategory(
  photos: PhotoRecord[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const photo of photos) {
    counts[photo.category] = (counts[photo.category] ?? 0) + 1;
  }
  return counts;
}
