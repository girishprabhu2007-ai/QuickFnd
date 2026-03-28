/**
 * lib/comparisons.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Helper functions for comparison pages.
 * Used by sitemap, bulk-index, and internal linking.
 */

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Get all published comparison page slugs.
 * Used by sitemap.ts and bulk-index.
 */
export async function getPublishedComparisonSlugs(): Promise<string[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comparison_pages")
    .select("slug")
    .eq("status", "published");
  if (error) return [];
  return (data || []).map((r) => String(r.slug));
}

/**
 * Get comparison pages that reference a specific tool slug.
 * Used for internal linking on tool detail pages.
 */
export async function getComparisonsForTool(
  toolSlug: string
): Promise<{ slug: string; title: string }[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("comparison_pages")
    .select("slug, title")
    .eq("status", "published")
    .or(`tool_a_slug.eq.${toolSlug},tool_b_slug.eq.${toolSlug}`);
  if (error || !data) return [];
  return data as { slug: string; title: string }[];
}
