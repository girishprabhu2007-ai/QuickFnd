import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { generateIdeas } from "@/lib/tool-bulk-generator";
import { inferEngineType } from "@/lib/engine-metadata";

type Category = "tool" | "calculator" | "ai-tool";
type BulkType = "tools" | "calculators" | "ai_tools";

// ── Ground truth: engines that have REAL renderers in the codebase ────────────
// Any DB item whose engine_type is NOT in this set is a placeholder.
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
  "html-minifier", "css-minifier", "js-minifier", "email-validator", "line-sorter", "box-shadow-generator", "css-gradient-generator",
]);

const LIVE_CALC_ENGINES = new Set([
  "age-calculator", "bmi-calculator", "loan-calculator", "emi-calculator",
  "percentage-calculator", "simple-interest-calculator", "compound-interest-calculator",
  "gst-calculator", "sip-calculator", "fd-calculator", "ppf-calculator",
  "hra-calculator", "income-tax-calculator", "formula-calculator",
  "discount-calculator", "tip-calculator", "roi-calculator", "savings-calculator",
  "retirement-calculator", "calorie-calculator", "fuel-cost-calculator",
  "cagr-calculator", "gratuity-calculator", "rd-calculator",
  "mortgage-calculator", "sales-tax-calculator", "vat-calculator",
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

export type ReviewRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  engine_type: string | null;
  engine_config: Record<string, unknown> | null;
  created_at?: string | null;
  // enriched fields added by diagnostics
  is_placeholder?: boolean;
  suggested_engine?: string | null;
  fixable?: boolean;
};

export type ReviewSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  genericDirectory: number;
  placeholderCount: number;       // ← NEW: dead engine in DB
  recentItems: ReviewRow[];
  missingItems: ReviewRow[];
  placeholderItems: ReviewRow[];  // ← NEW: items with dead engine types
};

export type RepairPreviewRow = {
  table: "tools" | "calculators" | "ai_tools";
  id: number;
  name: string;
  slug: string;
  current_engine_type: string | null;
  suggested_engine_type: string | null;
  fixable: boolean;
  suggested_engine_config: Record<string, unknown>;
  repair_reason: string;
};

function normalizeRows(rows: ReviewRow[] | null | undefined): ReviewRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    id: row.id,
    name: String(row.name || ""),
    slug: String(row.slug || ""),
    description: row.description || "",
    engine_type: row.engine_type || null,
    engine_config:
      row.engine_config && typeof row.engine_config === "object" && !Array.isArray(row.engine_config)
        ? row.engine_config
        : {},
    created_at: row.created_at || null,
  }));
}

function buildSection(rows: ReviewRow[], table: "tools" | "calculators" | "ai_tools"): ReviewSection {
  const normalized = normalizeRows(rows);

  const missingItems = normalized.filter((row) => !row.engine_type);
  const genericDirectoryItems = normalized.filter(
    (row) => String(row.engine_type || "").trim().toLowerCase() === "generic-directory"
  );

  // Items that HAVE an engine_type but it has no real renderer — the real placeholders
  const placeholderItems = normalized.filter((row) => isPlaceholder(row.engine_type, table));

  // Enrich each placeholder with a suggested fix
  const enrichedPlaceholders = placeholderItems.map((row) => {
    const category: Category = table === "tools" ? "tool" : table === "calculators" ? "calculator" : "ai-tool";
    const suggestion = suggestAdminEngine(category, {
      name: row.name,
      slug: row.slug,
      description: row.description || "",
      engine_type: row.engine_type,
      engine_config: row.engine_config || {},
    });
    const liveEngines = getLiveEngines(table);
    const suggestedIsLive = suggestion.engine_type ? liveEngines.has(suggestion.engine_type) : false;
    return {
      ...row,
      is_placeholder: true,
      suggested_engine: suggestion.engine_type,
      fixable: suggestedIsLive && suggestion.engine_type !== "generic-directory",
    };
  });

  return {
    total: normalized.length,
    withEngine: normalized.filter((row) => row.engine_type && !isPlaceholder(row.engine_type, table)).length,
    missingEngine: missingItems.length,
    genericDirectory: genericDirectoryItems.length,
    placeholderCount: placeholderItems.length,
    recentItems: normalized.slice(0, 20),
    missingItems: missingItems.slice(0, 50),
    placeholderItems: enrichedPlaceholders.slice(0, 100),
  };
}

function mapTableToCategory(table: "tools" | "calculators" | "ai_tools"): Category {
  if (table === "tools") return "tool";
  if (table === "calculators") return "calculator";
  return "ai-tool";
}

export async function getReviewDiagnostics() {
  const supabase = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes] = await Promise.all([
    supabase.from("tools").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }),
    supabase.from("calculators").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }),
    supabase.from("ai_tools").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }),
  ]);

  if (toolsRes.error) throw new Error(toolsRes.error.message);
  if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
  if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);

  const tools = normalizeRows(toolsRes.data as ReviewRow[]);
  const calculators = normalizeRows(calculatorsRes.data as ReviewRow[]);
  const aiTools = normalizeRows(aiToolsRes.data as ReviewRow[]);

  return {
    generatedAt: new Date().toISOString(),
    liveEngines: {
      tools: LIVE_TOOL_ENGINES.size,
      calculators: LIVE_CALC_ENGINES.size,
      aiTools: LIVE_AI_ENGINES.size,
    },
    tools: buildSection(tools, "tools"),
    calculators: buildSection(calculators, "calculators"),
    aiTools: buildSection(aiTools, "ai_tools"),
  };
}

export async function getRecentItems() {
  const supabase = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes] = await Promise.all([
    supabase.from("tools").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }).limit(15),
    supabase.from("calculators").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }).limit(15),
    supabase.from("ai_tools").select("id, name, slug, description, engine_type, engine_config, created_at").order("id", { ascending: false }).limit(15),
  ]);

  if (toolsRes.error) throw new Error(toolsRes.error.message);
  if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
  if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);

  return {
    tools: normalizeRows(toolsRes.data as ReviewRow[]),
    calculators: normalizeRows(calculatorsRes.data as ReviewRow[]),
    aiTools: normalizeRows(aiToolsRes.data as ReviewRow[]),
  };
}

export async function getFallbackAudit() {
  const diagnostics = await getReviewDiagnostics();
  return {
    generatedAt: new Date().toISOString(),
    toolsMissingRuntime: diagnostics.tools.placeholderItems,
    calculatorsMissingRuntime: diagnostics.calculators.placeholderItems,
    aiToolsMissingRuntime: diagnostics.aiTools.placeholderItems,
    formulaCalculatorCandidates: diagnostics.calculators.placeholderItems.filter((row) => {
      const slug = row.slug.toLowerCase();
      return slug.includes("calculator") || slug.includes("budget") || slug.includes("rate") ||
        slug.includes("cost") || slug.includes("revenue") || slug.includes("probability");
    }),
  };
}

export async function getRepairPreview() {
  const supabase = getSupabaseAdmin();
  const tables: Array<"tools" | "calculators" | "ai_tools"> = ["tools", "calculators", "ai_tools"];
  const preview: RepairPreviewRow[] = [];

  for (const table of tables) {
    const { data, error } = await supabase
      .from(table)
      .select("id, name, slug, description, engine_type, engine_config")
      .order("id", { ascending: false });

    if (error) throw new Error(error.message);

    const rows = normalizeRows(data as ReviewRow[]);
    // Include ALL placeholders: null engine, generic-directory, OR dead engine type
    const needsRepair = rows.filter((row) => isPlaceholder(row.engine_type, table));
    const category = mapTableToCategory(table);
    const liveEngines = getLiveEngines(table);

    for (const row of needsRepair) {
      const suggestion = suggestAdminEngine(category, {
        name: row.name,
        slug: row.slug,
        description: row.description || "",
        engine_type: row.engine_type,
        engine_config: row.engine_config || {},
      });

      // Also try inferEngineType directly from slug as a second opinion
      const inferred = inferEngineType(category, row.slug);
      const bestEngine = (suggestion.engine_type && liveEngines.has(suggestion.engine_type))
        ? suggestion.engine_type
        : (inferred && liveEngines.has(inferred) ? inferred : suggestion.engine_type);

      const fixable = Boolean(bestEngine && liveEngines.has(bestEngine) && bestEngine !== "generic-directory");

      preview.push({
        table,
        id: row.id,
        name: row.name,
        slug: row.slug,
        current_engine_type: row.engine_type || null,
        suggested_engine_type: bestEngine || null,
        fixable,
        suggested_engine_config: suggestion.engine_config || {},
        repair_reason: fixable
          ? `Slug "${row.slug}" maps to live engine "${bestEngine}"`
          : `No live renderer found for "${row.engine_type || "null"}" — needs manual assignment`,
      });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    items: preview,
    summary: {
      total: preview.length,
      fixable: preview.filter((item) => item.fixable).length,
      notFixable: preview.filter((item) => !item.fixable).length,
    },
  };
}

export async function getEnginePreview(input: {
  category: Category;
  name: string;
  slug: string;
  description: string;
}) {
  const suggestion = suggestAdminEngine(input.category, {
    name: input.name,
    slug: input.slug,
    description: input.description,
  });

  return {
    generatedAt: new Date().toISOString(),
    input,
    suggestion,
  };
}

export async function getBulkPreview(input: {
  topic: string;
  type: BulkType;
}) {
  const items = await generateIdeas(input.topic, input.type);
  return {
    generatedAt: new Date().toISOString(),
    input,
    count: items.length,
    items,
  };
}