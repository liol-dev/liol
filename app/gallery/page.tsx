import PageHeader from "../components/PageHeader";
import ScrollTopButton from "../components/ScrollTopButton";
import ScrollRevealElement from "../components/motion/ScrollRevealElement";
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
      {/* ⚠ OPACITY-ONLY on purpose: GalleryFeed contains a
          position:sticky sidebar, and an animated transform on
          an ancestor would turn this wrapper into its containing
          block and kill the stickiness. No transform, no problem.
          amount={0}: the feed is far taller than the viewport, so
          any visibility threshold above zero would never trigger
          and the feed would stay invisible (desktop bug, fixed). */}
      <ScrollRevealElement
        direction="opacity"
        duration={0.7}
        delay={0.3}
        amount={0}
        margin="0px"
        useWillChange={false}
      >
        <GalleryFeed />
      </ScrollRevealElement>
      <ScrollTopButton />
    </main>
  );
}
