"use client";

import { useEffect, useState } from "react";

// ============================================================
// SCROLL-TO-TOP BUTTON COMPONENT
// Sticky arrow pinned to the bottom-right corner that smooth-
// scrolls the page back to the top. Site-wide reusable.
//
// Fades in only after the user has scrolled a bit (400px) —
// a back-to-top button at the top of the page is just clutter.
// z-40 keeps it above page content but below fullscreen
// overlays (mobile menu / lightbox at z-50).
// ============================================================

const SHOW_AFTER_PX = 400;

export default function ScrollTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SHOW_AFTER_PX);
    onScroll(); // set correct initial state on mount
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
      className={`fixed bottom-12 right-6 z-40 p-3 border border-liol-text bg-liol-bg/80 backdrop-blur-sm text-liol-text hover:bg-liol-text hover:text-liol-bg duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Up arrow — rem-sized so it scales at the 3xl breakpoint */}
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="19" x2="12" y2="5" />
        <polyline points="5 12 12 5 19 12" />
      </svg>
    </button>
  );
}
