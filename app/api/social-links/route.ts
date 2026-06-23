import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// GET  /api/social-links — fetch all three platform rows
// PUT  /api/social-links — upsert a platform URL
//   body: { platform: string; url: string }
// DELETE /api/social-links — clear a platform URL (set to '')
//   body: { platform: string }
// ============================================================

const VALID_PLATFORMS = ["instagram", "facebook", "twitter"] as const;
type Platform = (typeof VALID_PLATFORMS)[number];

function isValidPlatform(p: unknown): p is Platform {
  return VALID_PLATFORMS.includes(p as Platform);
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_links")
    .select("*")
    .order("platform");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { platform, url } = body;

  if (!isValidPlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }
  const trimmed = (url ?? "").trim();

  const { data, error } = await supabase
    .from("social_links")
    .update({ url: trimmed, updated_at: new Date().toISOString() })
    .eq("platform", platform)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { platform } = body;

  if (!isValidPlatform(platform)) {
    return NextResponse.json({ error: "Invalid platform." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("social_links")
    .update({ url: "", updated_at: new Date().toISOString() })
    .eq("platform", platform)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
