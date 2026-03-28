/**
 * app/api/admin/auto-generate/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Phase 2+3+4 combined:
 *   Takes approved items from demand_queue
 *   → GPT generates full tool spec
 *   → Quality gate validates (5 checks)
 *   → Publishes to Supabase
 *   → Generates SEO content
 *   → Pings IndexNow (Bing + Yandex)
 *   → Updates queue status
 *
 * Called by:
 *   - Admin UI "Generate" button (single item)
 *   - Cron job auto-publish route (batch)
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import { runQualityGate, type GeneratedTool } from "@/lib/quality-gate";
import { generateToolDescription, generateAIToolConfig } from "@/lib/content-engine";
import { indexNewPage } from "@/lib/index-now";

export const maxDuration = 120;

// ─── GPT tool generation ──────────────────────────────────────────────────────

const ENGINE_DESCRIPTIONS: Record<string, string> = {
  "password-generator": "Generates random secure passwords with configurable options",
  "password-strength-checker": "Checks password strength and gives improvement tips",
  "json-formatter": "Formats, validates, prettifies and minifies JSON",
  "word-counter": "Counts words, characters, sentences and reading time",
  "uuid-generator": "Generates UUID v1/v4/v5 unique identifiers",
  "slug-generator": "Converts text to URL-safe hyphenated slugs",
  "random-string-generator": "Generates random strings with configurable charset",
  "base64-encoder": "Encodes text or data to Base64 format",
  "base64-decoder": "Decodes Base64 back to readable text",
  "url-encoder": "Percent-encodes text for safe URL use",
  "url-decoder": "Decodes percent-encoded URL strings",
  "text-case-converter": "Converts text between UPPER, lower, Title, camelCase, snake_case",
  "text-transformer": "Reverses, trims, removes spaces or duplicates from text",
  "number-generator": "Generates random numbers in a configurable range",
  "unit-converter": "Converts between units with a configurable multiplier",
  "currency-converter": "Converts between currency pairs using exchange rates",
  "regex-tester": "Tests regex patterns against text and highlights matches",
  "sha256-generator": "Generates SHA-256 cryptographic hash",
  "md5-generator": "Generates MD5 hash of input text",
  "timestamp-converter": "Converts Unix timestamps ↔ human-readable dates",
  "hex-to-rgb": "Converts hex color codes to RGB values",
  "rgb-to-hex": "Converts RGB values to hex color codes",
  "qr-generator": "Generates downloadable QR codes from any text or URL",
  "color-picker": "Visual color picker with HEX, RGB, HSL output",
  "markdown-editor": "Markdown editor with real-time HTML preview",
  "csv-to-json": "Converts CSV data to JSON with auto-delimiter detection",
  "ip-lookup": "Looks up location, ISP, timezone for any IP address",
  "bmi-calculator": "Calculates Body Mass Index from height and weight",
  "emi-calculator": "Calculates monthly EMI for any loan",
  "gst-calculator": "Calculates GST/VAT inclusive and exclusive amounts",
  "sip-calculator": "Calculates SIP returns for mutual fund investments",
  "fd-calculator": "Calculates fixed deposit maturity and interest",
  "ppf-calculator": "Calculates PPF maturity with annual contributions",
  "hra-calculator": "Calculates HRA tax exemption",
  "income-tax-calculator": "Estimates income tax under old and new regime",
  "compound-interest-calculator": "Calculates compound interest for any period",
  "simple-interest-calculator": "Calculates simple interest",
  "loan-calculator": "Calculates loan EMI, total interest, total payment",
  "percentage-calculator": "Calculates percentages, increases, decreases",
  "age-calculator": "Calculates exact age from date of birth",
  "formula-calculator": "Evaluates mathematical formulas and expressions",
  "ai-email-writer": "AI writes professional emails from a short prompt",
  "ai-prompt-generator": "AI generates ready-to-use prompts for any task",
  "ai-blog-outline-generator": "AI creates structured blog post outlines",
  "openai-text-tool": "AI processes text — summarize, paraphrase, rewrite, explain",
};

async function generateToolSpec(queueItem: {
  query: string;
  suggested_name: string;
  suggested_slug: string;
  suggested_category: string;
  suggested_engine: string;
}): Promise<GeneratedTool | null> {
  const isAITool = queueItem.suggested_category === "ai_tool";

  // AI tools need engine_config with systemPrompt — use dedicated generator
  if (isAITool) {
    const [descResult, aiConfig] = await Promise.all([
      generateToolDescription({
        query: queueItem.query,
        suggested_name: queueItem.suggested_name,
        suggested_slug: queueItem.suggested_slug,
        engine_type: queueItem.suggested_engine,
        category: "ai-tool",
      }),
      generateAIToolConfig({
        name: queueItem.suggested_name,
        purpose: queueItem.query,
        target_user: "professionals, writers, and developers",
      }),
    ]);

    if (!descResult.success) return null;

    return {
      name: descResult.output.name,
      slug: descResult.output.slug,
      description: descResult.output.description,
      engine_type: queueItem.suggested_engine,
      engine_config: aiConfig,
      related_slugs: [],
      seo_intro: descResult.output.seo_intro,
      seo_faqs: descResult.output.seo_faqs,
    };
  }

  // Tools and calculators — use centralised content engine
  const category = queueItem.suggested_category === "calculator" ? "calculator" : "tool";
  const result = await generateToolDescription({
    query: queueItem.query,
    suggested_name: queueItem.suggested_name,
    suggested_slug: queueItem.suggested_slug,
    engine_type: queueItem.suggested_engine,
    category,
  });

  if (!result.success) return null;

  return {
    name: result.output.name,
    slug: result.output.slug,
    description: result.output.description,
    engine_type: queueItem.suggested_engine,
    engine_config: {},
    related_slugs: [],
    seo_intro: result.output.seo_intro,
    seo_faqs: result.output.seo_faqs,
  };
}

// ─── Publish a tool to Supabase ───────────────────────────────────────────────

async function publishTool(
  tool: GeneratedTool,
  category: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdmin();

  const table = category === "calculator" ? "calculators"
    : category === "ai_tool" ? "ai_tools"
    : "tools";

  // Check for existing slug
  const { data: existing } = await supabase
    .from(table)
    .select("slug")
    .eq("slug", tool.slug)
    .maybeSingle();

  if (existing) return { success: false, error: "Slug already exists" };

  const { error } = await supabase.from(table).insert([{
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    engine_type: tool.engine_type,
    engine_config: tool.engine_config || {},
    related_slugs: tool.related_slugs || [],
  }]);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ─── Save SEO content to seo_content table ────────────────────────────────────

async function saveSEOContent(
  tool: GeneratedTool,
  category: string
): Promise<void> {
  if (!tool.seo_intro && !tool.seo_faqs?.length) return;

  const supabase = getSupabaseAdmin();
  const tableMap: Record<string, string> = {
    tool: "tools", calculator: "calculators", ai_tool: "ai_tools"
  };

  await supabase.from("seo_content").upsert({
    slug: tool.slug,
    table_name: tableMap[category] || "tools",
    name: tool.name,
    intro: tool.seo_intro || "",
    benefits: [],
    steps: [],
    use_cases: [],
    faqs: tool.seo_faqs || [],
    generated_at: new Date().toISOString(),
    source: "auto-pipeline",
  }, { onConflict: "slug,table_name" });
}

// ─── Main POST handler ────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { id?: string; ids?: string[] };
    const supabase = getSupabaseAdmin();

    // Get queue items to process
    let items: Record<string, unknown>[] = [];

    if (body.id) {
      const { data } = await supabase
        .from("demand_queue")
        .select("*")
        .eq("id", body.id)
        .single();
      if (data) items = [data];
    } else if (body.ids) {
      const { data } = await supabase
        .from("demand_queue")
        .select("*")
        .in("id", body.ids);
      items = data || [];
    } else {
      // Process next batch of approved items
      const { data } = await supabase
        .from("demand_queue")
        .select("*")
        .eq("status", "approved")
        .order("demand_score", { ascending: false })
        .limit(5); // Process 5 at a time
      items = data || [];
    }

    if (!items.length) {
      return NextResponse.json({ success: true, message: "No approved items in queue — run Screen Queue first to approve items", published: 0, processed: 0, failed: 0 });
    }

    const results = [];

    for (const item of items) {
      const queueId = item.id as string;

      // Mark as generating
      await supabase.from("demand_queue")
        .update({ status: "generating" })
        .eq("id", queueId);

      try {
        // Step 1: Generate tool spec with GPT
        const tool = await generateToolSpec({
          query: item.query as string,
          suggested_name: item.suggested_name as string,
          suggested_slug: item.suggested_slug as string,
          suggested_category: item.suggested_category as string,
          suggested_engine: item.suggested_engine as string,
        });

        if (!tool) {
          await supabase.from("demand_queue").update({
            status: "pending",
            rejection_reason: "GPT generation failed",
          }).eq("id", queueId);
          results.push({ id: queueId, status: "failed", reason: "GPT failed" });
          continue;
        }

        // Extra guard for ai_tool: engine_config MUST have a non-empty systemPrompt.
        // Without it the tool passes quality gate but visibility.ts filters it as generic → invisible.
        if (item.suggested_category === "ai_tool") {
          const cfg = tool.engine_config as Record<string, unknown> | undefined;
          const sp = String(cfg?.systemPrompt || "").trim();
          if (!sp) {
            await supabase.from("demand_queue").update({
              status: "pending",
              rejection_reason: "AI tool engine_config missing systemPrompt — tool would be invisible on site",
            }).eq("id", queueId);
            results.push({ id: queueId, status: "failed", reason: "Missing systemPrompt in engine_config" });
            continue;
          }
        }

        // Step 2: Quality gate
        const quality = runQualityGate(tool);

        if (!quality.passed) {
          await supabase.from("demand_queue").update({
            status: "pending",
            rejection_reason: `Quality gate failed: ${quality.failure_reason}`,
          }).eq("id", queueId);
          results.push({ id: queueId, status: "quality_failed", reason: quality.failure_reason });
          continue;
        }

        // Step 3: Publish to Supabase
        const category = item.suggested_category as string;
        const publish = await publishTool(tool, category);

        if (!publish.success) {
          const isDuplicate = publish.error?.includes("already exists");
          await supabase.from("demand_queue").update({
            status: isDuplicate ? "duplicate" : "pending",
            rejection_reason: publish.error,
          }).eq("id", queueId);
          results.push({ id: queueId, status: isDuplicate ? "duplicate" : "failed", reason: publish.error });
          continue;
        }

        // Step 4: Save SEO content
        await saveSEOContent(tool, category);

        // Step 5: Ping IndexNow (Bing + Yandex + Google sitemap)
        const typeMap: Record<string, "tools" | "calculators" | "ai-tools"> = {
          tool: "tools", calculator: "calculators", ai_tool: "ai-tools"
        };
        const indexResult = await indexNewPage(tool.slug, typeMap[category] || "tools");

        // Step 6: Mark as published in queue
        await supabase.from("demand_queue").update({
          status: "published",
          published_slug: tool.slug,
          processed_at: new Date().toISOString(),
        }).eq("id", queueId);

        results.push({
          id: queueId,
          status: "published",
          slug: tool.slug,
          name: tool.name,
          quality_score: quality.score,
          indexed: { bing: indexResult.bing, yandex: indexResult.yandex },
        });

      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await supabase.from("demand_queue").update({
          status: "pending",
          rejection_reason: `Pipeline error: ${message}`,
        }).eq("id", queueId);
        results.push({ id: queueId, status: "error", reason: message });
      }

      // Small delay between items to avoid rate limiting
      await new Promise(r => setTimeout(r, 1000));
    }

    const published = results.filter(r => r.status === "published").length;
    const failed = results.filter(r => r.status !== "published").length;

    return NextResponse.json({
      success: true,
      processed: results.length,
      published,
      failed,
      results,
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Pipeline failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}