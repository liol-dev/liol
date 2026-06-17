import LibraryManager from "../../components/LibraryManager";
import { createClient } from "@/app/lib/supabase/server";
import { PhotoRecord } from "@/app/lib/photos";

// ============================================================
// ADMIN LIBRARY — /admin/library
// Server Component — queries Supabase directly, no useEffect.
// Passes fetched photos down to LibraryManager which owns all
// interactive state (search, filter, modal, edit, delete).
// ============================================================

export default async function AdminLibraryPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });

  const photos: PhotoRecord[] = error ? [] : (data as PhotoRecord[]);

  return (
    <>
      <h1 className="text-xl font-light tracking-wide">Library</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Search, filter, and manage every photo on the site.
      </p>

      {error && (
        <p className="mt-4 text-sm text-red-400">
          Could not load photos. Please try again.
        </p>
      )}

      <div className="mt-8">
        <LibraryManager initialPhotos={photos} />
      </div>
    </>
  );
}
