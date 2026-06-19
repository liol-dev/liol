import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// DELETE PHOTO ASSET — DELETE /api/delete-photo
//
// Removes a file from the ImageKit media library by fileId.
// This is a thin wrapper around ImageKit's REST delete endpoint
// (the @imagekit/next SDK doesn't expose a delete helper, so we
// call it directly — same Basic Auth shape as every other
// ImageKit Media API call).
//
// SECURITY: same admin gate as /api/upload-auth. This route
// holds the private key server-side; only a signed-in admin
// session may trigger a deletion.
//
// Called by LibraryManager BEFORE the Supabase row is deleted,
// so a failed CDN delete blocks the DB delete too — prevents a
// gallery row pointing at a dead image.
// ============================================================

export async function DELETE(request: Request) {
  // Admin gate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { fileId } = await request.json().catch(() => ({ fileId: null }));

  if (!fileId || typeof fileId !== "string") {
    return Response.json({ error: "Missing fileId" }, { status: 400 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY as string;

  const res = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
    method: "DELETE",
    headers: {
      // Basic auth: base64("private_key:") — note the trailing colon
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
  });

  // 204 = deleted. 404 = already gone (treat as success — the
  // end state we want is "no longer on ImageKit" either way).
  if (res.status !== 204 && res.status !== 404) {
    const body = await res.text().catch(() => "");
    return Response.json(
      { error: `ImageKit delete failed (${res.status}): ${body}` },
      { status: 502 }
    );
  }

  return Response.json({ success: true });
}
