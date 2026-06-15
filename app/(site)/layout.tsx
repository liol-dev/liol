import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";

// ============================================================
// (SITE) LAYOUT — public-facing pages
// Route group layout that owns the public chrome (NavBar +
// Footer). Everything inside app/(site)/ gets wrapped here;
// app/admin/ deliberately lives OUTSIDE this group so the
// dashboard renders without the public nav.
// The "(site)" folder name never appears in URLs — pages stay
// at /, /about, /gallery.
// ============================================================

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
