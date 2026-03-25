/**
 * app/api/ad-settings/route.ts
 *
 * PUBLIC read-only endpoint — serves ad settings to AdSlot component.
 * AdSlot.tsx fetches /api/ad-settings on every page load.
 * This route was MISSING — that's why ads were not rendering anywhere.
 *
 * No auth required (read-only, not sensitive).
 * Cached 5 minutes at edge to avoid hammering Supabase.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

const DEFAULT_AD_SETTINGS = {
  adsense_client: "",
  ads_enabled: false,
  slots: {
    leaderboard:   { enabled: true, slot_id: "" },
    rectangle:     { enabled: true, slot_id: "" },
    in_article:    { enabled: true, slot_id: "" },
    mobile_banner: { enabled: true, slot_id: "" },
    footer:        { enabled: true, slot_id: "" },
  },
  pages: {
    homepage:             true,
    tools_listing:        true,
    calculators_listing:  true,
    ai_tools_listing:     true,
    tool_detail:          true,
    calculator_detail:    true,
    ai_tool_detail:       true,
  },
};

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

    if (!url || !key) {
      return NextResponse.json(
        { settings: DEFAULT_AD_SETTINGS },
        { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
      );
    }

    const supabase = createClient(url, key, { auth: { persistSession: false } });

    const { data, error } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "ad_settings")
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("ad-settings public GET:", error);
    }

    const settings = data?.value ?? DEFAULT_AD_SETTINGS;

    return NextResponse.json(
      { settings },
      { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" } }
    );
  } catch (err) {
    console.error("ad-settings public GET unexpected:", err);
    return NextResponse.json(
      { settings: DEFAULT_AD_SETTINGS },
      { headers: { "Cache-Control": "public, s-maxage=60" } }
    );
  }
}