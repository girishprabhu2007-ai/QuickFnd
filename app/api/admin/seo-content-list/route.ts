import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const table = searchParams.get("table") || "tools";
    const dbTable = table === "tools" ? "tools" : table === "calculators" ? "calculators" : "ai_tools";

    const supabase = getSupabaseAdmin();

    // Get all visible items
    const { data: items } = await supabase
      .from(dbTable)
      .select("slug, name, description, engine_type")
      .not("engine_type", "in", '("","auto","generic-directory")')
      .order("name");

    // Get slugs that already have SEO content
    const { data: existing } = await supabase
      .from("seo_content")
      .select("slug")
      .eq("table_name", table);

    const generatedSlugs = (existing || []).map((r: { slug: string }) => r.slug);

    return NextResponse.json({
      items: items || [],
      generated: generatedSlugs,
      total: items?.length || 0,
      covered: generatedSlugs.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}