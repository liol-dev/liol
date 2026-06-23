import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// GET /api/cron/ping — keeps the Supabase connection warm.
// Called by Vercel Cron every 3 days (see vercel.json).
// Protected by CRON_SECRET so only Vercel can trigger it.
//
// A lightweight count query on photos is enough to prevent
// Supabase from suspending the project due to inactivity.
// ============================================================

export const runtime = "nodejs";

export async function GET(request: Request) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = await createClient();

    // Lightweight query — just a count, no data transfer
    const { error } = await supabase
      .from("photos")
      .select("id", { count: "exact", head: true });

    if (error) throw error;

    console.log(`[cron/ping] Supabase pinged at ${new Date().toISOString()}`);
    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() });
  } catch (err) {
    console.error("[cron/ping] Failed:", err);
    return NextResponse.json({ error: "Ping failed" }, { status: 500 });
  }
}
