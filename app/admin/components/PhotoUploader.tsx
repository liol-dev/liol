"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import exifr from "exifr";
import {
  upload,
  ImageKitAbortError,
  ImageKitInvalidRequestError,
  ImageKitServerError,
  ImageKitUploadNetworkError,
} from "@imagekit/next";
import { createClient } from "@/app/lib/supabase/client";
import type { PhotoCategory, CategoryRecord } from "@/app/lib/photos";

// ============================================================
// PHOTO UPLOADER — drag-and-drop -> ImageKit -> Supabase
//
// Flow per file:
//   1. Stage locally (object-URL preview, metadata fields).
//      EXIF DateTimeOriginal pre-fills "date taken" when present.
//   2. On "Upload all", sequentially:
//      a. GET /api/upload-auth for fresh ImageKit credentials
//      b. upload() the binary straight to ImageKit (browser ->
//         ImageKit, private key never involved)
//      c. insert the metadata row into Supabase `photos`, with
//         src = the ImageKit delivery URL. id + created_at are
//         DB-generated, so we never send them.
//
// Staged rows carry their own status + progress so the UI shows
// exactly where each file is. router.refresh() re-syncs the
// server-rendered library/overview once uploads land.
//
// Categories are loaded dynamically from /api/categories so
// any new categories added in /admin/categories show up here
// immediately without a redeploy.
// ============================================================

type Status = "idle" | "uploading" | "done" | "error";

interface StagedPhoto {
  localId: string;
  file: File;
  previewUrl: string;
  name: string;
  category: PhotoCategory;
  date_taken: string;
  caption: string;
  alt_text: string;
  status: Status;
  progress: number;
  errorMsg?: string;
}

// Date helpers — build YYYY-MM-DD from a Date's LOCAL parts.
// EXIF timestamps are naive/local, so toISOString() would risk
// a +/- 1 day shift.
function toLocalISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
const todayISO = () => toLocalISODate(new Date());

// Strip the extension for a friendlier default name
function baseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}

// Shared field styles — mirrors PhotoDetailModal for consistency
const labelCls = "text-[0.65rem] tracking-[0.08em] uppercase text-liol-subtext";
const inputCls =
  "mt-1.5 w-full rounded-lg bg-liol-text/5 border border-liol-text/15 px-3.5 py-2 text-sm text-liol-text outline-none focus:border-liol-text/40 duration-200";

export default function PhotoUploader() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<StagedPhoto[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic categories from /api/categories
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Load categories on mount so the select always reflects what's in the DB
  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data: CategoryRecord[]) => {
        // Filter out miscellaneous — it's a fallback, not something
        // Corey & Ed should manually assign photos to.
        setCategories(data.filter((c) => c.slug !== "miscellaneous"));
      })
      .catch(() => {
        // Silent fail — leaves categories empty; upload still works
        // and the select will just have no options until refresh.
      })
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Default category slug — first non-misc category once loaded
  const defaultCategory = categories[0]?.slug ?? "";

  // Revoke every object URL on unmount (no preview leaks)
  useEffect(() => {
    return () => {
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Staging
  const addFiles = useCallback((fileList: FileList | File[]) => {
    const files = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/")
    );
    if (files.length === 0) return;

    const staged: StagedPhoto[] = files.map((file) => ({
      localId: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      file,
      previewUrl: URL.createObjectURL(file),
      name: baseName(file.name),
      category: defaultCategory,
      date_taken: todayISO(),
      caption: "",
      alt_text: "",
      status: "idle",
      progress: 0,
    }));

    setItems((prev) => [...prev, ...staged]);

    // Pull EXIF capture date in the background; patch when found
    staged.forEach(async (item) => {
      try {
        const exif = await exifr.parse(item.file).catch(() => null);
        const taken: Date | undefined =
          exif?.DateTimeOriginal || exif?.CreateDate;
        if (taken instanceof Date && !isNaN(taken.getTime())) {
          setItems((prev) =>
            prev.map((p) =>
              p.localId === item.localId
                ? { ...p, date_taken: toLocalISODate(taken) }
                : p
            )
          );
        }
      } catch {
        // No/unsupported EXIF — keep today's date as fallback
      }
    });
  }, [defaultCategory]);

  const updateItem = (localId: string, patch: Partial<StagedPhoto>) =>
    setItems((prev) =>
      prev.map((p) => (p.localId === localId ? { ...p, ...patch } : p))
    );

  const removeItem = (localId: string) =>
    setItems((prev) => {
      const target = prev.find((p) => p.localId === localId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.localId !== localId);
    });

  const clearCompleted = () =>
    setItems((prev) => {
      prev
        .filter((p) => p.status === "done")
        .forEach((p) => URL.revokeObjectURL(p.previewUrl));
      return prev.filter((p) => p.status !== "done");
    });

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

  // Upload
  const getAuth = async () => {
    const res = await fetch("/api/upload-auth");
    if (!res.ok) {
      throw new Error(
        res.status === 401
          ? "Your session expired — sign in again."
          : "Couldn't get upload credentials."
      );
    }
    return res.json() as Promise<{
      token: string;
      expire: number;
      signature: string;
      publicKey: string;
    }>;
  };

  const uploadOne = async (item: StagedPhoto) => {
    updateItem(item.localId, {
      status: "uploading",
      progress: 0,
      errorMsg: undefined,
    });

    const { token, expire, signature, publicKey } = await getAuth();

    const res = await upload({
      file: item.file,
      fileName: item.file.name,
      token,
      expire,
      signature,
      publicKey,
      folder: "/liol",
      useUniqueFileName: true,
      tags: [item.category],
      onProgress: (e) =>
        updateItem(item.localId, {
          progress: Math.round((e.loaded / e.total) * 100),
        }),
    });

    if (!res.url) throw new Error("Upload succeeded but no URL was returned.");

    const supabase = createClient();
    const { error } = await supabase.from("photos").insert({
      src: res.url,
      name: item.name.trim(),
      category: item.category,
      date_taken: item.date_taken,
      caption: item.caption,
      alt_text: item.alt_text,
      image_kit_file_id: res.fileId,
    });

    if (error)
      throw new Error("Uploaded to ImageKit, but saving details failed.");

    updateItem(item.localId, { status: "done", progress: 100 });
  };

  const handleUploadAll = async () => {
    setIsUploading(true);
    let anySucceeded = false;

    for (const item of items) {
      if (item.status === "done") continue;
      try {
        await uploadOne(item);
        anySucceeded = true;
      } catch (err) {
        let msg = "Upload failed. Try again.";
        if (err instanceof ImageKitAbortError) msg = "Upload was aborted.";
        else if (err instanceof ImageKitInvalidRequestError)
          msg = "Invalid file or request.";
        else if (err instanceof ImageKitUploadNetworkError)
          msg = "Network error during upload.";
        else if (err instanceof ImageKitServerError)
          msg = "ImageKit server error. Try again shortly.";
        else if (err instanceof Error) msg = err.message;
        updateItem(item.localId, { status: "error", errorMsg: msg });
      }
    }

    setIsUploading(false);
    if (anySucceeded) router.refresh();
  };

  // Derived
  const pending = items.filter((i) => i.status !== "done");
  const doneCount = items.filter((i) => i.status === "done").length;
  const canUpload =
    !isUploading &&
    pending.length > 0 &&
    pending.every((i) => i.name.trim() && i.date_taken);

  return (
    <div className="flex flex-col gap-6">
      {/* Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        className={`rounded-xl border border-dashed px-6 py-12 text-center cursor-pointer duration-200 ${
          dragActive ? "border-liol-text/40 bg-liol-text/5" : "border-liol-text/15 hover:border-liol-text/30"
        }`}
      >
        <svg className="mx-auto w-8 h-8 text-liol-subtext" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <p className="mt-3 text-sm text-liol-text">
          Drag photos here, or <span className="underline">browse</span>
        </p>
        <p className="mt-1 text-[0.7rem] text-liol-subtext">
          JPG, PNG, WebP — capture date is read from EXIF when available
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
      </div>

      {/* Staged list */}
      {items.length > 0 && (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div key={item.localId} className="flex flex-col sm:flex-row gap-4 rounded-xl border border-liol-text/10 bg-liol-text/[0.02] p-4">
              {/* Thumbnail */}
              <div className="relative sm:w-40 shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.previewUrl} alt={item.name || "Pending upload"} className="w-full aspect-[4/3] object-cover rounded-lg bg-black/30" />
                {item.status === "done" && (
                  <div className="absolute inset-0 rounded-lg bg-liol-bg/70 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Fields */}
              <div className="flex-1 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Name</label>
                    <input type="text" value={item.name} disabled={item.status === "done"} onChange={(e) => updateItem(item.localId, { name: e.target.value })} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Category</label>
                    <select
                      value={item.category}
                      disabled={item.status === "done" || categoriesLoading}
                      onChange={(e) => updateItem(item.localId, { category: e.target.value as PhotoCategory })}
                      className={`${inputCls} cursor-pointer appearance-none`}
                    >
                      {categoriesLoading ? (
                        <option value="">Loading…</option>
                      ) : categories.length === 0 ? (
                        <option value="">No categories — add one first</option>
                      ) : (
                        categories.map((cat) => (
                          <option key={cat.id} value={cat.slug} className="bg-liol-bg">
                            {cat.label}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date taken</label>
                    <input type="date" value={item.date_taken} disabled={item.status === "done"} onChange={(e) => updateItem(item.localId, { date_taken: e.target.value })} className={`${inputCls} [color-scheme:dark]`} />
                  </div>
                  <div>
                    <label className={labelCls}>Caption</label>
                    <input type="text" value={item.caption} disabled={item.status === "done"} onChange={(e) => updateItem(item.localId, { caption: e.target.value })} className={inputCls} />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>Alt text</label>
                  <input type="text" value={item.alt_text} disabled={item.status === "done"} onChange={(e) => updateItem(item.localId, { alt_text: e.target.value })} className={inputCls} />
                </div>

                {/* Per-item status row */}
                <div className="flex items-center gap-3 min-h-[1.5rem]">
                  {item.status === "uploading" && (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-liol-text/10 overflow-hidden">
                        <div className="h-full bg-liol-text duration-200" style={{ width: `${item.progress}%` }} />
                      </div>
                      <span className="text-[0.7rem] text-liol-subtext tabular-nums">{item.progress}%</span>
                    </div>
                  )}
                  {item.status === "done" && <span className="text-[0.7rem] text-green-400">Uploaded</span>}
                  {item.status === "error" && <span className="text-[0.7rem] text-red-400">{item.errorMsg}</span>}
                  {!item.name.trim() && item.status === "idle" && <span className="text-[0.7rem] text-amber-400/80">Name required</span>}
                  {item.status !== "uploading" && item.status !== "done" && (
                    <button onClick={() => removeItem(item.localId)} className="ml-auto text-[0.7rem] text-liol-subtext hover:text-red-300 duration-200 cursor-pointer">
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Success banner */}
      {items.length > 0 && pending.length === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-green-400/30 bg-green-500/5 px-4 py-3.5">
          <div className="flex items-center gap-2.5">
            <svg className="w-5 h-5 text-green-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <p className="text-sm text-liol-text">
              {doneCount} photo{doneCount === 1 ? "" : "s"} uploaded — live in the gallery now.
            </p>
          </div>
          <div className="sm:ml-auto flex items-center gap-2.5">
            <Link href="/admin/library" className="rounded-lg bg-liol-text text-liol-bg text-sm font-medium px-4 py-2 hover:bg-liol-text/85 duration-200">
              View in library →
            </Link>
            <button onClick={clearCompleted} className="rounded-lg text-sm px-4 py-2 border border-liol-text/15 text-liol-subtext hover:text-liol-text hover:border-liol-text/30 duration-200 cursor-pointer">
              Upload more
            </button>
          </div>
        </div>
      )}

      {/* Action bar */}
      {pending.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleUploadAll}
            disabled={!canUpload}
            className={`rounded-lg text-sm font-medium px-5 py-2.5 duration-200 ${
              canUpload
                ? "bg-liol-text text-liol-bg hover:bg-liol-text/85 cursor-pointer"
                : "bg-liol-text/10 text-liol-subtext cursor-not-allowed"
            }`}
          >
            {isUploading ? "Uploading…" : `Upload ${pending.length} photo${pending.length === 1 ? "" : "s"}`}
          </button>

          {doneCount > 0 && (
            <button onClick={clearCompleted} disabled={isUploading} className="rounded-lg text-sm px-4 py-2.5 border border-liol-text/15 text-liol-subtext hover:text-liol-text hover:border-liol-text/30 duration-200 cursor-pointer disabled:opacity-50">
              Clear {doneCount} completed
            </button>
          )}

          <span className="text-[0.7rem] text-liol-subtext ml-auto">
            {doneCount > 0 && `${doneCount} uploaded · `}
            {pending.length} pending
          </span>
        </div>
      )}
    </div>
  );
}
