// ============================================================
// PHOTOGRAPHER CARD — About Us page
// One profile column: landscape photo (placeholder until real
// shots arrive), avatar initial + name/role row, thin divider,
// then bio copy.
// Mobile: photo runs full-bleed, text keeps standard padding.
// Desktop: card sits inside the two-column grid on /about.
// ============================================================

import Image from "next/image";

interface PhotographerCardProps {
  name: string;
  initial: string;
  bio: string;
  role?: string;
  imageSrc?: string;   // future: real photo (ImageKit/Supabase)
  imageAlt?: string;
  className?: string;  // lets the page control per-column gutters
}

export default function PhotographerCard({
  name,
  initial,
  bio,
  role = "Photographer",
  imageSrc,
  imageAlt,
  className = "",
}: PhotographerCardProps) {
  return (
    <article className={className}>

      {/* Photo — full-bleed on mobile (no px), constrained by the
          column on desktop. Gray block stands in until we have
          real imagery; swap the div for a real photo then.
          fill + sizes: full width on mobile, ~half on the 2-col
          desktop grid. */}
      <div className="relative w-full aspect-video bg-[#d9d9d9] overflow-hidden">
        {imageSrc && (
          <Image
            src={imageSrc}
            alt={imageAlt ?? name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        )}
      </div>

      {/* Text content — padded on mobile since the photo above is
          full-bleed; desktop column already has its own gutters. */}
      <div className="px-8 md:px-0">

        {/* Avatar + name/role row */}
        <div className="mt-6 flex items-center gap-4">

          {/* Initial avatar — light disc, dark letter, matching
              the reference's "C"/"E" badges */}
          <div className="w-11 h-11 md:w-12 md:h-12 rounded-full bg-[#d9d9d9] text-liol-bg grid place-items-center text-xl md:text-2xl font-semibold shrink-0">
            {initial}
          </div>

          <div>
            <h3 className="text-lg md:text-xl font-semibold tracking-wide">
              {name}
            </h3>
            <p className="mt-0.5 text-xs uppercase tracking-[10%] text-liol-subtext">
              {role}
            </p>
          </div>
        </div>

        {/* Thin divider between identity row and bio */}
        <hr className="mt-5 border-liol-text/60" />

        {/* Bio — light weight, comfortable leading */}
        <p className="mt-6 text-sm md:text-base font-light leading-loose text-liol-text">
          {bio}
        </p>

      </div>
    </article>
  );
}
