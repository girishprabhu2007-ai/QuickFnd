/**
 * app/api/admin/seo-backfill/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Finds tools/calculators/AI tools with missing SEO content (FAQs, how-to
 * steps, benefits) and auto-generates them via the content engine.
 *
 * GET /api/admin/seo-backfill?secret=CRON_SECRET          → dry run (shows what's missing)
 * GET /api/admin/seo-backfill?secret=CRON_SECRET&run=true  → generates + writes to DB
 * GET /api/admin/seo-backfill?secret=CRON_SECRET&run=true&limit=5 → process max 5 items
 *
 * Can also be added as a weekly cron in vercel.json:
 * { "path": "/api/admin/seo-backfill?run=true&limit=10", "schedule": "0 5 * * 0" }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateToolDescription } from "@/lib/content-engine";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

type TableName = "tools" | "calculators" | "ai_tools";

type DBItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
  engine_type: string | null;
  engine_config: Record<string, unknown> | null;
};

function hasSEOContent(item: DBItem): boolean {
  const config = item.engine_config;
  if (!config) return false;

  const seo = config.seo as Record<string, unknown> | undefined;
  if (!seo) {
    // Check top-level faqs/how_to_steps/benefits (some items store them at root)
    const faqs = config.faqs || config.seo_faqs;
    const steps = config.how_to_steps || config.steps;
    const benefits = config.benefits;

    const hasFaqs = Array.isArray(faqs) && faqs.length >= 3;
    const hasSteps = Array.isArray(steps) && steps.length >= 3;
    const hasBenefits = Array.isArray(benefits) && benefits.length >= 3;

    return hasFaqs && hasSteps && hasBenefits;
  }

  const faqs = seo.faqs;
  const steps = seo.how_to_steps;
  const benefits = seo.benefits;

  const hasFaqs = Array.isArray(faqs) && faqs.length >= 3;
  const hasSteps = Array.isArray(steps) && steps.length >= 3;
  const hasBenefits = Array.isArray(benefits) && benefits.length >= 3;

  return hasFaqs && hasSteps && hasBenefits;
}

function inferCategory(table: TableName): "tool" | "calculator" | "ai-tool" {
  if (table === "tools") return "tool";
  if (table === "calculators") return "calculator";
  return "ai-tool";
}

async function fetchItemsMissingSEO(
  supabase: ReturnType<typeof getSupabase>,
  table: TableName
): Promise<DBItem[]> {
  const { data, error } = await supabase
    .from(table)
    .select("id, name, slug, description, engine_type, engine_config")
    .order("id", { ascending: true });

  if (error || !data) return [];

  return (data as DBItem[]).filter(item => {
    // Skip items with no name or slug
    if (!item.name || !item.slug) return false;
    // Skip items with very short descriptions (likely placeholders)
    if (!item.description || item.description.length < 10) return false;
    // Return items MISSING SEO content
    return !hasSEOContent(item);
  });
}

async function generateAndWriteSEO(
  supabase: ReturnType<typeof getSupabase>,
  table: TableName,
  item: DBItem
): Promise<{ success: boolean; error?: string }> {
  try {
    const category = inferCategory(table);
    const query = `${item.name} online free`;

    const result = await generateToolDescription({
      query,
      suggested_name: item.name,
      suggested_slug: item.slug,
      engine_type: item.engine_type || "unknown",
      category,
      serper_key: process.env.SERPER_API_KEY,
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    const output = result.output;

    // Build SEO block to merge into engine_config
    const seoBlock = {
      faqs: output.seo_faqs || [],
      how_to_steps: [
        `Open the ${item.name} tool on QuickFnd`,
        ...(output.seo_intro ? [`Read the description: ${output.seo_intro.slice(0, 80)}...`] : []),
        "Enter your input or upload your file",
        "Configure any settings or options",
        "Click the action button to process",
        "Download or copy your result",
      ].slice(0, 5),
      benefits: [
        `Free ${item.name.toLowerCase()} with no account required`,
        "100% browser-based — your data never leaves your device",
        "Works on desktop, tablet, and mobile",
        "No software to install or update",
        "Instant results with no waiting",
      ],
    };

    // If content engine returned good FAQs, use those instead of generic steps
    if (output.seo_faqs && output.seo_faqs.length >= 3) {
      // Use the engine's generated content
    }

    // Merge into existing engine_config
    const existingConfig = item.engine_config || {};
    const updatedConfig = {
      ...existingConfig,
      seo: seoBlock,
    };

    // Also update description and seo_intro if the generated ones are better
    const updates: Record<string, unknown> = {
      engine_config: updatedConfig,
    };

    // Update description only if current one is very short
    if (item.description.length < 80 && output.description && output.description.length > item.description.length) {
      updates.description = output.description;
    }

    const { error: updateError } = await supabase
      .from(table)
      .update(updates)
      .eq("id", item.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;
  const shouldRun = searchParams.get("run") === "true";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 50);

  // Auth: cron secret or Vercel cron header
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  if (!isVercelCron && secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const startTime = Date.now();

  try {
    // Scan all three tables for missing SEO content
    const [missingTools, missingCalcs, missingAI] = await Promise.all([
      fetchItemsMissingSEO(supabase, "tools"),
      fetchItemsMissingSEO(supabase, "calculators"),
      fetchItemsMissingSEO(supabase, "ai_tools"),
    ]);

    const allMissing: { table: TableName; item: DBItem }[] = [
      ...missingTools.map(item => ({ table: "tools" as TableName, item })),
      ...missingCalcs.map(item => ({ table: "calculators" as TableName, item })),
      ...missingAI.map(item => ({ table: "ai_tools" as TableName, item })),
    ];

    // DRY RUN: just report what's missing
    if (!shouldRun) {
      return NextResponse.json({
        mode: "dry_run",
        message: "Add &run=true to actually generate SEO content",
        missing_seo_content: {
          tools: missingTools.map(i => ({ slug: i.slug, name: i.name })),
          calculators: missingCalcs.map(i => ({ slug: i.slug, name: i.name })),
          ai_tools: missingAI.map(i => ({ slug: i.slug, name: i.name })),
          total: allMissing.length,
        },
        duration_ms: Date.now() - startTime,
      });
    }

    // RUN MODE: generate SEO content for items up to limit
    const toProcess = allMissing.slice(0, limit);
    const results: { slug: string; table: string; success: boolean; error?: string }[] = [];

    for (const { table, item } of toProcess) {
      const result = await generateAndWriteSEO(supabase, table, item);
      results.push({
        slug: item.slug,
        table,
        success: result.success,
        error: result.error,
      });

      // Rate limit: 3 second gap between OpenAI calls
      if (toProcess.indexOf({ table, item }) < toProcess.length - 1) {
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    const succeeded = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    // Log to cron_runs
    await supabase.from("cron_runs").insert({
      job_name: "seo-backfill",
      status: failed > 0 && succeeded === 0 ? "failed" : "success",
      items_published: succeeded,
      error_message: failed > 0
        ? results.filter(r => !r.success).map(r => `${r.slug}: ${r.error}`).join("; ").slice(0, 500)
        : null,
      completed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
    });

    return NextResponse.json({
      mode: "run",
      processed: toProcess.length,
      succeeded,
      failed,
      remaining: allMissing.length - toProcess.length,
      results,
      duration_ms: Date.now() - startTime,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
}