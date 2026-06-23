import SocialLinksManager from "../../components/SocialLinksManager";

// ============================================================
// ADMIN SOCIAL — /admin/social
// Server shell. All interactivity lives in SocialLinksManager.
// Protected by middleware like the rest of /admin.
// ============================================================

export default function AdminSocialPage() {
  return (
    <>
      <h1 className="text-xl font-light tracking-wide">Social Links</h1>
      <p className="mt-1 text-sm text-liol-subtext">
        Manage the social media links shown in the footer and mobile nav.
      </p>

      <div className="mt-8">
        <SocialLinksManager />
      </div>
    </>
  );
}
