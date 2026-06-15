import type { Metadata } from "next";
import AdminGate from "./components/AdminGate";
import AdminSidebar from "./components/AdminSidebar";

// ============================================================
// ADMIN LAYOUT — dashboard chrome
// Lives OUTSIDE the (site) route group, so it never inherits
// the public NavBar/Footer. Everything under /admin renders
// inside the password gate; once unlocked, the sidebar + main
// content area appear.
// robots noindex keeps the dashboard out of search engines —
// defense-in-depth on top of (eventual) real auth.
// ============================================================

export const metadata: Metadata = {
  title: "LIOL Admin",
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminGate>
      <div className="min-h-screen bg-liol-bg text-liol-text font-montserrat flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 min-w-0 px-4 max-xs:px-3 py-6 md:px-10 md:py-8">
          {children}
        </main>
      </div>
    </AdminGate>
  );
}
