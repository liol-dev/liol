import PageHeader from "../components/PageHeader";
import ScrollTopButton from "../components/ScrollTopButton";
import ScrollRevealElement from "../components/motion/ScrollRevealElement";
import ScrollRevealGroup from "../components/motion/ScrollRevealGroup";
import PhotographerCard from "./PhotographerCard";

// ============================================================
// ABOUT US PAGE — "The Lens Behind the Lens"
// PageHeader (shared) + Our Story copy + the two photographer
// profiles in a divided two-column grid (stacked on mobile,
// where each card's photo runs full-bleed).
// ============================================================

export default function AboutPage() {
  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat pb-24">

      <PageHeader title="The Lens Behind the Lens" />

      {/* ── Our Story ──────────────────────────────────────────
          Em-dash section label + single roomy paragraph.
          Mobile: centered, with a closing em-dash on the label
          ("— Our Story —") to balance the symmetry. Desktop:
          left-aligned, leading dash only — matching PageHeader's
          center-mobile / left-desktop convention.
      ──────────────────────────────────────────────────────── */}
      <section className="px-8 md:px-12 mt-4 md:mt-10 text-center md:text-left">
        <ScrollRevealElement direction="up" distance={24} duration={0.6}>
          <h2 className="text-2xl md:text-3xl font-light tracking-[10%]">
            &mdash; Our Story<span className="md:hidden"> &mdash;</span>
          </h2>
        </ScrollRevealElement>

        <ScrollRevealElement direction="up" distance={24} duration={0.6} delay={0.15}>
          <p className="mt-8 md:mt-12 max-w-5xl mx-auto md:mx-0 text-base md:text-lg font-light leading-loose md:leading-[2.4]">
            Life in Our Lens started with a simple idea, that the best
            photographs aren&apos;t planned, they&apos;re caught. Corey and Ed
            built this brand around that belief: show up, stay sharp, and let
            the moment do the work. What started as a shared passion turned
            into a full creative partnership built on complementary
            perspectives and one relentless standard for quality.
          </p>
        </ScrollRevealElement>
      </section>

      {/* ── The Photographers ──────────────────────────────────
          Two profile columns with a thin vertical divider on
          desktop (divide-x). Mobile: stacked, no side padding so
          each card's photo can bleed edge-to-edge — the cards
          pad their own text content instead.
          Per-column gutters (md:pr-16 / md:pl-16) keep breathing
          room around the center divider line.
      ──────────────────────────────────────────────────────── */}
      <section className="mt-20 md:mt-28 md:px-12">
        {/* ScrollRevealGroup IS the grid now (new contract) —
            layout classes live on the group, each card gets a
            staggered wrapper that doubles as the grid item.
            divide-x draws between the wrappers; the cards' own
            pr/pl gutters keep space around the line. */}
        <ScrollRevealGroup
          className="grid md:grid-cols-2 gap-y-20 md:gap-y-0 md:divide-x md:divide-liol-subtext/40"
          staggerDelay={0.18}
          duration={0.6}
          amount={0.1}
        >
          <PhotographerCard
            name="Corey"
            initial="C"
            bio="Corey reads a room the way most people read a script instinctively. His approach is fluid, unhurried, and built around getting people to forget a camera is even there. The result is imagery that feels lived-in and real."
            className="md:pr-16"
          />

          <PhotographerCard
            name="Ed"
            initial="E"
            bio="Ed brings a cinematic eye to every session, whether it's a quiet engagement in the park or a bold portrait in the studio. He shoots with precision and moves fast, keeping the energy natural and the results anything but ordinary."
            className="md:pl-16"
          />
        </ScrollRevealGroup>
      </section>

      <ScrollTopButton />
    </main>
  );
}
