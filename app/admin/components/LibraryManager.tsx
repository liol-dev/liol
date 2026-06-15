"use client";

import { useState } from "react";
import PhotoLibrary from "./PhotoLibrary";
import PhotoDetailModal from "./PhotoDetailModal";
import { type PhotoRecord } from "@/app/lib/photos";

// ============================================================
// LIBRARY MANAGER — state layer for browse → edit → delete
// Owns the working photo list and which photo (if any) is open
// in the detail modal. The page stays a server component; all
// interactivity lives here.
//
// ⚠ MOCK-DATA NOTE: save/delete mutate React state only, so
// changes are visible immediately but reset on refresh. When
// Supabase lands, handleSave/handleDelete become update/delete
// queries (+ optimistic state updates) — the components they
// drive don't change at all.
// ============================================================

export default function LibraryManager({
  initialPhotos,
}: {
  initialPhotos: PhotoRecord[];
}) {
  const [photos, setPhotos] = useState<PhotoRecord[]>(initialPhotos);
  const [selected, setSelected] = useState<PhotoRecord | null>(null);

  // NEXT SESSION: supabase.from("photos").update(...).eq("id", ...)
  const handleSave = (updated: PhotoRecord) => {
    setPhotos((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    setSelected(null);
  };

  // NEXT SESSION: supabase delete + ImageKit file removal
  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
  };

  return (
    <>
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
