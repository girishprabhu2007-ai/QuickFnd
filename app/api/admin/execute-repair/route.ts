import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { inferEngineType } from "@/lib/engine-metadata";
import { getAdminUser } from "@/lib/admin-auth";

// Engines with real renderers — same source of truth as review-console.ts
const LIVE_TOOL_ENGINES = new Set([
  "password-strength-checker", "password-generator", "json-formatter", "word-counter",
  "uuid-generator", "slug-generator", "random-string-generator", "base64-encoder",
  "base64-decoder", "url-encoder", "url-decoder", "text-case-converter",
  "code-formatter", "code-snippet-manager", "text-transformer", "number-generator",
  "unit-converter", "currency-converter", "regex-tester", "regex-extractor",
  "sha256-generator", "md5-generator", "timestamp-converter", "hex-to-rgb",
  "rgb-to-hex", "text-to-binary", "binary-to-text", "json-escape", "json-unescape",
  "qr-generator", "color-picker", "markdown-editor", "csv-to-json", "ip-lookup",
  "cron-builder", "diff-checker", "jwt-decoder", "lorem-ipsum-generator",
  "number-base-converter", "html-entity-encoder", "string-escape-tool",
  "yaml-json-converter", "json-to-csv", "color-contrast-checker",
  "robots-txt-generator", "open-graph-tester",
]);

const LIVE_CALC_ENGINES = new Set([
  "age-calculator", "bmi-calculator", "loan-calculator", "emi-calculator",
  "percentage-calculator", "simple-interest-calculator", "compound-interest-calculator",
  "gst-calculator", "sip-calculator", "fd-calculator", "ppf-calculator",
  "hra-calculator", "income-tax-calculator", "formula-calculator",
  "discount-calculator", "tip-calculator", "roi-calculator", "savings-calculator",
  "retirement-calculator", "calorie-calculator", "fuel-cost-calculator",
  "cagr-calculator", "gratuity-calculator", "rd-calculator",
]);

const LIVE_AI_ENGINES = new Set([
  "openai-text-tool", "ai-prompt-generator", "ai-email-writer", "ai-blog-outline-generator",
]);

function getLiveEngines(table: "tools" | "calculators" | "ai_tools"): Set<string> {
  if (table === "tools") return LIVE_TOOL_ENGINES;
  if (table === "calculators") return LIVE_CALC_ENGINES;
  return LIVE_AI_ENGINES;
}

function isPlaceholder(engineType: string | null | undefined, table: "tools" | "calculators" | "ai_tools"): boolean {
  if (!engineType) return true;
  const et = engineType.trim().toLowerCase();
  if (et === "generic-directory" || et === "" || et === "auto") return true;
  return !getLiveEngines(table).has(et);
}

export async function POST() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let fixed = 0;
    let alreadyOk = 0;
    const skipped: Array<{ table: string; slug: string; current: string | null; reason: string }> = [];
    const repaired: Array<{ table: string; slug: string; from: string | null; to: string }> = [];

    async function repairTable(table: "tools" | "calculators" | "ai_tools") {
      const { data, error } = await supabase
        .from(table)
        .select("id, name, slug, description, engine_type, engine_config")
        .order("id", { ascending: false });

      if (error) throw new Error(error.message);

      const category = table === "tools" ? "tool" : table === "calculators" ? "calculator" : "ai-tool";
      const liveEngines = getLiveEngines(table);

      for (const item of data || []) {
        // Skip items that already have a live engine
        if (!isPlaceholder(item.engine_type, table)) {
          alreadyOk++;
          continue;
        }

        // Strategy 1: use suggestAdminEngine (uses calculator-runtime + slug patterns)
        const suggestion = suggestAdminEngine(category, {
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          engine_type: item.engine_type,
          engine_config: item.engine_config || {},
        });

        // Strategy 2: use inferEngineType directly on the slug
        const inferred = inferEngineType(category as "tool" | "calculator" | "ai-tool", item.slug);

        // Pick whichever strategy gives a live engine
        let bestEngine: string | null = null;
        let bestConfig: Record<string, unknown> = {};

        if (suggestion.engine_type && liveEngines.has(suggestion.engine_type) && suggestion.engine_type !== "generic-directory") {
          bestEngine = suggestion.engine_type;
          bestConfig = suggestion.engine_config || {};
        } else if (inferred && liveEngines.has(inferred) && inferred !== "generic-directory") {
          bestEngine = inferred;
          bestConfig = {};
        }

        if (!bestEngine) {
          skipped.push({
            table,
            slug: item.slug,
            current: item.engine_type || null,
            reason: `No live renderer found for "${item.engine_type || "null"}" — needs manual fix`,
          });
          continue;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({ engine_type: bestEngine, engine_config: bestConfig })
          .eq("id", item.id);

        if (updateError) {
          skipped.push({ table, slug: item.slug, current: item.engine_type, reason: updateError.message });
          continue;
        }

        repaired.push({ table, slug: item.slug, from: item.engine_type || null, to: bestEngine });
        fixed++;
      }
    }

    await repairTable("tools");
    await repairTable("calculators");
    await repairTable("ai_tools");

    return NextResponse.json({
      success: true,
      fixed,
      alreadyOk,
      skippedCount: skipped.length,
      skipped: skipped.slice(0, 100),
      repaired: repaired.slice(0, 100),
      summary: `Repaired ${fixed} items. ${skipped.length} still need manual attention.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Repair failed." },
      { status: 500 }
    );
  }
}