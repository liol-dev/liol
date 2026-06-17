"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";

// ============================================================
// ADMIN SIDEBAR / MOBILE NAV
// Desktop (md+): slim sticky left rail — wordmark, the three
//   destinations, Sign out pinned to the bottom.
// Mobile (<md): sticky top bar (LIOL + hamburger) opening the
//   site's established fullscreen overlay pattern
//   (fixed inset-0 z-50 bg-liol-bg/95 — same as public NavBar's
//   mobile menu) with the nav links + Sign out.
// usePathname drives the active highlight in both trees.
// Sign out calls supabase.auth.signOut() and redirects to /admin/login.
// ============================================================

const NAV_ITEMS = [
  { href: "/admin", label: "Overview", icon: OverviewIcon },
  { href: "/admin/library", label: "Library", icon: LibraryIcon },
  { href: "/admin/upload", label: "Upload", icon: UploadIcon },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  // Exact match for /admin (otherwise it'd stay lit on every
  // child route); prefix match for the nested sections.
  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  // Close the mobile menu on navigation + lock body scroll
  // while it's open (same contract as the modal/lightbox).
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <>
      {/* ════════════════════════════════════════════════════
          MOBILE — sticky top bar + fullscreen overlay menu
         ════════════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-40 bg-liol-bg border-b border-liol-text/10 flex items-center justify-between px-4 max-xs:px-3 py-3">
        <Link href="/" className="text-liol-text tracking-[0.15em] font-light">
          LIOL
        </Link>

        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open admin menu"
          aria-expanded={menuOpen}
          className="text-liol-text p-1 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </header>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-liol-bg/95 flex flex-col px-8 py-6">
          {/* Overlay header — wordmark + close, mirroring the bar */}
          <div className="flex items-center justify-between">
            <span className="text-liol-text tracking-[0.15em] font-light">
              LIOL
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close admin menu"
              className="text-liol-text p-1 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>

          {/* Nav links — large touch targets, centered block */}
          <nav
            className="flex-1 flex flex-col items-start justify-center gap-7"
            aria-label="Admin"
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={`flex items-center gap-3 text-2xl font-light tracking-wide duration-200 ${
                  isActive(href)
                    ? "text-liol-text"
                    : "text-liol-subtext hover:text-liol-text"
                }`}
              >
                <Icon />
                {label}
              </Link>
            ))}
          </nav>

          {/* Sign out — bottom of the overlay */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 text-base text-liol-subtext hover:text-liol-text duration-200 cursor-pointer"
          >
            <SignOutIcon />
            Sign out
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          DESKTOP — sticky left rail
         ════════════════════════════════════════════════════ */}
      <aside className="hidden md:flex w-44 shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-liol-text/10 flex-col px-3 py-6">

        {/* Wordmark — links back to the public site */}
        <Link
          href="/"
          className="px-3 pb-8 text-liol-text tracking-[0.15em] font-light text-lg"
        >
          LIOL
        </Link>

        {/* Primary navigation */}
        <nav className="flex flex-col gap-1" aria-label="Admin">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm duration-200 ${
                isActive(href)
                  ? "bg-liol-text/10 text-liol-text"
                  : "text-liol-subtext hover:text-liol-text"
              }`}
            >
              <Icon />
              {label}
            </Link>
          ))}
        </nav>

        {/* Sign out — pinned to the bottom of the rail */}
        <button
          onClick={handleSignOut}
          className="mt-auto flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-liol-subtext hover:text-liol-text duration-200 cursor-pointer"
        >
          <SignOutIcon />
          Sign out
        </button>

      </aside>
    </>
  );
}

// ── Inline icons ────────────────────────────────────────────
// Tiny strokes matching the site's hand-rolled SVG convention
// (see GalleryFeed's corner arrow / close button).

function OverviewIcon() {
  return (
    <svg className="w-4 h-4 md:w-4 md:h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function LibraryIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function SignOutIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}
