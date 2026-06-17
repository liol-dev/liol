import type { Metadata } from "next";

// ============================================================
// ADMIN ROOT LAYOUT — metadata + robots only
// The sidebar lives in (dashboard)/layout.tsx so /admin/login
// never inherits it. Middleware handles route protection.
// ============================================================

export const metadata: Metadata = {
  title: "LIOL Admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
