// ============================================================
// PAGE HEADER COMPONENT
// Shared top-of-page banner used across inner pages (Gallery,
// About Us, etc.): big page title + optional subtext, full
// width while respecting the site's standard padding.
// Centered on mobile, left-aligned on desktop, per design.
// Title mask-reveals upward on mount; subtitle fades up after.
// ============================================================

import MaskReveal from "./motion/MaskReveal";
import ScrollRevealElement from "./motion/ScrollRevealElement";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-8 md:px-12 pt-16 md:pt-20 pb-10 md:pb-14 text-center md:text-left">

      {/* Page title — large, light, same tracking convention as
          the rest of the site's display text. Rises out of a
          bottom-edge mask for the editorial entrance. */}
      <MaskReveal orientation="vertical" from="bottom" duration={0.9}>
        <h1 className="text-5xl md:text-8xl font-light tracking-[10%]">
          {title}
        </h1>
      </MaskReveal>

      {/* Optional subtext — trails the title slightly */}
      {subtitle && (
        <ScrollRevealElement direction="up" distance={20} delay={0.35}>
          <p className="mt-6 text-base md:text-lg text-liol-subtext font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
            {subtitle}
          </p>
        </ScrollRevealElement>
      )}

    </header>
  );
}
