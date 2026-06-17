import AdminSidebar from "../components/AdminSidebar";

// ============================================================
// DASHBOARD LAYOUT — sidebar chrome for authenticated pages
// Lives inside (dashboard) route group so /admin/login is
// excluded and never renders the sidebar.
// Route protection is handled by middleware.ts upstream.
// ============================================================

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-liol-bg text-liol-text font-montserrat flex flex-col md:flex-row">
      <AdminSidebar />
      <main className="flex-1 min-w-0 px-4 max-xs:px-3 py-6 md:px-10 md:py-8">
        {children}
      </main>
    </div>
  );
}
