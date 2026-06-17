import PhotoUploader from "../../components/PhotoUploader";

// ============================================================
// ADMIN UPLOAD — /admin/upload
// Server shell. All interactivity (drag-drop, EXIF, ImageKit
// upload, Supabase insert) lives in the PhotoUploader client
// component. Protected by middleware like the rest of /admin.
// ============================================================

export default function AdminUploadPage() {
  return (
    <>
      <h1 className="text-xl font-light tracking-wide">Upload</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Add new photos to the site. They go live in the gallery as soon as they finish uploading.
      </p>

      <div className="mt-8">
        <PhotoUploader />
      </div>
    </>
  );
}
