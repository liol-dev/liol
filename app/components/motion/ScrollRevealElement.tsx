"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

// ============================================================
// SCROLL REVEAL ELEMENT — ported + modernized.
// Old version: manual useRef + useInView + animate plumbing.
// New version: motion's built-in whileInView — fewer hooks,
// no @ts-ignore, identical behavior, and IntersectionObserver
// under the hood (no scroll listeners = cheap).
//
// direction="opacity" → fade only, NO transform. Use this for
// anything containing position: sticky descendants — an
// animated transform on an ancestor turns it into a containing
// block and silently kills sticky (e.g. GalleryFeed's sidebar).
// ============================================================

type Direction = "up" | "down" | "left" | "right" | "opacity";

interface ScrollRevealElementProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;   // px offset for directional reveals
  duration?: number;
  delay?: number;
  margin?: string;     // viewport margin — negative bottom = trigger late
  // Fraction of the element that must be visible to trigger.
  // ⚠ For elements TALLER than the viewport, high values can
  //   never be reached (0.3 of a 3000px feed won't fit on
  //   screen) and the reveal never fires. Use 0 for tall content.
  amount?: number;
  once?: boolean;
  className?: string;
  useWillChange?: boolean;
  useOpacity?: boolean;
}

const ScrollRevealElement = ({
  children,
  direction = "up",
  distance = 40,
  duration = 0.5,
  delay = 0,
  margin = "0px 0px -100px 0px",
  amount = 0.3,
  once = true,
  className = "",
  useWillChange = true,
  useOpacity = true,
}: ScrollRevealElementProps) => {
  const variants = {
    hidden: {
      ...(useOpacity && { opacity: 0 }),
      ...(direction === "up" || direction === "down"
        ? { y: direction === "up" ? distance : -distance }
        : {}),
      ...(direction === "left" || direction === "right"
        ? { x: direction === "left" ? distance : -distance }
        : {}),
    },
    visible: {
      ...(useOpacity && { opacity: 1 }),
      y: 0,
      x: 0,
      transition: { duration, delay, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      // margin cast: motion types this as a template-literal
      // MarginType; a plain string prop is fine at runtime.
      viewport={{ once, amount, margin: margin as never }}
      variants={variants}
      style={useWillChange ? { willChange: "transform, opacity" } : undefined}
    >
      {children}
    </motion.div>
  );
};

export default ScrollRevealElement;
