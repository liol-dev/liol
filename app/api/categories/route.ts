import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// GET /api/categories — fetch all categories, ordered by label
// POST /api/categories — create a new category
//   body: { label: string }
//   slug is auto-generated from label (lowercase, hyphenated)
//   and is immutable after creation.
// ============================================================

function labelToSlug(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("label", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const body = await request.json();
  const label = (body.label ?? "").trim();

  if (!label) {
    return NextResponse.json({ error: "Label is required." }, { status: 400 });
  }

  const slug = labelToSlug(label);

  if (!slug) {
    return NextResponse.json({ error: "Label produced an invalid slug." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .insert({ slug, label })
    .select()
    .single();

  if (error) {
    // Unique violation on slug — duplicate category
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A category with that name already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
