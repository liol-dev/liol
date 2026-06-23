"use client";

import { useEffect, useState } from "react";

// ============================================================
// SOCIAL LINKS MANAGER — /admin/social
// Full CRUD for the social_links table.
// Each platform row shows a dropdown (locked to that platform),
// a URL input, and Save / Clear actions.
// Reads from GET /api/social-links on mount; writes via PUT
// (save) and DELETE (clear) — both return the updated row so
// optimistic state stays in sync without a refetch.
// ============================================================

type Platform = "instagram" | "facebook" | "twitter";

interface SocialLink {
  id: string;
  platform: Platform;
  url: string;
  updated_at: string;
}

const PLATFORMS: { value: Platform; label: string; icon: React.ReactNode }[] = [
  {
    value: "instagram",
    label: "Instagram",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "facebook",
    label: "Facebook",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    value: "twitter",
    label: "X (Twitter)",
    icon: (
      <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

const inputCls =
  "flex-1 rounded-lg bg-liol-text/5 border border-liol-text/15 px-3.5 py-2 text-sm text-liol-text outline-none focus:border-liol-text/40 duration-200 placeholder:text-liol-subtext/50";

export default function SocialLinksManager() {
  const [links, setLinks] = useState<Record<Platform, string>>({
    instagram: "",
    facebook: "",
    twitter: "",
  });
  const [drafts, setDrafts] = useState<Record<Platform, string>>({
    instagram: "",
    facebook: "",
    twitter: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Per-platform saving / clearing state
  const [saving, setSaving] = useState<Partial<Record<Platform, boolean>>>({});
  const [clearing, setClearing] = useState<Partial<Record<Platform, boolean>>>({});
  const [rowError, setRowError] = useState<Partial<Record<Platform, string>>>({});

  useEffect(() => {
    fetch("/api/social-links")
      .then((r) => r.json())
      .then((data: SocialLink[]) => {
        const urls = { instagram: "", facebook: "", twitter: "" };
        for (const row of data) urls[row.platform] = row.url;
        setLinks(urls);
        setDrafts({ ...urls });
      })
      .catch(() => setError("Failed to load social links."))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(platform: Platform) {
    setSaving((p) => ({ ...p, [platform]: true }));
    setRowError((p) => ({ ...p, [platform]: undefined }));
    try {
      const res = await fetch("/api/social-links", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform, url: drafts[platform] }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to save.");
      setLinks((p) => ({ ...p, [platform]: json.url }));
      setDrafts((p) => ({ ...p, [platform]: json.url }));
    } catch (e) {
      setRowError((p) => ({ ...p, [platform]: (e as Error).message }));
    } finally {
      setSaving((p) => ({ ...p, [platform]: false }));
    }
  }

  async function handleClear(platform: Platform) {
    setClearing((p) => ({ ...p, [platform]: true }));
    setRowError((p) => ({ ...p, [platform]: undefined }));
    try {
      const res = await fetch("/api/social-links", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed to clear.");
      setLinks((p) => ({ ...p, [platform]: "" }));
      setDrafts((p) => ({ ...p, [platform]: "" }));
    } catch (e) {
      setRowError((p) => ({ ...p, [platform]: (e as Error).message }));
    } finally {
      setClearing((p) => ({ ...p, [platform]: false }));
    }
  }

  if (loading) return <p className="text-sm text-liol-subtext">Loading…</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8 items-start">

      {/* ── LEFT: Platform rows ───────────────────────────── */}
      <div className="flex flex-col gap-3">
        {PLATFORMS.map(({ value, label, icon }) => {
          const draft = drafts[value];
          const saved = links[value];
          const isDirty = draft !== saved;
          const isSaving = saving[value] ?? false;
          const isClearing = clearing[value] ?? false;
          const busy = isSaving || isClearing;
          const hasLink = !!saved;

          return (
            <div key={value} className="rounded-xl bg-liol-text/5 px-4 py-4 flex flex-col gap-3">
              {/* Row: platform badge + input */}
              <div className="flex items-center gap-3">
                {/* Platform badge — dropdown-style label, fixed */}
                <div className="flex items-center gap-2 shrink-0 rounded-lg bg-liol-text/10 border border-liol-text/10 px-3 py-2 min-w-[130px]">
                  {icon}
                  <span className="text-sm text-liol-text font-light">{label}</span>
                </div>

                {/* URL input */}
                <input
                  type="url"
                  value={draft}
                  disabled={busy}
                  onChange={(e) =>
                    setDrafts((p) => ({ ...p, [value]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && isDirty && !busy) handleSave(value);
                  }}
                  placeholder={`https://${value === "twitter" ? "x" : value}.com/youraccount`}
                  className={inputCls}
                />
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 pl-[142px]">
                <button
                  onClick={() => handleSave(value)}
                  disabled={!isDirty || busy}
                  className={`text-xs px-3 py-1.5 rounded-lg duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    isDirty && !busy
                      ? "bg-liol-text text-liol-bg hover:bg-liol-text/85"
                      : "bg-liol-text/10 text-liol-subtext"
                  }`}
                >
                  {isSaving ? "Saving…" : "Save"}
                </button>

                {hasLink && (
                  <button
                    onClick={() => handleClear(value)}
                    disabled={busy}
                    className="text-xs px-3 py-1.5 rounded-lg text-liol-subtext hover:text-red-400 duration-200 cursor-pointer disabled:opacity-40"
                  >
                    {isClearing ? "Clearing…" : "Clear"}
                  </button>
                )}

                {hasLink && !isDirty && (
                  <a
                    href={saved}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-liol-subtext/60 hover:text-liol-subtext duration-200 ml-1"
                  >
                    ↗ Live
                  </a>
                )}

                {rowError[value] && (
                  <p className="text-xs text-red-400 ml-1">{rowError[value]}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── RIGHT: Info sidebar ───────────────────────────── */}
      <aside className="flex flex-col gap-4">
        <div className="rounded-xl bg-liol-text/5 p-5 flex flex-col gap-3">
          <h2 className="text-xs text-liol-subtext">Status</h2>
          <div className="flex flex-col gap-2">
            {PLATFORMS.map(({ value, label, icon }) => (
              <div key={value} className="flex items-center gap-2.5">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${links[value] ? "bg-green-400" : "bg-liol-text/20"}`} />
                <span className="flex items-center gap-1.5 text-xs text-liol-subtext">
                  {icon}
                  {label}
                </span>
                <span className="ml-auto text-[0.65rem] text-liol-subtext/50">
                  {links[value] ? "Live" : "Not set"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-liol-text/5 p-5">
          <h2 className="text-xs text-liol-subtext mb-2">How it works</h2>
          <p className="text-xs text-liol-subtext/70 leading-relaxed">
            Links saved here appear on the footer (desktop) and mobile nav menu.
            Platforms with no URL are hidden from visitors automatically.
            Paste the full profile URL including <span className="font-mono">https://</span>.
          </p>
        </div>
      </aside>
    </div>
  );
}
