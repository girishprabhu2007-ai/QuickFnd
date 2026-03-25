/**
 * app/api/affiliate-config/route.ts
 * Public (cached) endpoint — returns affiliate rules for AffiliateCard component.
 * Cached for 5 minutes so rule changes propagate quickly without hammering DB.
 */

import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { DEFAULT_AFFILIATE_SETTINGS } from "@/app/api/admin/affiliate-settings/route";

export const revalidate = 300; // 5 min cache

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "affiliate_settings")
      .maybeSingle();

    const settings = data?.value ?? DEFAULT_AFFILIATE_SETTINGS;
    return NextResponse.json(settings, {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch {
    return NextResponse.json(DEFAULT_AFFILIATE_SETTINGS);
  }
}