import { getSupabaseAdmin } from "@/lib/admin-publishing";

type BaseRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type AuditSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  itemsWithMissingEngine: BaseRow[];
  recentItems: BaseRow[];
};

type EngineUsageRow = {
  engine_type: string;
  count: number;
};

type AuditPayload = {
  generatedAt: string;
  tools: AuditSection;
  calculators: AuditSection;
  aiTools: AuditSection;
  engineUsage: {
    tools: EngineUsageRow[];
    calculators: EngineUsageRow[];
    aiTools: EngineUsageRow[];
  };
  formulaCalculatorCandidates: BaseRow[];
  aiToolConfigs: Array<{
    slug: string;
    name: string;
    engine_type: string | null;
    engine_config: Record<string, unknown> | null;
  }>;
};

function normalizeRows(rows: BaseRow[] | null | undefined): BaseRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    engine_type: row.engine_type || null,
    engine_config:
      row.engine_config && typeof row.engine_config === "object" && !Array.isArray(row.engine_config)
        ? row.engine_config
        : {},
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,
  }));
}

function buildSection(rows: BaseRow[]): AuditSection {
  const normalized = normalizeRows(rows);
  const missing = normalized.filter((row) => !row.engine_type);
  const withEngine = normalized.length - missing.length;

  return {
    total: normalized.length,
    withEngine,
    missingEngine: missing.length,
    itemsWithMissingEngine: missing.slice(0, 50),
    recentItems: normalized.slice(0, 25),
  };
}

function buildEngineUsage(rows: BaseRow[]): EngineUsageRow[] {
  const counts = new Map<string, number>();

  for (const row of normalizeRows(rows)) {
    const key = String(row.engine_type || "").trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([engine_type, count]) => ({ engine_type, count }))
    .sort((a, b) => b.count - a.count);
}

function getFormulaCalculatorCandidates(rows: BaseRow[]): BaseRow[] {
  const normalized = normalizeRows(rows);

  return normalized.filter((row) => {
    if (row.engine_type) return false;

    const slug = row.slug.toLowerCase();

    return (
      slug.includes("calculator") ||
      slug.includes("estimator") ||
      slug.includes("budget") ||
      slug.includes("cost") ||
      slug.includes("time") ||
      slug.includes("rate") ||
      slug.includes("revenue") ||
      slug.includes("probability") ||
      slug.includes("optimization") ||
      slug.includes("share") ||
      slug.includes("growth")
    );
  });
}

export async function getReviewAuditData(): Promise<AuditPayload> {
  const supabase = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes] = await Promise.all([
    supabase
      .from("tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at, updated_at")
      .order("id", { ascending: false }),
    supabase
      .from("calculators")
      .select("id, name, slug, description, engine_type, engine_config, created_at, updated_at")
      .order("id", { ascending: false }),
    supabase
      .from("ai_tools")
      .select("id, name, slug, description, engine_type, engine_config, created_at, updated_at")
      .order("id", { ascending: false }),
  ]);

  if (toolsRes.error) {
    throw new Error(`Tools audit query failed: ${toolsRes.error.message}`);
  }

  if (calculatorsRes.error) {
    throw new Error(`Calculators audit query failed: ${calculatorsRes.error.message}`);
  }

  if (aiToolsRes.error) {
    throw new Error(`AI tools audit query failed: ${aiToolsRes.error.message}`);
  }

  const tools = normalizeRows(toolsRes.data as BaseRow[]);
  const calculators = normalizeRows(calculatorsRes.data as BaseRow[]);
  const aiTools = normalizeRows(aiToolsRes.data as BaseRow[]);

  return {
    generatedAt: new Date().toISOString(),
    tools: buildSection(tools),
    calculators: buildSection(calculators),
    aiTools: buildSection(aiTools),
    engineUsage: {
      tools: buildEngineUsage(tools),
      calculators: buildEngineUsage(calculators),
      aiTools: buildEngineUsage(aiTools),
    },
    formulaCalculatorCandidates: getFormulaCalculatorCandidates(calculators).slice(0, 100),
    aiToolConfigs: aiTools.slice(0, 100).map((row) => ({
      slug: row.slug,
      name: row.name,
      engine_type: row.engine_type || null,
      engine_config: row.engine_config || {},
    })),
  };
}