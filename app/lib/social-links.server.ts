// ============================================================
// SERVER-ONLY social link helpers
// Import ONLY from Server Components and layouts — never from
// client components. Uses next/headers via the server client.
// ============================================================

import { createClient } from "@/app/lib/supabase/server";

export type SocialPlatform = "instagram" | "facebook" | "twitter";

export interface SocialLink {
  id: string;
  platform: SocialPlatform;
  url: string;
  updated_at: string;
}

// Keyed by platform for easy lookup in components
export type SocialLinksMap = Partial<Record<SocialPlatform, string>>;

/** Fetch all social links and return as a platform→url map. */
export async function fetchSocialLinks(): Promise<SocialLinksMap> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("platform, url");
  if (error || !data) return {};
  const map: SocialLinksMap = {};
  for (const row of data) {
    if (row.url) map[row.platform as SocialPlatform] = row.url;
  }
  return map;
}
