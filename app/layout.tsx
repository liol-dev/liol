import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life In Our Lens",
  description: "Photos shot with intention.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

// ============================================================
// ROOT LAYOUT — bare shell
// Only html/body/globals live here. Public chrome (NavBar +
// Footer) moved to app/(site)/layout.tsx so that app/admin/
// can render its own dashboard chrome instead of inheriting
// the public nav. (Nested layouts WRAP, they don't replace —
// route groups are how segments opt out of shared chrome.)
// ============================================================

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        {/* Warm up the ImageKit CDN connection early. Rendered as
            plain <link> tags (NOT inside a manual <head>) — React 19
            hoists them into <head> deterministically, so server and
            client agree. A literal <head> element here collides with
            Next's own head management and triggers a hydration
            mismatch that forces the whole tree to client-render. */}
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        {children}
      </body>
    </html>
  );
}
