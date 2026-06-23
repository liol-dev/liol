"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ============================================================
// CATEGORIES MANAGER — /admin/categories
// Client component. Handles full CRUD for the categories table.
//
// Layout:
//   Mobile  — stacked: list → add form → dev settings
//   Desktop — two-column: list (left, grows) | sidebar (right, fixed)
//             Sidebar contains add form + stats summary + dev settings
//
// Photo counts are fetched directly from Supabase browser client
// (only the category column, so it's a lightweight query).
// After a delete, we re-fetch everything rather than mutating
// local state — the DB reassigns orphaned photos to miscellaneous,
// so fresh counts are needed for ALL categories, not just the removed one.
// ============================================================

interface Category {
  id: string;
  slug: string;
  label: string;
  protected: boolean;
  created_at: string;
  photo_count?: number;
}

function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add form
  const [newLabel, setNewLabel] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Dev settings
  const [devOpen, setDevOpen] = useState(false);

  useEffect(() => { loadCategories(); }, []);

  async function loadCategories() {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const [catRes, photosRes] = await Promise.all([
        fetch("/api/categories"),
        supabase.from("photos").select("category"),
      ]);
      const cats: Category[] = catRes.ok ? await catRes.json() : [];
      const photos = photosRes.data ?? [];
      const counts: Record<string, number> = {};
      for (const p of photos) {
        if (p.category) counts[p.category] = (counts[p.category] ?? 0) + 1;
      }
      setCategories(cats.map((c) => ({ ...c, photo_count: counts[c.slug] ?? 0 })));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ── Add ──────────────────────────────────────────────────
  async function handleAdd() {
    if (!newLabel.trim()) return;
    setAdding(true);
    setAddError(null);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to add category.");
      setCategories((prev) =>
        [...prev, { ...json, photo_count: 0 }].sort((a, b) => a.label.localeCompare(b.label))
      );
      setNewLabel("");
    } catch (e) {
      setAddError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  // ── Edit ─────────────────────────────────────────────────
  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditLabel(cat.label);
    setEditSlug(cat.slug);
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditLabel("");
    setEditSlug("");
    setEditError(null);
  }

  async function handleSave(cat: Category) {
    setSaving(true);
    setEditError(null);
    try {
      const body: Record<string, string> = {};
      if (editLabel.trim() !== cat.label) body.label = editLabel.trim();
      if (devOpen && editSlug.trim() !== cat.slug) body.slug = editSlug.trim();
      if (Object.keys(body).length === 0) { cancelEdit(); return; }

      const res = await fetch(`/api/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save.");
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...json, photo_count: cat.photo_count } : c))
          .sort((a, b) => a.label.localeCompare(b.label))
      );
      cancelEdit();
    } catch (e) {
      setEditError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  // ── Delete ────────────────────────────────────────────────
  // Re-fetches everything after success — the DB reassigns orphaned
  // photos to miscellaneous, so ALL category counts need refreshing,
  // not just the one removed. Optimistic filter would miss that.
  async function handleDelete(cat: Category) {
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/categories/${cat.id}`, { method: "DELETE" });
      if (res.status === 204) {
        setDeletingId(null);
        await loadCategories();
        return;
      }
      const json = await res.json();
      throw new Error(json.error ?? "Failed to delete.");
    } catch (e) {
      setDeleteError((e as Error).message);
    } finally {
      setDeleteLoading(false);
    }
  }

  // ── Derived stats ─────────────────────────────────────────
  const totalPhotos = categories.reduce((sum, c) => sum + (c.photo_count ?? 0), 0);
  const visibleCats = categories.filter((c) => c.slug !== "miscellaneous");

  // ── Render ────────────────────────────────────────────────
  if (loading) return <p className="text-sm text-liol-subtext">Loading categories…</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">

      {/* ── LEFT: Category list ─────────────────────────── */}
      <section>
        <h2 className="text-xs text-liol-subtext mb-3">All categories</h2>
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isEditing = editingId === cat.id;
            const isDeleting = deletingId === cat.id;
            return (
              <li key={cat.id} className="rounded-xl bg-liol-text/5 px-4 py-3 flex flex-col gap-2">
                {isDeleting ? (
                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-liol-text">
                      Delete <span className="font-medium">{cat.label}</span>?{" "}
                      {(cat.photo_count ?? 0) > 0 && (
                        <span className="text-liol-subtext">
                          {cat.photo_count} photo{cat.photo_count === 1 ? "" : "s"} will move to Miscellaneous.
                        </span>
                      )}
                    </p>
                    {deleteError && <p className="text-xs text-red-400">{deleteError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleDelete(cat)} disabled={deleteLoading} className="text-xs px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 duration-200 disabled:opacity-50 cursor-pointer">
                        {deleteLoading ? "Deleting…" : "Yes, delete"}
                      </button>
                      <button onClick={() => { setDeletingId(null); setDeleteError(null); }} disabled={deleteLoading} className="text-xs px-3 py-1.5 rounded-lg bg-liol-text/10 text-liol-subtext hover:text-liol-text duration-200 disabled:opacity-50 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : isEditing ? (
                  <div className="flex flex-col gap-2">
                    <input type="text" value={editLabel} onChange={(e) => setEditLabel(e.target.value)} placeholder="Label" className="bg-transparent border border-liol-text/20 rounded-lg px-3 py-1.5 text-sm text-liol-text placeholder:text-liol-subtext focus:outline-none focus:border-liol-text/50" />
                    {devOpen && (
                      <input type="text" value={editSlug} onChange={(e) => setEditSlug(e.target.value)} placeholder="slug" className="bg-transparent border border-liol-text/20 rounded-lg px-3 py-1.5 text-xs text-liol-subtext placeholder:text-liol-subtext/50 focus:outline-none focus:border-liol-text/50 font-mono" />
                    )}
                    {editError && <p className="text-xs text-red-400">{editError}</p>}
                    <div className="flex gap-2">
                      <button onClick={() => handleSave(cat)} disabled={saving || !editLabel.trim()} className="text-xs px-3 py-1.5 rounded-lg bg-liol-text/10 text-liol-text hover:bg-liol-text/20 duration-200 disabled:opacity-50 cursor-pointer">
                        {saving ? "Saving…" : "Save"}
                      </button>
                      <button onClick={cancelEdit} disabled={saving} className="text-xs px-3 py-1.5 rounded-lg text-liol-subtext hover:text-liol-text duration-200 disabled:opacity-50 cursor-pointer">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="shrink-0 min-w-[2rem] text-center text-xs font-mono bg-liol-text/10 text-liol-subtext rounded-md px-2 py-0.5">
                      {cat.photo_count ?? 0}
                    </span>
                    <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                      <span className="text-sm text-liol-text truncate">{cat.label}</span>
                      <span className="text-xs text-liol-subtext/60 font-mono">{cat.slug}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 text-xs text-liol-subtext/50">
                      <span className="hidden sm:block">{formatDate(cat.created_at)}</span>
                      {cat.protected && <span className="text-liol-subtext/40 select-none">Protected</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => startEdit(cat)} className="text-xs text-liol-subtext hover:text-liol-text duration-200 cursor-pointer">Edit</button>
                      {!cat.protected && (
                        <button onClick={() => { setDeletingId(cat.id); setDeleteError(null); }} className="text-xs text-liol-subtext hover:text-red-400 duration-200 cursor-pointer">Delete</button>
                      )}
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── RIGHT: Sidebar ───────────────────────────────── */}
      <aside className="flex flex-col gap-6">

        {/* Stats */}
        <div className="rounded-xl bg-liol-text/5 p-5 flex flex-col gap-3">
          <h2 className="text-xs text-liol-subtext">Overview</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[0.65rem] text-liol-subtext/60 uppercase tracking-wide">Categories</p>
              <p className="mt-0.5 text-2xl font-light text-liol-text">{visibleCats.length}</p>
            </div>
            <div>
              <p className="text-[0.65rem] text-liol-subtext/60 uppercase tracking-wide">Total photos</p>
              <p className="mt-0.5 text-2xl font-light text-liol-text">{totalPhotos}</p>
            </div>
          </div>
          {visibleCats.length > 0 && totalPhotos > 0 && (
            <div className="flex flex-col gap-1.5 mt-1">
              {visibleCats.map((cat) => {
                const pct = Math.round(((cat.photo_count ?? 0) / totalPhotos) * 100);
                return (
                  <div key={cat.id} className="flex items-center gap-2">
                    <span className="text-[0.65rem] text-liol-subtext/60 w-20 truncate shrink-0">{cat.label}</span>
                    <div className="flex-1 h-1 rounded-full bg-liol-text/10 overflow-hidden">
                      <div className="h-full bg-liol-text/40 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[0.65rem] text-liol-subtext/50 tabular-nums w-6 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add */}
        <div className="rounded-xl bg-liol-text/5 p-5 flex flex-col gap-3">
          <h2 className="text-xs text-liol-subtext">Add category</h2>
          <input
            type="text"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Category name"
            className="bg-transparent border border-liol-text/20 rounded-xl px-4 py-2.5 text-sm text-liol-text placeholder:text-liol-subtext focus:outline-none focus:border-liol-text/50"
          />
          {newLabel.trim() && (
            <p className="text-xs text-liol-subtext font-mono -mt-1">slug: {labelToSlug(newLabel)}</p>
          )}
          {addError && <p className="text-xs text-red-400">{addError}</p>}
          <button
            onClick={handleAdd}
            disabled={adding || !newLabel.trim()}
            className="text-sm px-4 py-2 rounded-xl bg-liol-text/10 text-liol-text hover:bg-liol-text/20 duration-200 disabled:opacity-50 cursor-pointer"
          >
            {adding ? "Adding…" : "Add category"}
          </button>
        </div>

        {/* Dev settings */}
        <div className="rounded-xl bg-liol-text/5 p-5">
          <button
            onClick={() => setDevOpen((v) => !v)}
            className="flex items-center gap-2 text-xs text-liol-subtext hover:text-liol-text duration-200 cursor-pointer w-full"
          >
            <svg className={`w-3 h-3 duration-200 ${devOpen ? "rotate-90" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
            Developer Settings
          </button>
          {devOpen && (
            <p className="mt-2 text-xs text-liol-subtext/70">
              Slug editing is enabled. Changing a slug updates how photos reference
              this category — only do this if you know what you&apos;re doing.
              Edit a category row to modify its slug.
            </p>
          )}
        </div>

      </aside>
    </div>
  );
}
