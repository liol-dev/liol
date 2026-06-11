"use client";

import { ReactNode } from "react";
import { motion } from "motion/react";

// ============================================================
// MASK REVEAL — ported from Marc's motion library, modernized:
// - motion/react imports (motion v12, not framer-motion)
// - optional inView mode: reveal when scrolled into viewport
//   instead of on mount (mount is still the default — ideal
//   for above-the-fold hero/header content)
// Reveals children by expanding a clip-path from an edge or
// the center line. Clip-path animates on the compositor, so
// this stays cheap even on large text blocks.
// ============================================================

// Named easings + cubic-bezier tuples (matches motion's Easing)
type EaseProp =
  | [number, number, number, number]
  | "linear" | "easeIn" | "easeOut" | "easeInOut"
  | "circIn" | "circOut" | "circInOut"
  | "backIn" | "backOut" | "backInOut" | "anticipate";

type Props = {
  children: ReactNode;
  delay?: number;
  orientation?: "horizontal" | "vertical";
  duration?: number;
  ease?: EaseProp;
  from?: "center" | "top" | "bottom" | "left" | "right";
  inView?: boolean; // true → trigger on scroll into view
  once?: boolean;   // inView mode: animate only the first time
  className?: string;
};

const FULL_REVEAL = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";

const MaskReveal = ({
  children,
  delay = 0,
  orientation = "horizontal",
  duration = 1,
  ease = [0.87, 0, 0.13, 1],
  from = "center",
  inView = false,
  once = true,
  className,
}: Props) => {
  // Initial (fully-clipped) polygon based on orientation + origin
  const getInitialClipPath = () => {
    if (orientation === "horizontal") {
      switch (from) {
        case "left":
          return "polygon(0% 0%, 0% 0%, 0% 100%, 0% 100%)";
        case "right":
          return "polygon(100% 0%, 100% 0%, 100% 100%, 100% 100%)";
        case "center":
        default:
          return "polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)";
      }
    }
    // Vertical
    switch (from) {
      case "top":
        return "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)";
      case "bottom":
        return "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)";
      case "center":
      default:
        return "polygon(0% 50%, 100% 50%, 100% 50%, 0% 50%)";
    }
  };

  const transition = { duration, ease, delay };
  const initial = { clipPath: getInitialClipPath() };
  const revealed = { clipPath: FULL_REVEAL };

  // inView mode → whileInView handles the trigger; otherwise
  // animate fires on mount (original behavior).
  return inView ? (
    <motion.div
      className={className}
      initial={initial}
      whileInView={revealed}
      viewport={{ once, amount: 0.3 }}
      transition={transition}
    >
      {children}
    </motion.div>
  ) : (
    <motion.div
      className={className}
      initial={initial}
      animate={revealed}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default MaskReveal;
