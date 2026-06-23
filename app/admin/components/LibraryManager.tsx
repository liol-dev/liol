"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PhotoLibrary from "./PhotoLibrary";
import PhotoDetailModal from "./PhotoDetailModal";
import { type PhotoRecord, type CategoryRecord } from "@/app/lib/photos";
import { createClient } from "@/app/lib/supabase/client";

// ============================================================
// LIBRARY MANAGER — state layer for browse → edit → delete
// Owns the working photo list, active modal photo, and the
// dynamic category list (fetched once here, passed to both
// PhotoLibrary and PhotoDetailModal so they stay in sync).
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

  // Dynamic categories — fetched once, shared with PhotoLibrary
  // and PhotoDetailModal so filter pills + category selects always
  // reflect whatever Corey & Ed have configured in /admin/categories.
  const [categories, setCategories] = useState<CategoryRecord[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: CategoryRecord[]) => setCategories(data))
      .catch(() => {
        // Silent fail — UI degrades gracefully (no filter pills,
        // empty category select) rather than breaking the library.
      });
  }, []);

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
      })
      .eq("id", updated.id);

    if (error) {
      setError("Could not save changes. Please try again.");
      return;
    }

    setPhotos((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setSelected(null);
    router.refresh();
  };

  // ── Shared delete core ────────────────────────────────────
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
        categories={categories}
        onSelect={setSelected}
        onBulkDelete={handleBulkDelete}
      />

      {selected && (
        <PhotoDetailModal
          photo={selected}
          categories={categories}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  );
}
