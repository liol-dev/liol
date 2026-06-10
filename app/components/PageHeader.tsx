// ============================================================
// PAGE HEADER COMPONENT
// Shared top-of-page banner used across inner pages (Gallery,
// About Us, etc.): big page title + optional subtext, full
// width while respecting the site's standard padding.
// Centered on mobile, left-aligned on desktop, per design.
// ============================================================

interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="px-8 md:px-12 pt-16 md:pt-20 pb-10 md:pb-14 text-center md:text-left">

      {/* Page title — large, light, same tracking convention as
          the rest of the site's display text */}
      <h1 className="text-5xl md:text-8xl font-light tracking-[10%]">
        {title}
      </h1>

      {/* Optional subtext */}
      {subtitle && (
        <p className="mt-6 text-base md:text-lg text-liol-subtext font-light leading-relaxed max-w-2xl mx-auto md:mx-0">
          {subtitle}
        </p>
      )}

    </header>
  );
}
