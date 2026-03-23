import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export const DEFAULT_AD_SETTINGS = {
  adsense_client: "",
  ads_enabled: false,
  slots: {
    leaderboard: { enabled: true, slot_id: "" },
    rectangle: { enabled: true, slot_id: "" },
    in_article: { enabled: true, slot_id: "" },
    mobile_banner: { enabled: true, slot_id: "" },
    footer: { enabled: true, slot_id: "" },
  },
  pages: {
    homepage: true,
    tools_listing: true,
    calculators_listing: true,
    ai_tools_listing: true,
    tool_detail: true,
    calculator_detail: true,
    ai_tool_detail: true,
  },
};

export async function GET() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "ad_settings")
      .maybeSingle();

    if (error && error.code !== "PGRST116") console.error("ad-settings GET:", error);

    return NextResponse.json({ settings: data?.value ?? DEFAULT_AD_SETTINGS });
  } catch {
    return NextResponse.json({ settings: DEFAULT_AD_SETTINGS });
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await req.json();
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ key: "ad_settings", value: body }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Ad settings saved successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save." },
      { status: 500 }
    );
  }
}