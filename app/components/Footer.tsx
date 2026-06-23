import type { SocialLinksMap } from "@/app/lib/social-links.server";

// ============================================================
// FOOTER COMPONENT
// Social links are passed in from the site layout (fetched once
// server-side). Only platforms with a configured URL render —
// empty platforms are hidden automatically.
// ============================================================

const SOCIAL_ICONS: Record<
  string,
  { label: string; icon: React.ReactNode }
> = {
  instagram: {
    label: "Instagram",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  twitter: {
    label: "X",
    icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
};

// Render order for social icons
const PLATFORM_ORDER = ["instagram", "facebook", "twitter"];

export default function Footer({
  socialLinks = {},
}: {
  socialLinks?: SocialLinksMap;
}) {
  // Only render platforms that have a URL configured
  const activeSocials = PLATFORM_ORDER.filter((p) => socialLinks[p as keyof SocialLinksMap]);

  return (
    <footer className="bg-liol-bg text-liol-text py-6 drop-shadow-[0_-4px_4px_rgba(0,0,0,0.3)]">
      <div className="mx-auto px-8 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 items-center">

          {/* Left — socials (desktop only) */}
          <div className="hidden md:flex items-center gap-8">
            {activeSocials.map((platform) => {
              const { label, icon } = SOCIAL_ICONS[platform];
              return (
                <a
                  key={platform}
                  href={socialLinks[platform as keyof SocialLinksMap]}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-liol-text hover:text-liol-subtext duration-300"
                >
                  {icon}
                </a>
              );
            })}
          </div>

          {/* Center — site credit (always visible) */}
          <p className="text-xs text-liol-subtext font-light tracking-[10%] text-center">
            Site by{" "}
            <a
              href="https://marcmiango.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-liol-text duration-300"
            >
              MARC MIANGO
            </a>
          </p>

          {/* Right — copyright (desktop only) */}
          <p className="hidden md:block text-xs text-liol-subtext font-light tracking-[10%] text-right">
            &copy;2026 &mdash; Life In Our Lens
          </p>

        </div>
      </div>
    </footer>
  );
}
