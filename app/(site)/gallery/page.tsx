import PageHeader from "@/app/components/PageHeader";
import ScrollTopButton from "@/app/components/ScrollTopButton";
import ScrollRevealElement from "@/app/components/motion/ScrollRevealElement";
import GalleryFeed from "./GalleryFeed";
import { createClient } from "@/app/lib/supabase/server";
import { PhotoRecord } from "@/app/lib/photos";

// ============================================================
// GALLERY PAGE — "The Work"
// Server Component — fetches photos from Supabase and passes
// them down to the interactive GalleryFeed client component.
// ============================================================

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("date_taken", { ascending: false });

  const photos: PhotoRecord[] = error ? [] : (data as PhotoRecord[]);

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
        <GalleryFeed photos={photos} />
      </ScrollRevealElement>
      <ScrollTopButton />
    </main>
  );
}
