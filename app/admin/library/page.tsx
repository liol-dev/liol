import LibraryManager from "../components/LibraryManager";
import { PHOTOS } from "@/app/lib/photos";

// ============================================================
// ADMIN LIBRARY — /admin/library
// The dedicated photo-management page. LibraryManager owns the
// interactive state (search/filter grid + detail modal with
// editing and confirm-to-delete); this page just feeds it the
// dataset and stays a server component.
// ============================================================

export default function AdminLibraryPage() {
  return (
    <>
      <h1 className="text-xl font-light tracking-wide">Library</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Search, filter, and manage every photo on the site.
      </p>

      <div className="mt-8">
        <LibraryManager initialPhotos={PHOTOS} />
      </div>
    </>
  );
}
