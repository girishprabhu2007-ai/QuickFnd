/**
 * app/api/admin/replenish/route.ts
 * Checks TOOL_CATALOG against live DB and publishes any missing Priority 1 tools.
 * Wired to centralised content-engine for consistent brand voice.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getMissingTools, type CatalogEntry } from "@/lib/replenishment-catalog";
import { runQualityGate } from "@/lib/quality-gate";
import { indexNewPage } from "@/lib/index-now";
import { generateToolDescription } from "@/lib/content-engine";

export const maxDuration = 120;

async function generateSEOContent(entry: CatalogEntry) {
  const result = await generateToolDescription({
    query: entry.name,
    suggested_name: entry.name,
    suggested_slug: entry.slug,
    engine_type: entry.engine_type,
    category: "tool",
  });

  if (result.success) {
    return {
      intro: result.output.seo_intro || entry.description,
      benefits: [] as string[],
      steps: [] as string[],
      use_cases: [] as string[],
      faqs: result.output.seo_faqs || [],
      description: result.output.description,
    };
  }

  // Fallback — return minimal content so publishing still works
  return {
    intro: entry.description,
    benefits: [],
    steps: [],
    use_cases: [],
    faqs: [],
    description: entry.description,
  };
}

export async function POST() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();

    const [toolsRes, calcsRes, aiRes] = await Promise.all([
      supabase.from("tools").select("slug"),
      supabase.from("calculators").select("slug"),
      supabase.from("ai_tools").select("slug"),
    ]);

    const existingSlugs = [
      ...(toolsRes.data || []).map((t: {slug: string}) => t.slug),
      ...(calcsRes.data || []).map((t: {slug: string}) => t.slug),
      ...(aiRes.data || []).map((t: {slug: string}) => t.slug),
    ];

    const missing = getMissingTools(existingSlugs);

    if (!missing.length) {
      return NextResponse.json({ success: true, message: "Catalog complete — all Priority 1 tools live", published: 0 });
    }

    const results = [];

    for (const entry of missing.slice(0, 3)) {
      try {
        const quality = runQualityGate({
          name: entry.name, slug: entry.slug,
          description: entry.description, engine_type: entry.engine_type,
        });

        if (!quality.passed) {
          results.push({ slug: entry.slug, status: "quality_failed", reason: quality.failure_reason });
          continue;
        }

        const { data: existing } = await supabase.from("tools").select("slug").eq("slug", entry.slug).maybeSingle();
        if (existing) { results.push({ slug: entry.slug, status: "already_exists" }); continue; }

        const { error } = await supabase.from("tools").insert([{
          name: entry.name, slug: entry.slug, description: entry.description,
          engine_type: entry.engine_type, engine_config: entry.engine_config || {},
          related_slugs: entry.related_slugs,
        }]);

        if (error) { results.push({ slug: entry.slug, status: "db_error", reason: error.message }); continue; }

        try {
          const seo = await generateSEOContent(entry);
          await supabase.from("seo_content").upsert({
            slug: entry.slug, table_name: "tools", name: entry.name,
            intro: seo.intro || entry.description, benefits: seo.benefits || [],
            steps: seo.steps || [], use_cases: seo.use_cases || [], faqs: seo.faqs || [],
            generated_at: new Date().toISOString(), source: "replenishment-catalog",
          }, { onConflict: "slug,table_name" });
        } catch { /* SEO failure non-fatal */ }

        await indexNewPage(entry.slug, "tools");
        results.push({ slug: entry.slug, status: "published", name: entry.name });
        await new Promise(r => setTimeout(r, 1000));

      } catch (err) {
        results.push({ slug: entry.slug, status: "error", reason: err instanceof Error ? err.message : "unknown" });
      }
    }

    const published = results.filter(r => r.status === "published").length;
    return NextResponse.json({ success: true, missing_total: missing.length, published, remaining: missing.length - published, results });

  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data: tools } = await supabase.from("tools").select("slug");
    const existingSlugs = (tools || []).map((t: {slug: string}) => t.slug);
    const missing = getMissingTools(existingSlugs);

    return NextResponse.json({
      missing: missing.length,
      missing_items: missing.map(m => ({ slug: m.slug, name: m.name, group: m.group, priority: m.priority })),
    });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}