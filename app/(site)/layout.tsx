import NavBar from "@/app/components/NavBar";
import Footer from "@/app/components/Footer";
import { fetchSocialLinks } from "@/app/lib/social-links.server";

// ============================================================
// (SITE) LAYOUT — public-facing pages
// Fetches social links once here (server-side) and passes them
// to NavBar and Footer so both stay in sync with the admin config.
// ============================================================

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const socialLinks = await fetchSocialLinks();

  return (
    <>
      <NavBar socialLinks={socialLinks} />
      {children}
      <Footer socialLinks={socialLinks} />
    </>
  );
}
