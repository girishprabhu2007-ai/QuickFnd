import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export const DEFAULT_SITE_SETTINGS = {
  // Search engine verification
  google_site_verification: "",
  bing_site_verification: "",
  yandex_verification: "",
  norton_safe_web: "",

  // Analytics
  google_analytics_id: "",
  google_tag_manager_id: "",
  facebook_pixel_id: "",
  facebook_domain_verification: "",

  // Custom code injection
  custom_head_scripts: "",
  custom_body_scripts: "",
};

export type SiteSettings = typeof DEFAULT_SITE_SETTINGS;

export async function GET() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const supabaseAdmin = getSupabaseAdmin();
    const { data } = await supabaseAdmin
      .from("site_settings")
      .select("value")
      .eq("key", "site_settings")
      .maybeSingle();

    return NextResponse.json({ settings: data?.value ?? DEFAULT_SITE_SETTINGS });
  } catch {
    return NextResponse.json({ settings: DEFAULT_SITE_SETTINGS });
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
      .upsert({ key: "site_settings", value: body }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Site settings saved successfully." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save." },
      { status: 500 }
    );
  }
}