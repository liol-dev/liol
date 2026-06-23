import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// PATCH /api/categories/[id] — update a category's label
//   body: { label?: string, slug?: string }
//   slug edits are dev-only (visible in Developer Settings).
//   Protected categories (miscellaneous) can have their label
//   edited but cannot be deleted.
//
// DELETE /api/categories/[id] — delete a category
//   Photos assigned to the deleted category are reassigned to
//   'miscellaneous' before the category row is removed.
// ============================================================

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;
  const body = await request.json();

  const updates: Record<string, string> = {};

  if (typeof body.label === "string" && body.label.trim()) {
    updates.label = body.label.trim();
  }
  // Slug edits are allowed only from Developer Settings — no
  // auto-generation here; the caller must supply the desired slug.
  if (typeof body.slug === "string" && body.slug.trim()) {
    updates.slug = body.slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("categories")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "A category with that slug already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id } = await params;

  // Fetch the category first — block deletion if protected
  const { data: category, error: fetchError } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !category) {
    return NextResponse.json({ error: "Category not found." }, { status: 404 });
  }

  if (category.protected) {
    return NextResponse.json(
      { error: "This category is protected and cannot be deleted." },
      { status: 403 }
    );
  }

  // Reassign all photos in this category to 'miscellaneous'
  const { error: reassignError } = await supabase
    .from("photos")
    .update({ category: "miscellaneous" })
    .eq("category", category.slug);

  if (reassignError) {
    return NextResponse.json({ error: reassignError.message }, { status: 500 });
  }

  // Now safe to delete the category row
  const { error: deleteError } = await supabase
    .from("categories")
    .delete()
    .eq("id", id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}
