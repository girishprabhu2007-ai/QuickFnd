import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";

type ToolRow = {
  id: number;
  name: string;
  slug: string;
  engine_type: string | null;
  description?: string | null;
};

type CalculatorRow = {
  id: number;
  name: string;
  slug: string;
};

type AIToolRow = {
  id: number;
  name: string;
  slug: string;
};

type RequestRow = {
  id: number;
  requested_name: string | null;
  requested_category: string | null;
  description: string | null;
  status: string | null;
  created_public_slug: string | null;
  recommended_engine: string | null;
};

type UsageRow = {
  item_slug: string;
  item_type: string;
  event_type: string;
  created_at: string;
};

type MonthlyUsagePoint = {
  month: string;
  total: number;
  tools: number;
  calculators: number;
  aiTools: number;
};

type TopToolItem = {
  name: string;
  slug: string;
  engine_type: string;
  total: number;
  thisMonth: number;
};

type EnginePerformanceItem = {
  engine_type: string;
  tool_count: number;
  total_usage: number;
  avg_usage_per_tool: number;
  top_tool_slug: string;
};

type NichePerformanceItem = {
  key: string;
  label: string;
  tool_count: number;
  total_usage: number;
};

type DemandGapItem = {
  niche_key: string;
  label: string;
  demand_score: number;
  request_mentions: number;
  live_tool_count: number;
  recommended_engine_types: string[];
  example_ideas: string[];
};

function monthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

function monthLabelFromKey(key: string) {
  const [year, month] = key.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getLastMonthKeys(count: number) {
  const keys: string[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    keys.push(
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`
    );
  }

  return keys;
}

const DEMAND_NICHES = [
  {
    niche_key: "youtube-video-tools",
    label: "YouTube & Video",
    patterns: [/\byoutube\b/i, /\bvideo\b/i, /\bthumbnail\b/i, /\bchannel\b/i, /\btag\b/i],
    recommended_engine_types: ["text-case-converter", "word-counter", "slug-generator"],
    example_ideas: [
      "YouTube Title Case Converter",
      "YouTube Description Word Counter",
      "YouTube Slug Generator",
    ],
  },
  {
    niche_key: "seo-marketing-tools",
    label: "SEO & Marketing",
    patterns: [/\bseo\b/i, /\bmeta\b/i, /\bkeyword\b/i, /\btitle\b/i, /\bheadline\b/i],
    recommended_engine_types: ["slug-generator", "text-transformer", "word-counter"],
    example_ideas: [
      "SEO Title Slug Generator",
      "Meta Title Length Checker",
      "Keyword Density Counter",
    ],
  },
  {
    niche_key: "developer-tools",
    label: "Developer Tools",
    patterns: [/\bjson\b/i, /\bregex\b/i, /\bhash\b/i, /\bsha\b/i, /\bmd5\b/i, /\buuid\b/i, /\btimestamp\b/i],
    recommended_engine_types: ["json-formatter", "regex-tester", "sha256-generator"],
    example_ideas: [
      "JSON Pretty Printer",
      "Regex Match Tester",
      "SHA256 Generator",
    ],
  },
  {
    niche_key: "encoders-converters",
    label: "Encoders & Converters",
    patterns: [/\bbase64\b/i, /\bencode\b/i, /\bdecode\b/i, /\bhex\b/i, /\brgb\b/i, /\bbinary\b/i],
    recommended_engine_types: ["base64-encoder", "base64-decoder", "hex-to-rgb"],
    example_ideas: [
      "Base64 Decoder",
      "Hex To RGB Converter",
      "Binary To Text Converter",
    ],
  },
  {
    niche_key: "text-writing-tools",
    label: "Text & Writing",
    patterns: [/\btext\b/i, /\bword\b/i, /\bcase\b/i, /\bwriting\b/i, /\bcontent\b/i, /\bblog\b/i],
    recommended_engine_types: ["word-counter", "text-case-converter", "text-transformer"],
    example_ideas: [
      "Word Counter",
      "Title Case Converter",
      "Blog Paragraph Counter",
    ],
  },
];

export async function getToolPerformanceIntelligence() {
  const supabaseAdmin = getSupabaseAdmin();

  const [
    toolsRes,
    calculatorsRes,
    aiToolsRes,
    requestsRes,
    usageRes,
  ] = await Promise.all([
    supabaseAdmin
      .from("tools")
      .select("id,name,slug,engine_type,description")
      .order("id", { ascending: false }),
    supabaseAdmin
      .from("calculators")
      .select("id,name,slug")
      .order("id", { ascending: false }),
    supabaseAdmin
      .from("ai_tools")
      .select("id,name,slug")
      .order("id", { ascending: false }),
    supabaseAdmin
      .from("tool_requests")
      .select("id,requested_name,requested_category,description,status,created_public_slug,recommended_engine")
      .order("id", { ascending: false })
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

  const tools = (toolsRes.data || []) as ToolRow[];
  const calculators = (calculatorsRes.data || []) as CalculatorRow[];
  const aiTools = (aiToolsRes.data || []) as AIToolRow[];
  const requests = (requestsRes.data || []) as RequestRow[];
  const usage = (usageRes.data || []) as UsageRow[];

  const implementedRequests = requests.filter(
    (item) => item.status === "implemented" || item.created_public_slug
  ).length;

  const counts = {
    tools: tools.length,
    calculators: calculators.length,
    aiTools: aiTools.length,
    total: tools.length + calculators.length + aiTools.length,
    requests: requests.length,
    implementedRequests,
  };

  const recent = {
    tools: tools.slice(0, 5).map((item) => ({ name: item.name, slug: item.slug })),
    calculators: calculators.slice(0, 5).map((item) => ({ name: item.name, slug: item.slug })),
    aiTools: aiTools.slice(0, 5).map((item) => ({ name: item.name, slug: item.slug })),
  };

  const currentMonth = monthKey(new Date().toISOString());

  const usageByToolSlug = new Map<string, { total: number; thisMonth: number }>();
  for (const row of usage) {
    if (row.item_type !== "tool") continue;
    const current = usageByToolSlug.get(row.item_slug) || { total: 0, thisMonth: 0 };
    current.total += 1;
    if (monthKey(row.created_at) === currentMonth) {
      current.thisMonth += 1;
    }
    usageByToolSlug.set(row.item_slug, current);
  }

  const topTools: TopToolItem[] = tools
    .map((tool) => {
      const metrics = usageByToolSlug.get(tool.slug) || { total: 0, thisMonth: 0 };
      return {
        name: tool.name,
        slug: tool.slug,
        engine_type: tool.engine_type || "generic-directory",
        total: metrics.total,
        thisMonth: metrics.thisMonth,
      };
    })
    .sort((a, b) => {
      if (b.total !== a.total) return b.total - a.total;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 10);

  const lastMonths = getLastMonthKeys(6);
  const monthlyMap = new Map<string, MonthlyUsagePoint>();

  for (const key of lastMonths) {
    monthlyMap.set(key, {
      month: monthLabelFromKey(key),
      total: 0,
      tools: 0,
      calculators: 0,
      aiTools: 0,
    });
  }

  for (const row of usage) {
    const key = monthKey(row.created_at);
    const bucket = monthlyMap.get(key);
    if (!bucket) continue;

    bucket.total += 1;
    if (row.item_type === "tool") bucket.tools += 1;
    if (row.item_type === "calculator") bucket.calculators += 1;
    if (row.item_type === "ai-tool") bucket.aiTools += 1;
  }

  const monthlyUsage = Array.from(monthlyMap.values());

  const engineCounts = new Map<string, { tool_count: number; total_usage: number; top_tool_slug: string; top_tool_usage: number }>();

  for (const tool of tools) {
    const engineType = tool.engine_type || "generic-directory";
    const usageMetrics = usageByToolSlug.get(tool.slug) || { total: 0, thisMonth: 0 };
    const current = engineCounts.get(engineType) || {
      tool_count: 0,
      total_usage: 0,
      top_tool_slug: "",
      top_tool_usage: 0,
    };

    current.tool_count += 1;
    current.total_usage += usageMetrics.total;

    if (usageMetrics.total > current.top_tool_usage) {
      current.top_tool_usage = usageMetrics.total;
      current.top_tool_slug = tool.slug;
    }

    engineCounts.set(engineType, current);
  }

  const enginePerformance: EnginePerformanceItem[] = Array.from(engineCounts.entries())
    .map(([engine_type, value]) => ({
      engine_type,
      tool_count: value.tool_count,
      total_usage: value.total_usage,
      avg_usage_per_tool:
        value.tool_count > 0
          ? Number((value.total_usage / value.tool_count).toFixed(2))
          : 0,
      top_tool_slug: value.top_tool_slug,
    }))
    .sort((a, b) => {
      if (b.total_usage !== a.total_usage) return b.total_usage - a.total_usage;
      return a.engine_type.localeCompare(b.engine_type);
    });

  const taxonomy = buildHomepageTaxonomy({
    tools: tools.map((item) => ({
      slug: item.slug,
      name: item.name,
    })),
    calculators: [],
    aiTools: [],
  });

  const nichePerformance: NichePerformanceItem[] = taxonomy.tools.map((group) => {
    let total_usage = 0;

    for (const item of group.items) {
      total_usage += usageByToolSlug.get(item.slug)?.total || 0;
    }

    return {
      key: group.key,
      label: group.label,
      tool_count: group.count,
      total_usage,
    };
  }).sort((a, b) => {
    if (b.total_usage !== a.total_usage) return b.total_usage - a.total_usage;
    if (b.tool_count !== a.tool_count) return b.tool_count - a.tool_count;
    return a.label.localeCompare(b.label);
  });

  const requestText = requests.map((item) => {
    return `${item.requested_name || ""} ${item.description || ""} ${item.recommended_engine || ""}`;
  });

  const demandGaps: DemandGapItem[] = DEMAND_NICHES.map((niche) => {
    let request_mentions = 0;
    for (const text of requestText) {
      const matched = niche.patterns.some((pattern) => pattern.test(text));
      if (matched) request_mentions += 1;
    }

    const liveNiche = nichePerformance.find((item) => item.key === niche.niche_key);
    const live_tool_count = liveNiche?.tool_count || 0;

    const demand_score = Math.max(
      0,
      Math.min(100, request_mentions * 12 + Math.max(0, 20 - live_tool_count * 3))
    );

    return {
      niche_key: niche.niche_key,
      label: niche.label,
      demand_score,
      request_mentions,
      live_tool_count,
      recommended_engine_types: niche.recommended_engine_types,
      example_ideas: niche.example_ideas,
    };
  }).sort((a, b) => b.demand_score - a.demand_score);

  return {
    counts,
    recent,
    topTools,
    monthlyUsage,
    enginePerformance: enginePerformance.slice(0, 12),
    nichePerformance: nichePerformance.slice(0, 12),
    demandGaps,
  };
}