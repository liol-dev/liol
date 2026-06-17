// ============================================================
// FOOTER COMPONENT
// Site-wide footer, rendered once in layout.tsx (like NavBar).
//
// Desktop (md+): 3-zone flex row —
//   left:   social icons (Instagram / X / Facebook)
//   center: "Site by MARC MIANGO" credit
//   right:  copyright
// Mobile (<md): credit only — socials + copyright already live
//   in the fullscreen nav menu, no need to repeat them.
// ============================================================

// Social links defined once — same destinations as the mobile
// nav menu. Update both when real URLs come in (or lift into a
// shared constants file if more components need them).
const SOCIAL_LINKS = [
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  // {
  //   label: "X",
  //   href: "#",
  //   icon: (
  //     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
  //       <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  //     </svg>
  //   ),
  // },
  // {
  //   label: "Facebook",
  //   href: "#",
  //   icon: (
  //     <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" stroke="none">
  //       <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  //     </svg>
  //   ),
  // },
];

export default function Footer() {
  return (
    // Upward drop shadow — mirrors the navbar's drop-shadow-md but
    // with a negative Y offset so it casts UP onto the page content
    // above. Arbitrary value because Tailwind's preset drop-shadows
    // only cast downward.
    <footer className="bg-liol-bg text-liol-text py-6 drop-shadow-[0_-4px_4px_rgba(0,0,0,0.3)]">
      <div className="mx-auto px-8 md:px-12">

        {/* ── 3-zone layout ─────────────────────────────────────
            grid-cols-3 on desktop keeps the credit PERFECTLY
            centered regardless of how wide the side zones are
            (flex justify-between would let uneven sides nudge it).
            Mobile collapses to a single centered zone. */}
        <div className="grid grid-cols-1 md:grid-cols-3 items-center">

          {/* Left — socials (desktop only) */}
          <div className="hidden md:flex items-center gap-8">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="text-liol-text hover:text-liol-subtext duration-300"
              >
                {social.icon}
              </a>
            ))}
          </div>

          {/* Center — site credit (always visible) */}
          <p className="text-xs text-liol-subtext font-light tracking-[10%] text-center">
            Site by{" "}
            <a
              href="https://marcmiango.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-liol-text duration-300"
            >
              MARC MIANGO
            </a>
          </p>

          {/* Right — copyright (desktop only; lives in the
              mobile nav menu already) */}
          <p className="hidden md:block text-xs text-liol-subtext font-light tracking-[10%] text-right">
            &copy;2026 &mdash; Life In Our Lens
          </p>

        </div>
      </div>
    </footer>
  );
}
