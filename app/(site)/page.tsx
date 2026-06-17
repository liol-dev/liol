import PortfolioGrid from "@/app/components/PortfolioGrid";
import QuoteSection from "@/app/components/QuoteSection";
import CtaButton from "@/app/components/CtaButton";
import MaskReveal from "@/app/components/motion/MaskReveal";
import ScrollRevealElement from "@/app/components/motion/ScrollRevealElement";
import { createClient } from "@/app/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.from("photos").select("src");
  const pool = data ? data.map((r) => r.src as string) : [];
  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat">

      {/* ── Hero / Landing Section ───────────────────────────────
          Full viewport height minus navbar. Content centered.
          On mobile: tighter text, button fills less width.
          On desktop: larger heading, wider button.
      ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-8 h-[calc(100vh-56px)] 3xl:h-[calc(100vh-64px)]">

        {/* Heading — "find" rendered in Baskervville italic as accent.
            Rises out of a bottom mask on mount. */}
        <MaskReveal orientation="vertical" from="bottom" duration={0.9}>
          <h1 className="text-4xl md:text-6xl font-light tracking-[10%] leading-tight max-w-4xl">
            We don&apos;t stage moments. We{" "}
            <span className="italic">find</span>{" "}
            them
          </h1>
        </MaskReveal>

        {/* Subtext — trails the heading */}
        <ScrollRevealElement direction="up" distance={20} delay={0.4}>
          <p className="mt-6 text-sm md:text-base text-liol-subtext max-w-md leading-relaxed">
            Life in Our Lens — portraits, couples, and engagements shot with intention
          </p>
        </ScrollRevealElement>

        {/* CTA Button — shared site-wide style, last in the stagger */}
        <ScrollRevealElement direction="up" distance={20} delay={0.6}>
          <CtaButton href="/gallery" className="mt-14">
            See Our Work
          </CtaButton>
        </ScrollRevealElement>

        {/* Scroll Indicator — opacity-only (the wrapper carries the
            absolute positioning; a transform here would re-anchor it) */}
        <ScrollRevealElement
          direction="opacity"
          delay={1.1}
          duration={0.8}
          useWillChange={false}
          className="absolute bottom-8"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs tracking-[0.3em] text-liol-subtext">SCROLL</span>
            <div className="w-px h-10 bg-liol-subtext" />
          </div>
        </ScrollRevealElement>

      </section>

      {/* ── Portfolio Grid Section ───────────────────────────────
          Masonry mosaic of recent work. Full-bleed on mobile,
          padded multi-column grid on desktop.
      ──────────────────────────────────────────────────────── */}
      <PortfolioGrid pool={pool} />

      {/* ── Quote Section ─────────────────────────────────────
          Full-viewport Baskervville statement over a dimmed
          photo, with attribution + shared CTA.
      ──────────────────────────────────────────────────────── */}
      <QuoteSection />
    </main>
  );
}
