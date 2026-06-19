// ============================================================
// PHOTOS DATA LAYER — single source of truth for site imagery
//
// PhotoRecord mirrors the future Supabase `photos` table
// COLUMN-FOR-COLUMN (snake_case on purpose: Supabase returns
// rows exactly as columns are named, so keeping the TS shape
// identical means swapping mock → fetched requires NO field
// mapping anywhere in the UI).
//
// Planned table:
//   create table photos (
//     id                 uuid primary key default gen_random_uuid(),
//     src                text not null,        -- ImageKit delivery URL
//     name               text not null,
//     category           text not null,        -- 'couples' | 'engagements' | 'portraits'
//     date_taken         date not null,        -- editable (EXIF-prefilled on upload)
//     created_at         timestamptz default now(),  -- IMMUTABLE upload date
//     caption            text default '',
//     alt_text           text default '',
//     image_kit_file_id  text                  -- ImageKit fileId, used to delete the
//                                               -- CDN asset when the row is deleted.
//                                               -- Nullable: legacy/seeded rows won't have one.
//   );
//
// Consumers (public gallery + admin) import ONLY from this
// file. When Supabase lands, PHOTOS becomes a query and the
// rest of the app doesn't move.
// ============================================================

export type PhotoCategory = "couples" | "engagements" | "portraits";

export interface PhotoRecord {
  id: string;          // uuid in production; readable slugs in mock
  src: string;         // ImageKit URL (mock: Unsplash placeholders)
  name: string;        // display title
  category: PhotoCategory;
  date_taken: string;  // ISO date "YYYY-MM-DD" — editable
  created_at: string;  // ISO timestamp — immutable upload date
  caption: string;     // editable display caption
  alt_text: string;    // editable accessibility text
  image_kit_file_id?: string | null; // ImageKit fileId — absent/null for legacy/seeded rows
}

// ── Categories ──────────────────────────────────────────────
// Drives gallery sections, admin filter pills, and the donut.
export const CATEGORIES: { id: PhotoCategory; label: string }[] = [
  { id: "couples", label: "Couples" },
  { id: "engagements", label: "Engagements" },
  { id: "portraits", label: "Portraits" },
];

// ── Display helpers ─────────────────────────────────────────

/** ISO date/timestamp → "March 2026" (site display convention) */
export function formatPhotoDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC", // date-only ISO strings parse as UTC midnight
  });
}

/** Photos sorted newest-first by upload time (Recent uploads) */
export function newestFirst(photos: PhotoRecord[]): PhotoRecord[] {
  return [...photos].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)
  );
}

/** Photo counts per category (Overview stat cards + donut) */
export function countByCategory(
  photos: PhotoRecord[]
): Record<PhotoCategory, number> {
  const counts: Record<PhotoCategory, number> = {
    couples: 0,
    engagements: 0,
    portraits: 0,
  };
  for (const photo of photos) counts[photo.category]++;
  return counts;
}

// ── Mock dataset ────────────────────────────────────────────
// Unsplash placeholders shaped EXACTLY like future DB rows.
// Replace `src` values (or the whole array with a Supabase
// query) when real imagery arrives — nothing else changes.
export const PHOTOS: PhotoRecord[] = [
  // ── Couples ───────────────────────────────────────────────
  { id: "pht-001", src: "https://images.unsplash.com/photo-1588492885706-b8917f06df77?auto=format&fit=crop&w=1200&q=80", name: "Golden Hour, Shared",     category: "couples",     date_taken: "2026-03-14", created_at: "2026-03-16T10:00:00Z", caption: "Golden Hour, Shared — shot on location.",     alt_text: "A couple together in warm golden-hour light" },
  { id: "pht-002", src: "https://images.unsplash.com/photo-1527928159272-7d012024eb74?auto=format&fit=crop&w=1200&q=80", name: "The Long Way Home",       category: "couples",     date_taken: "2026-02-21", created_at: "2026-02-23T10:00:00Z", caption: "The Long Way Home — shot on location.",       alt_text: "A couple walking together down a long road" },
  { id: "pht-003", src: "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&w=1200&q=80", name: "Sunday Morning",          category: "couples",     date_taken: "2026-01-18", created_at: "2026-01-20T10:00:00Z", caption: "Sunday Morning — shot on location.",          alt_text: "A couple sharing a quiet Sunday morning moment" },
  { id: "pht-004", src: "https://images.unsplash.com/photo-1572914857229-37bf6ee8101c?auto=format&fit=crop&w=1200&q=80", name: "Where the Coast Ends",    category: "couples",     date_taken: "2025-12-12", created_at: "2025-12-14T10:00:00Z", caption: "Where the Coast Ends — shot on location.",    alt_text: "A couple at the edge of the coastline" },
  { id: "pht-005", src: "https://images.unsplash.com/photo-1553984840-b8cbc34f5215?auto=format&fit=crop&w=1200&q=80",   name: "Soft Focus",              category: "couples",     date_taken: "2025-11-08", created_at: "2025-11-10T10:00:00Z", caption: "Soft Focus — shot on location.",              alt_text: "A softly focused intimate portrait of a couple" },
  { id: "pht-006", src: "https://images.unsplash.com/photo-1583542225715-473a32c9b0ef?auto=format&fit=crop&w=1200&q=80", name: "Two of Us",               category: "couples",     date_taken: "2025-10-25", created_at: "2025-10-27T10:00:00Z", caption: "Two of Us — shot on location.",               alt_text: "A couple posing closely together" },

  // ── Engagements ───────────────────────────────────────────
  { id: "pht-007", src: "https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&w=1200&q=80", name: "She Said Yes (Out West)", category: "engagements", date_taken: "2026-04-11", created_at: "2026-04-13T10:00:00Z", caption: "She Said Yes (Out West) — shot on location.", alt_text: "An engagement moment in a western landscape" },
  { id: "pht-008", src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=1200&q=80", name: "City Lights Proposal",    category: "engagements", date_taken: "2026-03-07", created_at: "2026-03-09T10:00:00Z", caption: "City Lights Proposal — shot on location.",    alt_text: "A proposal against glowing city lights" },
  { id: "pht-009", src: "https://images.unsplash.com/photo-1541187714594-731deadcd16a?auto=format&fit=crop&w=1200&q=80", name: "The Quiet Before",        category: "engagements", date_taken: "2026-02-14", created_at: "2026-02-16T10:00:00Z", caption: "The Quiet Before — shot on location.",        alt_text: "A quiet, intimate pre-proposal moment" },
  { id: "pht-010", src: "https://images.unsplash.com/photo-1493306454986-c8877a09cbeb?auto=format&fit=crop&w=1200&q=80", name: "Ridge Line Ring",         category: "engagements", date_taken: "2025-12-06", created_at: "2025-12-08T10:00:00Z", caption: "Ridge Line Ring — shot on location.",         alt_text: "An engagement along a mountain ridge line" },
  { id: "pht-011", src: "https://images.unsplash.com/photo-1536466528142-f752ae7bdd0c?auto=format&fit=crop&w=1200&q=80", name: "First Light Together",    category: "engagements", date_taken: "2025-11-15", created_at: "2025-11-17T10:00:00Z", caption: "First Light Together — shot on location.",    alt_text: "An engaged couple at first light" },
  { id: "pht-012", src: "https://images.unsplash.com/photo-1433446787703-42d5bf446876?auto=format&fit=crop&w=1200&q=80", name: "Mountain Promise",        category: "engagements", date_taken: "2025-09-20", created_at: "2025-09-22T10:00:00Z", caption: "Mountain Promise — shot on location.",        alt_text: "An engagement promise in the mountains" },

  // ── Portraits ─────────────────────────────────────────────
  { id: "pht-013", src: "https://images.unsplash.com/photo-1588499756884-d72584d84df5?auto=format&fit=crop&w=1200&q=80", name: "Study in Stillness",      category: "portraits",   date_taken: "2026-05-09", created_at: "2026-05-11T10:00:00Z", caption: "Study in Stillness — shot on location.",      alt_text: "A still, contemplative portrait" },
  { id: "pht-014", src: "https://images.unsplash.com/photo-1588247866001-68fa8c438dd7?auto=format&fit=crop&w=1200&q=80", name: "Between Frames",          category: "portraits",   date_taken: "2026-04-19", created_at: "2026-04-21T10:00:00Z", caption: "Between Frames — shot on location.",          alt_text: "A candid portrait caught between poses" },
  { id: "pht-015", src: "https://images.unsplash.com/photo-1588414734732-660b07304ddb?auto=format&fit=crop&w=1200&q=80", name: "Window Light",            category: "portraits",   date_taken: "2026-03-22", created_at: "2026-03-24T10:00:00Z", caption: "Window Light — shot on location.",            alt_text: "A portrait lit by soft window light" },
  { id: "pht-016", src: "https://images.unsplash.com/photo-1588453862014-cd1a9ad06a12?auto=format&fit=crop&w=1200&q=80", name: "Detail Study No. 4",      category: "portraits",   date_taken: "2026-01-30", created_at: "2026-02-01T10:00:00Z", caption: "Detail Study No. 4 — shot on location.",      alt_text: "A close detail study portrait" },
  { id: "pht-017", src: "https://images.unsplash.com/photo-1558980663-3685c1d673c4?auto=format&fit=crop&w=1200&q=80",   name: "Into the Mist",           category: "portraits",   date_taken: "2025-12-19", created_at: "2025-12-21T10:00:00Z", caption: "Into the Mist — shot on location.",           alt_text: "A portrait fading into morning mist" },
  { id: "pht-018", src: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80",   name: "Open Country",            category: "portraits",   date_taken: "2025-10-11", created_at: "2025-10-13T10:00:00Z", caption: "Open Country — shot on location.",            alt_text: "A portrait in wide open countryside" },
];
