"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PhotoLibrary from "./PhotoLibrary";
import PhotoDetailModal from "./PhotoDetailModal";
import { type PhotoRecord } from "@/app/lib/photos";
import { createClient } from "@/app/lib/supabase/client";

// ============================================================
// LIBRARY MANAGER — state layer for browse → edit → delete
// Owns the working photo list and which photo (if any) is open
// in the detail modal. The page stays a server component; all
// interactivity lives here.
//
// Save/delete hit Supabase directly then update local state
// optimistically — no full page reload needed. router.refresh()
// re-syncs the server component data in the background so the
// next navigation is always fresh.
// ============================================================

export default function LibraryManager({
  initialPhotos,
}: {
  initialPhotos: PhotoRecord[];
}) {
  const router = useRouter();
  const [photos, setPhotos] = useState<PhotoRecord[]>(initialPhotos);
  const [selected, setSelected] = useState<PhotoRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (updated: PhotoRecord) => {
    setError(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("photos")
      .update({
        name:       updated.name,
        category:   updated.category,
        date_taken: updated.date_taken,
        caption:    updated.caption,
        alt_text:   updated.alt_text,
        // src and created_at are intentionally excluded —
        // src changes via the upload flow only; created_at is immutable
      })
      .eq("id", updated.id);

    if (error) {
      setError("Could not save changes. Please try again.");
      return;
    }

    // Optimistic update — reflect the change immediately in the UI
    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(null);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const supabase = createClient();

    const { error } = await supabase
      .from("photos")
      .delete()
      .eq("id", id);

    if (error) {
      setError("Could not delete photo. Please try again.");
      return;
    }

    // Optimistic update — remove from local list immediately
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
    router.refresh();
  };

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>
      )}

      <PhotoLibrary photos={photos} onSelect={setSelected} />

      {selected && (
        <PhotoDetailModal
          photo={selected}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
