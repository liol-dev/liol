"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SocialLinksMap } from "@/app/lib/social-links.server";

// ============================================================
// NAVBAR COMPONENT
// socialLinks prop passed from site layout (fetched server-side
// once). Only platforms with a configured URL render in the
// mobile menu's social icon row.
// ============================================================

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
];

const SOCIAL_ICONS: Record<string, { label: string; icon: React.ReactNode }> = {
  instagram: {
    label: "Instagram",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  twitter: {
    label: "X",
    icon: (
      <svg className="w-12 h-12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
};

const PLATFORM_ORDER = ["instagram", "facebook", "twitter"];

const NavBar = ({ socialLinks = {} }: { socialLinks?: SocialLinksMap }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const desktopLinkStyle = "text-sm duration-300 tracking-[10%]";
  const desktopActive = "text-liol-text";
  const desktopInactive = "text-liol-subtext hover:text-liol-text";

  // Only render platforms that have a URL configured
  const activeSocials = PLATFORM_ORDER.filter(
    (p) => socialLinks[p as keyof SocialLinksMap]
  );

  return (
    <>
      <nav className="sticky top-0 z-40 bg-liol-bg text-liol-text py-4 drop-shadow-md">
        <div className="mx-auto px-8 md:px-12">
          <div className="flex justify-between items-center">

            <div className="text-xl tracking-[10%] font-light">
              <Link href="/">Life In Our Lens</Link>
            </div>

            <div className="hidden md:flex space-x-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`${desktopLinkStyle} ${
                    isActive(link.href) ? desktopActive : desktopInactive
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <button
              className="md:hidden text-liol-text"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-liol-bg/99 flex flex-col px-8 py-4">

          <div className="flex justify-end">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-liol-text"
            >
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-center h-full">
            <div className="mt-24 text-center font-light text-3xl tracking-[10%] text-liol-text">
              Life In Our Lens
            </div>

            <nav className="flex flex-col justify-center items-center flex-1 gap-16 pb-10">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={`text-4xl font-light duration-300 tracking-[10%] ${
                    isActive(link.href) ? "text-liol-text" : "text-liol-subtext hover:text-liol-text"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="pb-4">
              {/* Social icons — only renders if at least one is configured */}
              {activeSocials.length > 0 && (
                <div className="flex gap-10 mb-12 justify-center items-center">
                  {activeSocials.map((platform) => {
                    const { label, icon } = SOCIAL_ICONS[platform];
                    return (
                      <a
                        key={platform}
                        href={socialLinks[platform as keyof SocialLinksMap]}
                        aria-label={label}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-liol-text hover:text-liol-subtext duration-300"
                      >
                        {icon}
                      </a>
                    );
                  })}
                </div>
              )}

              <p className="text-sm text-liol-subtext font-light tracking-widest text-center pb-12">
                ©2026 — Life In Our Lens
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
