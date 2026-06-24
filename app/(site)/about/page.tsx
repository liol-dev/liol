import PageHeader from "@/app/components/PageHeader";
import ScrollTopButton from "@/app/components/ScrollTopButton";
import ScrollRevealElement from "@/app/components/motion/ScrollRevealElement";
import ScrollRevealGroup from "@/app/components/motion/ScrollRevealGroup";
import PhotographerCard from "./PhotographerCard";

// ============================================================
// ABOUT US PAGE — "The Lens Behind the Lens"
// PageHeader + Our Story copy + photographer profiles + contact CTA.
// ============================================================

export default function AboutPage() {
  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat pb-24">

      <PageHeader title="The Lens Behind the Lens" />

      {/* ── Our Story ──────────────────────────────────────── */}
      <section className="px-8 md:px-12 mt-4 md:mt-10 text-center md:text-left">
        <ScrollRevealElement direction="up" distance={24} duration={0.6}>
          <h2 className="text-2xl md:text-3xl font-light tracking-[10%]">
            &mdash; Our Story<span className="md:hidden"> &mdash;</span>
          </h2>
        </ScrollRevealElement>

        <ScrollRevealElement direction="up" distance={24} duration={0.6} delay={0.15}>
          <p className="mt-8 md:mt-12 max-w-5xl mx-auto md:mx-0 text-base md:text-lg 3xl:text-2xl font-light leading-loose md:leading-[2.4]">
            Life in Our Lens started with a simple idea, that the best
            photographs aren&apos;t planned, they&apos;re caught. Corey and Ed
            built this brand around that belief: show up, stay sharp, and let
            the moment do the work. What started as a shared passion turned
            into a full creative partnership built on complementary
            perspectives and one relentless standard for quality.
          </p>
        </ScrollRevealElement>
      </section>

      {/* ── The Photographers ──────────────────────────────── */}
      <section className="mt-20 md:mt-28 md:px-12">
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

      {/* ── Contact CTA ────────────────────────────────────────
          Full-width section below the photographers. Centered on
          both mobile and desktop — this is a destination, not a
          section header, so center alignment fits regardless of
          viewport.
      ──────────────────────────────────────────────────────── */}
      <section className="mt-28 md:mt-64 px-8 md:px-12">
        <ScrollRevealElement direction="up" distance={24} duration={0.7} delay={0.1}>
          <div className="max-w-2xl mx-auto text-center flex flex-col items-center gap-8">

            {/* Section label */}
            <h2 className="text-2xl md:text-3xl font-light tracking-[10%]">
              &mdash; Work With Us &mdash;
            </h2>

            {/* Supporting copy */}
            <p className="text-base md:text-lg 3xl:text-2xl font-light leading-loose text-liol-subtext max-w-lg">
              Have a moment worth capturing? We&apos;d love to hear about it.
              Reach out and let&apos;s make something together.
            </p>

            {/* Email CTA — styled as a prominent outlined button on
                mobile, expands to a larger pill on desktop. Opens
                the user's mail client directly via mailto. */}
            <a
              href="mailto:lifeinourlensphotography@gmail.com"
              className="group inline-flex items-center gap-3 border border-liol-text/30 hover:border-liol-text rounded-full px-4 md:px-8 py-4 text-sm md:text-base 3xl:text-xl font-light tracking-[0.08em] text-liol-subtext hover:text-liol-text duration-300"
            >
              {/* Envelope icon */}
              <svg
                className="w-4 h-4 shrink-0 text-liol-subtext group-hover:text-liol-text duration-300"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M2 7l10 7 10-7" />
              </svg>
              lifeinourlensphotography@gmail.com
            </a>

          </div>
        </ScrollRevealElement>
      </section>

      <ScrollTopButton />
    </main>
  );
}
