"use client";

import { useState } from "react";

// ============================================================
// NAVBAR COMPONENT
// Responsive navigation for LIOL.
// - Desktop (md+): horizontal links on the right
// - Mobile (<md):  hamburger → fullscreen overlay menu
// ============================================================

// Nav links defined once, shared between desktop + mobile menu
const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Gallery", href: "/gallery" },
  { label: "About Us", href: "/about" },
];

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Shared style for desktop nav links
  const desktopLinkStyle =
    "text-sm text-liol-subtext hover:text-liol-text duration-300 tracking-[10%]";

  return (
    <>
      {/* ── Main Navbar ───────────────────────────────────────── */}
      <nav className="bg-liol-bg text-liol-text py-4 drop-shadow-md">
        <div className="mx-auto px-8 md:px-12">
          <div className="flex justify-between items-center">

            {/* Logo / Brand */}
            <div className="text-xl tracking-[10%] font-light">
              <a href="/">Life In Our Lens</a>
            </div>

            {/* Desktop Links — hidden on mobile */}
            <div className="hidden md:flex space-x-8">
              {NAV_LINKS.map((link) => (
                <a key={link.href} href={link.href} className={desktopLinkStyle}>
                  {link.label}
                </a>
              ))}
            </div>

            {/* Hamburger Button — visible on mobile only */}
            <button
              className="md:hidden text-liol-text"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              {/* Simple 3-line hamburger icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

          </div>
        </div>
      </nav>

      {/* ── Mobile Fullscreen Menu Overlay ────────────────────── */}
      {/* 
        Conditionally rendered. bg-liol-bg/90 = #141414 at 90% opacity.
        Covers full viewport, sits above everything via z-50.
        Pattern: any fullscreen overlay on this site should use these
        same base classes: fixed inset-0 z-50 bg-liol-bg/90
      */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-liol-bg/99 flex flex-col px-8 py-4">

          {/* Close Button */}
          <div className="flex justify-end">
            <button
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="text-liol-text"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>
          </div>
          {/* Centered content container */}
          <div className="flex flex-col items-center h-full">
            {/* Brand Name */}
            <div className="mt-24 text-center font-light text-3xl tracking-[10%] text-liol-text">
              Life In Our Lens
            </div>

            {/* Nav Links — large, vertically stacked */}
            <nav className="flex flex-col justify-center items-center flex-1 gap-16 pb-10">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-4xl font-light text-liol-subtext hover:text-liol-text duration-300 tracking-[10%]"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Footer — social icons + copyright */}
            <div className="pb-4">
              {/* Social Icons */}
              <div className="flex gap-10 mb-12 justify-center items-center">

                {/* Instagram */}
                <a href="#" aria-label="Instagram" className="text-liol-text hover:text-liol-subtext duration-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
                  </svg>
                </a>

                {/* X / Twitter */}
                <a href="#" aria-label="X" className="text-liol-text hover:text-liol-subtext duration-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>

                {/* Facebook */}
                <a href="#" aria-label="Facebook" className="text-liol-text hover:text-liol-subtext duration-300">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                  </svg>
                </a>

              </div>

              {/* Copyright */}
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
