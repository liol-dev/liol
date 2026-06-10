import PageHeader from "../components/PageHeader";
import ScrollTopButton from "../components/ScrollTopButton";
import GalleryFeed from "./GalleryFeed";

// ============================================================
// GALLERY PAGE — "The Work"
// PageHeader (shared) + interactive GalleryFeed (category
// sections, sticky sidebar, hover overlays, lightbox) +
// ScrollTopButton (shared sticky back-to-top).
// Photo data lives in ./photos.ts until ImageKit/Supabase.
// ============================================================

export default function GalleryPage() {
  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat pb-24">
      <PageHeader
        title="The Work"
        subtitle="Every frame tells you something. Here's what we've been saying."
      />
      <GalleryFeed />
      <ScrollTopButton />
    </main>
  );
}
