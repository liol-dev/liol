// ============================================================
// GALLERY PHOTO DATA
// Placeholder dataset for the gallery feed. In production this
// will be fed by ImageKit/Supabase — components consume this
// shape, so only this file (or its data source) changes.
// ============================================================

export type GalleryCategory = "couples" | "engagements" | "portraits";

export interface GalleryPhoto {
  src: string;
  name: string;   // display title (hover overlay + lightbox)
  date: string;   // display date (loose string for now)
  category: GalleryCategory;
}

// Category definitions — drives section order, the desktop
// sidebar, and the mobile tag bar. "All" is added in the UI
// layer since it's navigation, not a real category.
export const CATEGORIES: { id: GalleryCategory; label: string }[] = [
  { id: "couples", label: "Couples" },
  { id: "engagements", label: "Engagements" },
  { id: "portraits", label: "Portraits" },
];

export const PHOTOS: GalleryPhoto[] = [
  // ── Couples ─────────────────────────────────────────────
  { src: "https://images.unsplash.com/photo-1588492885706-b8917f06df77?auto=format&fit=crop&w=1200&q=80", name: "Golden Hour, Shared", date: "March 2026", category: "couples" },
  { src: "https://images.unsplash.com/photo-1527928159272-7d012024eb74?auto=format&fit=crop&w=1200&q=80", name: "The Long Way Home", date: "February 2026", category: "couples" },
  { src: "https://images.unsplash.com/photo-1586521995568-39abaa0c2311?auto=format&fit=crop&w=1200&q=80", name: "Sunday Morning", date: "January 2026", category: "couples" },
  { src: "https://images.unsplash.com/photo-1572914857229-37bf6ee8101c?auto=format&fit=crop&w=1200&q=80", name: "Where the Coast Ends", date: "December 2025", category: "couples" },
  { src: "https://images.unsplash.com/photo-1553984840-b8cbc34f5215?auto=format&fit=crop&w=1200&q=80", name: "Soft Focus", date: "November 2025", category: "couples" },
  { src: "https://images.unsplash.com/photo-1583542225715-473a32c9b0ef?auto=format&fit=crop&w=1200&q=80", name: "Two of Us", date: "October 2025", category: "couples" },

  // ── Engagements ─────────────────────────────────────────
  { src: "https://images.unsplash.com/photo-1587588354456-ae376af71a25?auto=format&fit=crop&w=1200&q=80", name: "She Said Yes (Out West)", date: "April 2026", category: "engagements" },
  { src: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?auto=format&fit=crop&w=1200&q=80", name: "City Lights Proposal", date: "March 2026", category: "engagements" },
  { src: "https://images.unsplash.com/photo-1541187714594-731deadcd16a?auto=format&fit=crop&w=1200&q=80", name: "The Quiet Before", date: "February 2026", category: "engagements" },
  { src: "https://images.unsplash.com/photo-1493306454986-c8877a09cbeb?auto=format&fit=crop&w=1200&q=80", name: "Ridge Line Ring", date: "December 2025", category: "engagements" },
  { src: "https://images.unsplash.com/photo-1536466528142-f752ae7bdd0c?auto=format&fit=crop&w=1200&q=80", name: "First Light Together", date: "November 2025", category: "engagements" },
  { src: "https://images.unsplash.com/photo-1433446787703-42d5bf446876?auto=format&fit=crop&w=1200&q=80", name: "Mountain Promise", date: "September 2025", category: "engagements" },

  // ── Portraits ───────────────────────────────────────────
  { src: "https://images.unsplash.com/photo-1588499756884-d72584d84df5?auto=format&fit=crop&w=1200&q=80", name: "Study in Stillness", date: "May 2026", category: "portraits" },
  { src: "https://images.unsplash.com/photo-1588247866001-68fa8c438dd7?auto=format&fit=crop&w=1200&q=80", name: "Between Frames", date: "April 2026", category: "portraits" },
  { src: "https://images.unsplash.com/photo-1588414734732-660b07304ddb?auto=format&fit=crop&w=1200&q=80", name: "Window Light", date: "March 2026", category: "portraits" },
  { src: "https://images.unsplash.com/photo-1588453862014-cd1a9ad06a12?auto=format&fit=crop&w=1200&q=80", name: "Detail Study No. 4", date: "January 2026", category: "portraits" },
  { src: "https://images.unsplash.com/photo-1558980663-3685c1d673c4?auto=format&fit=crop&w=1200&q=80", name: "Into the Mist", date: "December 2025", category: "portraits" },
  { src: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&w=1200&q=80", name: "Open Country", date: "October 2025", category: "portraits" },
];
