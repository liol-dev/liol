// ============================================================
// SERVER-ONLY category helpers
// Import ONLY from Server Components and API routes — never
// from client components. The Supabase server client depends
// on next/headers which is unavailable in the browser.
// ============================================================

import { createClient } from "@/app/lib/supabase/server";
import type { CategoryRecord } from "@/app/lib/photos";

/** Fetch all categories ordered by label. Returns [] on error. */
export async function fetchCategories(): Promise<CategoryRecord[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("label", { ascending: true });
  if (error || !data) return [];
  return data as CategoryRecord[];
}
