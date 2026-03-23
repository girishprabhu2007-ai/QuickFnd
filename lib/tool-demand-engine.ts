import { getSupabaseAdmin, safeSlug } from "@/lib/admin-publishing";
import {
  getSupportedToolEngineTypes,
  normalizeBulkGeneratedTool,
} from "@/lib/tool-bulk-generator";

export type DemandContentType = "tools" | "calculators" | "ai_tools";

export type DemandSuggestion = {
  content_type: DemandContentType;
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

type ExistingItemRow = {
  slug: string;
  name: string;
  engine_type?: string | null;
};

function monthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function normalizeContentType(value: unknown): DemandContentType {
  const input = String(value || "").trim().toLowerCase();

  if (input === "calculator" || input === "calculators") return "calculators";
  if (input === "ai" || input === "ai_tool" || input === "ai_tools") return "ai_tools";
  return "tools";
}

export async function getDemandSignals(contentType: DemandContentType = "tools") {
  const supabaseAdmin = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes, requestsRes, usageRes] = await Promise.all([
    supabaseAdmin.from("tools").select("slug,name,engine_type"),
    supabaseAdmin.from("calculators").select("slug,name"),
    supabaseAdmin.from("ai_tools").select("slug,name"),
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
  if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
  if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);
  if (requestsRes.error) throw new Error(requestsRes.error.message);
  if (usageRes.error) throw new Error(usageRes.error.message);

  const tools = (toolsRes.data || []) as ExistingItemRow[];
  const calculators = (calculatorsRes.data || []) as ExistingItemRow[];
  const aiTools = (aiToolsRes.data || []) as ExistingItemRow[];
  const requests = (requestsRes.data || []) as RequestRow[];
  const usage = (usageRes.data || []) as UsageRow[];

  const currentMonth = monthKey(new Date().toISOString());

  const mappedItemType =
    contentType === "tools"
      ? "tool"
      : contentType === "calculators"
      ? "calculator"
      : "ai_tool";

  const topUsage = usage
    .filter((row) => row.item_type === mappedItemType)
    .reduce<Record<string, { total: number; thisMonth: number }>>((acc, row) => {
      const key = row.item_slug;
      acc[key] = acc[key] || { total: 0, thisMonth: 0 };
      acc[key].total += 1;
      if (monthKey(row.created_at) === currentMonth) {
        acc[key].thisMonth += 1;
      }
      return acc;
    }, {});

  const existingItems =
    contentType === "tools"
      ? tools
      : contentType === "calculators"
      ? calculators
      : aiTools;

  return {
    contentType,
    existingItems,
    requests,
    topUsage,
    supportedEngineTypes: getSupportedToolEngineTypes(),
  };
}

export function parseDemandSuggestions(
  raw: string,
  contentType: DemandContentType = "tools"
): DemandSuggestion[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return normalizeDemandPayload(parsed, contentType);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return [];

    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return normalizeDemandPayload(parsed, contentType);
    } catch {
      return [];
    }
  }
}

function normalizeDemandPayload(
  parsed: unknown,
  contentType: DemandContentType
): DemandSuggestion[] {
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

  const normalized = items.map((item): DemandSuggestion | null => {
    const record = (item ?? {}) as Record<string, unknown>;

    const name = String(record.name || "").trim();
    const slug = safeSlug(String(record.slug || name));
    const description = String(record.description || "").trim();
    const demand_score = Math.max(
      1,
      Math.min(100, Number(record.demand_score) || 50)
    );
    const demand_reason = String(record.demand_reason || "").trim();
    const normalizedType = normalizeContentType(record.content_type || contentType);

    if (!name || !slug) return null;

    if (normalizedType === "tools") {
      const base = normalizeBulkGeneratedTool(record);
      if (!base) return null;

      return {
        ...base,
        content_type: "tools",
        demand_score,
        demand_reason,
      };
    }

    return {
      content_type: normalizedType,
      name,
      slug,
      description: description || `${name} on QuickFnd.`,
      related_slugs: [],
      engine_type: "",
      engine_config: {},
      demand_score,
      demand_reason,
    };
  });

  return normalized.filter(
    (item): item is DemandSuggestion => item !== null
  );
}

export function filterSupportedDemandSuggestions(
  items: DemandSuggestion[],
  contentType: DemandContentType = "tools"
) {
  if (contentType !== "tools") {
    return items.filter((item) => item.content_type === contentType);
  }

  const supported = new Set(getSupportedToolEngineTypes());
  return items.filter(
    (item) =>
      item.content_type === "tools" &&
      Boolean(item.name) &&
      Boolean(item.slug) &&
      supported.has(item.engine_type as never)
  );
}

export function filterNewDemandSuggestions(
  items: DemandSuggestion[],
  existingItems: { slug: string }[]
) {
  const existing = new Set(existingItems.map((item) => item.slug));
  return items.filter((item) => !existing.has(item.slug));
}

export function normalizeSelectedDemandTools(input: unknown): DemandSuggestion[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const content_type = normalizeContentType(record.content_type);
      return normalizeDemandPayload([record], content_type)[0] || null;
    })
    .filter((item): item is DemandSuggestion => item !== null);
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