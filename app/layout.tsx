import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Life In Our Lens",
  description: "Portraits, couples, and engagements shot with intention.",
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
        {children}
      </body>
    </html>
  );
}
