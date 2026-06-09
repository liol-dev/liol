export default function Home() {
  return (
    <main className="bg-liol-bg min-h-screen text-liol-text font-montserrat">

      {/* ── Hero / Landing Section ───────────────────────────────
          Full viewport height minus navbar. Content centered.
          On mobile: tighter text, button fills less width.
          On desktop: larger heading, wider button.
      ──────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center text-center px-8 h-[calc(100vh-56px)]">

        {/* Heading — "find" rendered in Baskervville italic as accent */}
        <h1 className="text-4xl md:text-6xl font-light tracking-[10%] leading-tight max-w-4xl">
          We don&apos;t stage moments. We{" "}
          <span className="italic">find</span>{" "}
          them
        </h1>

        {/* Subtext */}
        <p className="mt-6 text-sm md:text-base text-liol-subtext max-w-md leading-relaxed">
          Life in Our Lens — portraits, couples, and engagements shot with intention
        </p>

        {/* CTA Button */}
        <a
          href="/gallery"
          className="mt-14 px-4 py-4 border border-liol-text text-liol-text font-extralight text-[1.25rem] hover:bg-liol-text hover:text-liol-bg duration-300"
        >
          See Our Work
        </a>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 flex flex-col items-center gap-2">
          <span className="text-xs tracking-[0.3em] text-liol-subtext">SCROLL</span>
          <div className="w-px h-10 bg-liol-subtext" />
        </div>

      </section>
    </main>
  );
}
