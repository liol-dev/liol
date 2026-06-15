"use client";

import { useEffect, useState } from "react";

// ============================================================
// ADMIN GATE — TEMPORARY password stub
//
// ⚠ THIS IS NOT SECURITY. ⚠
// A client-side password check is trivially bypassable (the
// password ships in the JS bundle, and the photo data would
// still be readable in network requests). It exists ONLY so we
// can design and demo the dashboard UX before wiring Supabase
// Auth. Replacement plan (next session):
//   1. Supabase Auth email/password sign-in for Corey & Ed
//   2. Middleware-protected /admin routes (server-side check)
//   3. Delete this file
//
// sessionStorage (not localStorage) on purpose — the unlock
// evaporates when the tab closes, mimicking a session.
// ============================================================

const STUB_PASSWORD = "liol2026";
const SESSION_KEY = "liol-admin-unlocked";

export default function AdminGate({
  children,
}: {
  children: React.ReactNode;
}) {
  // null = still checking sessionStorage (avoids a hydration
  // flash of the login form for already-unlocked sessions)
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === "true");
  }, []);

  const handleSubmit = () => {
    if (input === STUB_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  // Checking storage — render nothing for the single frame
  if (unlocked === null) return null;

  if (unlocked) return <>{children}</>;

  // ── Login screen ──────────────────────────────────────────
  return (
    <div className="min-h-screen bg-liol-bg flex flex-col items-center justify-center px-8 font-montserrat">

      <p className="text-liol-text tracking-[0.15em] font-light text-2xl">
        LIOL
      </p>
      <p className="mt-2 text-sm text-liol-subtext">
        Admin access
      </p>

      <div className="mt-10 w-full max-w-xs flex flex-col gap-3">
        <input
          type="password"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Password"
          aria-label="Admin password"
          aria-invalid={error}
          className="w-full rounded-lg bg-liol-text/5 border border-liol-text/15 px-4 py-2.5 text-sm text-liol-text placeholder:text-liol-subtext outline-none focus:border-liol-text/40 duration-200"
        />

        {error && (
          <p role="alert" className="text-xs text-red-400">
            Incorrect password. Try again.
          </p>
        )}

        <button
          onClick={handleSubmit}
          className="w-full rounded-lg bg-liol-text text-liol-bg text-sm font-medium py-2.5 hover:bg-liol-text/85 duration-200 cursor-pointer"
        >
          Enter
        </button>
      </div>

    </div>
  );
}
