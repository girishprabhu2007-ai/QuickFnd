import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { generateIdeas } from "@/lib/tool-bulk-generator";

type Category = "tool" | "calculator" | "ai-tool";
type BulkType = "tools" | "calculators" | "ai_tools";

export type ReviewRow = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  engine_type: string | null;
  engine_config: Record<string, unknown> | null;
  created_at?: string | null;
};

export type ReviewSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  genericDirectory: number;
  recentItems: ReviewRow[];
  missingItems: ReviewRow[];
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

function buildSection(rows: ReviewRow[]): ReviewSection {
  const normalized = normalizeRows(rows);
  const missingItems = normalized.filter((row) => !row.engine_type);
  const genericDirectoryItems = normalized.filter(
    (row) => String(row.engine_type || "").trim().toLowerCase() === "generic-directory"
  );

  return {
    total: normalized.length,
    withEngine: normalized.length - missingItems.length,
    missingEngine: missingItems.length,
    genericDirectory: genericDirectoryItems.length,
    recentItems: normalized.slice(0, 20),
    missingItems: missingItems.slice(0, 50),
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
    supabase
      .from("tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false }),
    supabase
      .from("calculators")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false }),
    supabase
      .from("ai_tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false }),
  ]);

  if (toolsRes.error) throw new Error(toolsRes.error.message);
  if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
  if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);

  const tools = normalizeRows(toolsRes.data as ReviewRow[]);
  const calculators = normalizeRows(calculatorsRes.data as ReviewRow[]);
  const aiTools = normalizeRows(aiToolsRes.data as ReviewRow[]);

  return {
    generatedAt: new Date().toISOString(),
    tools: buildSection(tools),
    calculators: buildSection(calculators),
    aiTools: buildSection(aiTools),
  };
}

export async function getRecentItems() {
  const supabase = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes] = await Promise.all([
    supabase
      .from("tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false })
      .limit(15),
    supabase
      .from("calculators")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false })
      .limit(15),
    supabase
      .from("ai_tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at")
      .order("id", { ascending: false })
      .limit(15),
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

  const formulaCalculatorCandidates = diagnostics.calculators.missingItems.filter((row) => {
    const slug = row.slug.toLowerCase();

    return (
      slug.includes("calculator") ||
      slug.includes("budget") ||
      slug.includes("rate") ||
      slug.includes("cost") ||
      slug.includes("revenue") ||
      slug.includes("probability") ||
      slug.includes("optimization") ||
      slug.includes("share") ||
      slug.includes("growth") ||
      slug.includes("time")
    );
  });

  return {
    generatedAt: new Date().toISOString(),
    toolsMissingRuntime: diagnostics.tools.missingItems,
    calculatorsMissingRuntime: diagnostics.calculators.missingItems,
    aiToolsMissingRuntime: diagnostics.aiTools.missingItems,
    formulaCalculatorCandidates,
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

    if (error) {
      throw new Error(error.message);
    }

    const rows = normalizeRows(data as ReviewRow[]);
    const missing = rows.filter((row) => !row.engine_type);

    for (const row of missing) {
      const category = mapTableToCategory(table);
      const suggestion = suggestAdminEngine(category, {
        name: row.name,
        slug: row.slug,
        description: row.description || "",
        engine_type: row.engine_type,
        engine_config: row.engine_config || {},
      });

      preview.push({
        table,
        id: row.id,
        name: row.name,
        slug: row.slug,
        current_engine_type: row.engine_type || null,
        suggested_engine_type: suggestion.engine_type || null,
        fixable: Boolean(
          suggestion.engine_type &&
            suggestion.engine_type !== "generic-directory" &&
            (category === "ai-tool" || suggestion.is_supported)
        ),
        suggested_engine_config: suggestion.engine_config || {},
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