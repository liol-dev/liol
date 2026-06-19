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
//
// Deletes remove the ImageKit CDN asset BEFORE the DB row (via
// /api/delete-photo) so nothing is orphaned. Single + bulk share
// one deletePhotoEverywhere() core.
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

  // ── Shared delete core ────────────────────────────────────
  // Removes the CDN asset first (if the photo has an ImageKit
  // fileId), then the DB row. Throws on either failure so callers
  // can decide how to surface it. Seeded/legacy rows with no
  // fileId skip straight to the DB delete.
  const deletePhotoEverywhere = async (photo: PhotoRecord) => {
    if (photo.image_kit_file_id) {
      const res = await fetch("/api/delete-photo", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId: photo.image_kit_file_id }),
      });
      if (!res.ok) throw new Error("cdn");
    }

    const supabase = createClient();
    const { error } = await supabase.from("photos").delete().eq("id", photo.id);
    if (error) throw new Error("db");
  };

  const handleDelete = async (id: string) => {
    setError(null);
    const target = photos.find((p) => p.id === id);
    if (!target) return;

    try {
      await deletePhotoEverywhere(target);
    } catch (e) {
      setError(
        e instanceof Error && e.message === "cdn"
          ? "Could not remove the image from storage. Please try again."
          : "Could not delete photo. Please try again."
      );
      return;
    }

    // Optimistic update — remove from local list immediately
    setPhotos((prev) => prev.filter((p) => p.id !== id));
    setSelected(null);
    router.refresh();
  };

  const handleBulkDelete = async (ids: string[]) => {
    setError(null);
    const idSet = new Set(ids);
    const targets = photos.filter((p) => idSet.has(p.id));

    const succeeded: string[] = [];
    let failedCount = 0;

    // Sequential — gentle on the network, clean partial-failure story
    for (const photo of targets) {
      try {
        await deletePhotoEverywhere(photo);
        succeeded.push(photo.id);
      } catch {
        failedCount++;
      }
    }

    if (succeeded.length > 0) {
      const okSet = new Set(succeeded);
      setPhotos((prev) => prev.filter((p) => !okSet.has(p.id)));
      router.refresh();
    }

    if (failedCount > 0) {
      setError(
        `Couldn't delete ${failedCount} of ${targets.length} photos. The rest were removed.`
      );
    }
  };

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 text-sm text-red-400">{error}</p>
      )}

      <PhotoLibrary
        photos={photos}
        onSelect={setSelected}
        onBulkDelete={handleBulkDelete}
      />

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
