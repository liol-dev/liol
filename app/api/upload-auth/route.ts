import { getUploadAuthParams } from "@imagekit/next/server";
import { createClient } from "@/app/lib/supabase/server";

// ============================================================
// UPLOAD AUTH — GET /api/upload-auth
//
// Returns short-lived ImageKit upload credentials (token,
// expire, signature) so the browser can upload directly to
// ImageKit WITHOUT ever seeing the private key.
//
// SECURITY: this route sits outside /admin, so the middleware
// session guard does NOT cover it. We re-check the Supabase
// session here and 401 anyone who isn't a signed-in admin —
// otherwise the open internet could mint upload credentials
// against the LIOL ImageKit account.
//
// The private key stays server-only (no NEXT_PUBLIC_ prefix).
// The public key is safe to return to the client.
// ============================================================

export async function GET() {
  // Admin gate
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mint credentials
  const { token, expire, signature } = getUploadAuthParams({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY as string,
  });

  return Response.json({
    token,
    expire,
    signature,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  });
}
