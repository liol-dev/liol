import PageHeader from "@/app/components/PageHeader";
import ScrollTopButton from "@/app/components/ScrollTopButton";
import ScrollRevealElement from "@/app/components/motion/ScrollRevealElement";
import GalleryFeed from "./GalleryFeed";
import { createClient } from "@/app/lib/supabase/server";
import { PhotoRecord, CategoryRecord } from "@/app/lib/photos";

// ============================================================
// GALLERY PAGE — "The Work"
// Server Component — fetches photos + categories from Supabase
// and passes them to GalleryFeed. Categories drive the filter
// pills and section headers dynamically — no hardcoded list.
// ============================================================

export default async function GalleryPage() {
  const supabase = await createClient();

  const [photosResult, categoriesResult] = await Promise.all([
    supabase
      .from("photos")
      .select("*")
      .order("date_taken", { ascending: false }),
    supabase
      .from("categories")
      .select("*")
      .order("label", { ascending: true }),
  ]);

  const photos: PhotoRecord[] = photosResult.error ? [] : (photosResult.data as PhotoRecord[]);

  // Filter miscellaneous out of the public gallery — it's an internal
  // fallback bucket, not a display category Corey & Ed curated.
  const categories: CategoryRecord[] = categoriesResult.error
    ? []
    : (categoriesResult.data as CategoryRecord[]).filter(
        (c) => c.slug !== "miscellaneous"
      );

  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat pb-24">
      <PageHeader
        title="The Work"
        subtitle="Every frame tells you something. Here's what we've been saying."
      />
      <ScrollRevealElement
        direction="opacity"
        duration={0.7}
        delay={0.3}
        amount={0}
        margin="0px"
        useWillChange={false}
      >
        <GalleryFeed photos={photos} categories={categories} />
      </ScrollRevealElement>
      <ScrollTopButton />
    </main>
  );
}
