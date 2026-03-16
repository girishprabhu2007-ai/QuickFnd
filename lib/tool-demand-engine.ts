import { getSupabaseAdmin, safeSlug } from "@/lib/admin-publishing";
import { getSupportedToolEngineTypes, normalizeBulkGeneratedTool } from "@/lib/tool-bulk-generator";

export type DemandSuggestion = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
  demand_score: number;
  demand_reason: string;
};

type UsageRow = {
  item_slug: string;
  item_type: string;
  event_type: string;
  created_at: string;
};

type RequestRow = {
  requested_name: string | null;
  requested_category: string | null;
  description: string | null;
  ai_verdict: string | null;
  recommended_engine: string | null;
};

type ExistingToolRow = {
  slug: string;
  name: string;
  engine_type: string | null;
};

function monthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function getDemandSignals() {
  const supabaseAdmin = getSupabaseAdmin();

  const [toolsRes, requestsRes, usageRes] = await Promise.all([
    supabaseAdmin.from("tools").select("slug,name,engine_type"),
    supabaseAdmin
      .from("tool_requests")
      .select("requested_name,requested_category,description,ai_verdict,recommended_engine")
      .order("created_at", { ascending: false })
      .limit(500),
    supabaseAdmin
      .from("usage_events")
      .select("item_slug,item_type,event_type,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  if (toolsRes.error) throw new Error(toolsRes.error.message);
  if (requestsRes.error) throw new Error(requestsRes.error.message);
  if (usageRes.error) throw new Error(usageRes.error.message);

  const existingTools = (toolsRes.data || []) as ExistingToolRow[];
  const requests = (requestsRes.data || []) as RequestRow[];
  const usage = (usageRes.data || []) as UsageRow[];

  const currentMonth = monthKey(new Date().toISOString());

  const topUsage = usage
    .filter((row) => row.item_type === "tool")
    .reduce<Record<string, { total: number; thisMonth: number }>>((acc, row) => {
      const key = row.item_slug;
      acc[key] = acc[key] || { total: 0, thisMonth: 0 };
      acc[key].total += 1;
      if (monthKey(row.created_at) === currentMonth) {
        acc[key].thisMonth += 1;
      }
      return acc;
    }, {});

  return {
    existingTools,
    requests,
    topUsage,
    supportedEngineTypes: getSupportedToolEngineTypes(),
  };
}

export function parseDemandSuggestions(raw: string): DemandSuggestion[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return normalizeDemandPayload(parsed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return [];

    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return normalizeDemandPayload(parsed);
    } catch {
      return [];
    }
  }
}

function normalizeDemandPayload(parsed: unknown): DemandSuggestion[] {
  let items: unknown[] = [];

  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    "items" in parsed &&
    Array.isArray((parsed as { items?: unknown[] }).items)
  ) {
    items = (parsed as { items: unknown[] }).items;
  }

  return items
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const base = normalizeBulkGeneratedTool(record);
      if (!base) return null;

      const demand_score = Math.max(
        1,
        Math.min(100, Number(record.demand_score) || 50)
      );

      const demand_reason = String(record.demand_reason || "").trim();

      return {
        ...base,
        demand_score,
        demand_reason,
      };
    })
    .filter((item): item is DemandSuggestion => Boolean(item));
}

export function filterSupportedDemandSuggestions(items: DemandSuggestion[]) {
  const supported = new Set(getSupportedToolEngineTypes());
  return items.filter((item) => supported.has(item.engine_type as never));
}

export function filterNewDemandSuggestions(
  items: DemandSuggestion[],
  existingTools: { slug: string }[]
) {
  const existing = new Set(existingTools.map((item) => item.slug));
  return items.filter((item) => !existing.has(item.slug));
}

export function normalizeSelectedDemandTools(input: unknown): DemandSuggestion[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const base = normalizeBulkGeneratedTool(record);
      if (!base) return null;

      return {
        ...base,
        demand_score: Math.max(1, Math.min(100, Number(record.demand_score) || 50)),
        demand_reason: String(record.demand_reason || "").trim(),
      };
    })
    .filter((item): item is DemandSuggestion => Boolean(item));
}

export function buildRelatedSlugsFromTheme(theme: string) {
  const root = safeSlug(theme);
  if (!root) return [];

  return [
    `${root}-tools`,
    `${root}-generator`,
    `${root}-checker`,
    `${root}-converter`,
  ];
}