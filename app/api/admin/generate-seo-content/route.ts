/**
 * POST /api/admin/generate-seo-content
 *
 * Generates SEO content for a tool/calculator/AI tool via the
 * centralised QuickFnd Content Engine, then saves to seo_content table.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { generateToolDescription } from "@/lib/content-engine";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

type RequestBody = {
  slug: string;
  name: string;
  description: string;
  table: "tools" | "calculators" | "ai_tools";
  overwrite?: boolean;
};

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as RequestBody;
    const { slug, name, description, table, overwrite = false } = body;

    if (!slug || !name) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    if (!overwrite) {
      const { data: existing } = await supabase
        .from("seo_content")
        .select("slug")
        .eq("slug", slug)
        .eq("table_name", table)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          success: false,
          reason: "Content already exists. Pass overwrite:true to regenerate.",
          slug,
        });
      }
    }

    const category: "tool" | "calculator" | "ai-tool" =
      table === "calculators" ? "calculator"
      : table === "ai_tools" ? "ai-tool"
      : "tool";

    // ── Centralised Content Engine ────────────────────────────────────────────
    const engineResult = await generateToolDescription({
      query: `${name} online free`,
      suggested_name: name,
      suggested_slug: slug,
      engine_type: "generic-directory",
      category,
    });

    if (!engineResult.success) {
      return NextResponse.json({ success: false, error: engineResult.error }, { status: 500 });
    }

    const out = engineResult.output;

    // Map content engine output → seo_content table columns
    const parsed = {
      intro: out.seo_intro,
      benefits: out.seo_faqs.slice(0, 4).map(f => f.answer),
      steps: out.seo_faqs.slice(0, 4).map((f, i) => `Step ${i + 1}: ${f.question}`),
      useCases: out.seo_faqs.slice(0, 4).map(f => f.question),
      faqs: out.seo_faqs,
    };

    const { error: upsertError } = await supabase
      .from("seo_content")
      .upsert({
        slug,
        table_name: table,
        name,
        intro: parsed.intro,
        benefits: parsed.benefits,
        steps: parsed.steps,
        use_cases: parsed.useCases,
        faqs: parsed.faqs,
        generated_at: new Date().toISOString(),
        source: "content-engine-v2",
      }, { onConflict: "slug,table_name" });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, slug, name, table, content: parsed });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}

// GET — check if content exists for a slug
export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const table = searchParams.get("table") || "tools";

    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("seo_content")
      .select("*")
      .eq("slug", slug)
      .eq("table_name", table)
      .maybeSingle();

    return NextResponse.json({ exists: !!data, content: data });
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}