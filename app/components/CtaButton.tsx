import Link from "next/link";

// ============================================================
// CTA BUTTON COMPONENT
// The site's primary call-to-action style — outlined, light
// weight, inverts on hover. Used in the hero and quote
// sections; reuse anywhere a CTA is needed so styling stays
// consistent site-wide.
// ============================================================

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string; // for per-instance spacing (e.g. mt-14)
}

export default function CtaButton({ href, children, className = "" }: CtaButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-block px-4 py-4 border border-liol-text text-liol-text font-extralight text-[1.25rem] hover:bg-liol-text hover:text-liol-bg duration-300 ${className}`}
    >
      {children}
    </Link>
  );
}
