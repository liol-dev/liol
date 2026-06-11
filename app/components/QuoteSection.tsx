import CtaButton from "./CtaButton";
import ScrollRevealElement from "./motion/ScrollRevealElement";

// ============================================================
// QUOTE SECTION COMPONENT
// Full-viewport statement section: large Baskervville quote
// over a background photo dimmed by a dark overlay, with the
// attribution in Montserrat and the shared CTA button below.
//
// Background is a placeholder Unsplash image for now — will be
// swapped for one of Corey & Ed's actual photos in production.
// ============================================================

export default function QuoteSection() {
  return (
    // relative + overflow-hidden so the absolutely-positioned
    // background layers stay contained to this section.
    <section className="relative overflow-hidden flex flex-col items-center justify-center text-center px-8 pt-12 min-h-[calc(100vh-56px)] 3xl:min-h-[calc(100vh-64px)]">

      {/* ── Background photo ──────────────────────────────────
          Absolutely positioned behind the content (-z-10 via
          stacking order: bg layers first, content after). */}
      <img
        src="https://images.unsplash.com/photo-1433446787703-42d5bf446876?auto=format&fit=crop&w=1920&q=80"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />

      {/* ── Dark overlay ──────────────────────────────────────
          bg-liol-bg at 90% — photo reads as texture, quote stays
          the clear focal point. */}
      <div className="absolute inset-0 bg-liol-bg/90" />

      {/* ── Content ───────────────────────────────────────────
          relative lifts content above the absolute bg layers. */}
      <div className="relative flex flex-col items-center">

        {/* Quote — Baskervville, large and editorial.
            Arbitrary sizes: a touch under text-4xl/6xl (36/60px)
            with a slightly wider measure than max-w-5xl.
            max-xs: shrinks on narrow phones (<400px, e.g. Pixel 3)
            so the quote doesn't overwhelm small viewports. */}
        <ScrollRevealElement direction="up" duration={0.7}>
          <blockquote className="font-baskervville font-light max-xs:text-[2rem] text-[2.5rem] md:text-[3.4rem] leading-snug md:leading-snug max-w-7xl">
            &ldquo;We shoot the people, places, and moments that actually
            mean something with no forced poses, no cookie-cutter
            backdrops. Just real life captured sharp.&rdquo;
          </blockquote>
        </ScrollRevealElement>

        {/* Attribution — back to Montserrat, subdued */}
        <ScrollRevealElement direction="up" distance={24} delay={0.2}>
          <p className="mt-12 font-montserrat text-base md:text-lg text-liol-subtext tracking-[10%]">
            &mdash; Corey &amp; Ed
          </p>
        </ScrollRevealElement>

        {/* Shared CTA — same button as the hero */}
        <ScrollRevealElement direction="up" distance={24} delay={0.35}>
          <CtaButton href="/gallery" className="mt-14">
            See Our Work
          </CtaButton>
        </ScrollRevealElement>

      </div>
    </section>
  );
}
