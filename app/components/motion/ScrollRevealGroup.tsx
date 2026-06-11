"use client";

import React, { ReactNode } from "react";
import { motion } from "motion/react";

// ============================================================
// SCROLL REVEAL GROUP — ported + redesigned for layout safety.
//
// ⚠ The old version injected an inner wrapper that forced
//   display:flex + inherited flex properties. That breaks any
//   GRID parent (like the /about photographer columns) and adds
//   a phantom element between parent and children.
//
// New contract: THIS component IS the layout container. Put
// your grid/flex classes on `className` — they're applied to
// the motion parent directly. Each child gets one motion
// wrapper (which becomes the grid/flex item), staggered via
// variant propagation. Use `itemClassName` if the wrappers
// themselves need styling.
//
//   <ScrollRevealGroup className="grid md:grid-cols-2 gap-8">
//     <CardA /><CardB />
//   </ScrollRevealGroup>
// ============================================================

type Direction = "up" | "down" | "left" | "right" | "opacity";

interface ScrollRevealGroupProps {
  children: ReactNode;
  direction?: Direction;
  distance?: number;
  duration?: number;
  baseDelay?: number;
  staggerDelay?: number;
  margin?: string;
  // Fraction of the group that must be visible to trigger.
  // ⚠ Same hazard as ScrollRevealElement: groups taller than
  //   the viewport can never reach high values — lower this
  //   (or use 0) for tall stacked content like mobile layouts.
  amount?: number;
  once?: boolean;
  className?: string;
  itemClassName?: string;
  useWillChange?: boolean;
  useOpacity?: boolean;
}

const ScrollRevealGroup = ({
  children,
  direction = "up",
  distance = 30,
  duration = 0.5,
  baseDelay = 0,
  staggerDelay = 0.12,
  margin = "0px 0px -80px 0px",
  amount = 0.2,
  once = true, // default true now — replay-on-scroll costs more than it adds
  className = "",
  itemClassName = "",
  useWillChange = true,
  useOpacity = true,
}: ScrollRevealGroupProps) => {
  const itemVariants = {
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
      transition: { duration, ease: "easeOut" as const },
    },
  };

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: margin as never }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: baseDelay,
          },
        },
      }}
    >
      {React.Children.map(children, (child) => (
        <motion.div
          variants={itemVariants}
          className={itemClassName}
          style={useWillChange ? { willChange: "transform, opacity" } : undefined}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

export default ScrollRevealGroup;
