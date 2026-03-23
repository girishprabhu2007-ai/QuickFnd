import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { filterVisibleTools } from "@/lib/visibility";
import { getSupportedToolEngineTypes } from "@/lib/tool-bulk-generator";

type ToolRow = {
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
};

type CalculatorRow = {
  name: string;
  slug: string;
  description?: string | null;
};

type AIToolRow = {
  name: string;
  slug: string;
  description?: string | null;
};

type UsageRow = {
  item_slug: string;
  item_type: string;
  created_at: string;
};

type RequestRow = {
  requested_name: string | null;
  requested_category: string | null;
  description: string | null;
  recommended_engine: string | null;
};

export type TopicOpportunity = {
  key: string;
  label: string;
  live_tool_count: number;
  total_usage: number;
  request_mentions: number;
  opportunity_score: number;
  recommended_engine_types: string[];
  example_ideas: string[];
};

const TOPIC_EXPANSION_RULES = [
  {
    key: "youtube-video-tools",
    label: "YouTube & Video",
    patterns: [/\byoutube\b/i, /\bvideo\b/i, /\bthumbnail\b/i, /\bchannel\b/i, /\bplaylist\b/i, /\bshorts\b/i],
    recommended_engine_types: ["word-counter", "slug-generator", "text-case-converter", "text-transformer"],
    example_ideas: [
      "YouTube Description Formatter",
      "YouTube Playlist Title Generator",
      "YouTube Thumbnail Text Formatter",
      "YouTube Channel Name Slug Generator",
    ],
  },
  {
    key: "seo-marketing-tools",
    label: "SEO & Marketing",
    patterns: [/\bseo\b/i, /\bmeta\b/i, /\bkeyword\b/i, /\btitle\b/i, /\bheadline\b/i, /\bmarketing\b/i],
    recommended_engine_types: ["slug-generator", "word-counter", "text-transformer"],
    example_ideas: [
      "Meta Description Formatter",
      "SEO Headline Case Converter",
      "Keyword Slug Generator",
      "SERP Snippet Length Checker",
    ],
  },
  {
    key: "developer-tools",
    label: "Developer Tools",
    patterns: [/\bjson\b/i, /\bregex\b/i, /\bhash\b/i, /\bsha\b/i, /\bmd5\b/i, /\buuid\b/i, /\btimestamp\b/i, /\bcode\b/i],
    recommended_engine_types: ["json-formatter", "regex-tester", "sha256-generator", "md5-generator", "timestamp-converter"],
    example_ideas: [
      "JSON Escape Checker",
      "Regex Group Extractor",
      "SHA256 Text Generator",
      "Unix Timestamp Formatter",
    ],
  },
  {
    key: "encoders-converters",
    label: "Encoders & Converters",
    patterns: [/\bbase64\b/i, /\bencode\b/i, /\bdecode\b/i, /\bhex\b/i, /\brgb\b/i, /\bbinary\b/i, /\bconvert\b/i],
    recommended_engine_types: ["base64-encoder", "base64-decoder", "hex-to-rgb", "rgb-to-hex", "text-to-binary", "binary-to-text"],
    example_ideas: [
      "Hex Color Decoder",
      "RGB Color Formatter",
      "Binary Message Decoder",
      "Base64 Text Encoder",
    ],
  },
  {
    key: "text-writing-tools",
    label: "Text & Writing",
    patterns: [/\btext\b/i, /\bword\b/i, /\bwriting\b/i, /\bwriter\b/i, /\bcontent\b/i, /\bblog\b/i, /\bparagraph\b/i, /\bcase\b/i],
    recommended_engine_types: ["word-counter", "text-case-converter", "text-transformer"],
    example_ideas: [
      "Paragraph Length Checker",
      "Blog Title Case Converter",
      "Content Word Counter",
      "Sentence Cleanup Tool",
    ],
  },
  {
    key: "generators",
    label: "Generators",
    patterns: [/\bgenerator\b/i, /\brandom\b/i, /\bpassword\b/i],
    recommended_engine_types: ["password-generator", "random-string-generator", "uuid-generator"],
    example_ideas: [
      "Secure Token Generator",
      "Random ID Generator",
      "Strong Password Generator",
      "UUID Batch Generator",
    ],
  },
] as const;

export async function getTopicExpansionIntelligence() {
  const supabaseAdmin = getSupabaseAdmin();

  const [toolsRes, calculatorsRes, aiToolsRes, usageRes, requestsRes] = await Promise.all([
    supabaseAdmin.from("tools").select("name,slug,description,engine_type"),
    supabaseAdmin.from("calculators").select("name,slug,description"),
    supabaseAdmin.from("ai_tools").select("name,slug,description"),
    supabaseAdmin
      .from("usage_events")
      .select("item_slug,item_type,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
    supabaseAdmin
      .from("tool_requests")
      .select("requested_name,requested_category,description,recommended_engine")
      .order("id", { ascending: false })
      .limit(500),
  ]);

  if (toolsRes.error) throw new Error(toolsRes.error.message);
  if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
  if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);
  if (usageRes.error) throw new Error(usageRes.error.message);
  if (requestsRes.error) throw new Error(requestsRes.error.message);

  const tools = filterVisibleTools((toolsRes.data || []) as unknown as import("@/lib/content-pages").PublicContentItem[]);
  const calculators = (calculatorsRes.data || []) as CalculatorRow[];
  const aiTools = (aiToolsRes.data || []) as AIToolRow[];
  const usage = (usageRes.data || []) as UsageRow[];
  const requests = (requestsRes.data || []) as RequestRow[];

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators,
    aiTools,
  });

  const toolUsageBySlug = new Map<string, number>();
  for (const row of usage) {
    if (row.item_type !== "tool") continue;
    toolUsageBySlug.set(row.item_slug, (toolUsageBySlug.get(row.item_slug) || 0) + 1);
  }

  const topicUsageByKey = new Map<string, number>();
  for (const group of taxonomy.tools) {
    let total = 0;
    for (const item of group.items) {
      total += toolUsageBySlug.get(item.slug) || 0;
    }
    topicUsageByKey.set(group.key, total);
  }

  const requestTexts = requests.map((item) =>
    `${item.requested_name || ""} ${item.description || ""} ${item.recommended_engine || ""}`.toLowerCase()
  );

  const supportedEngines = new Set<string>(getSupportedToolEngineTypes());

  const opportunities: TopicOpportunity[] = TOPIC_EXPANSION_RULES.map((rule) => {
    const liveGroup = taxonomy.tools.find((group) => group.key === rule.key);
    const live_tool_count = liveGroup?.count || 0;
    const total_usage = topicUsageByKey.get(rule.key) || 0;

    let request_mentions = 0;
    for (const text of requestTexts) {
      if (rule.patterns.some((pattern) => pattern.test(text))) {
        request_mentions += 1;
      }
    }

    const coveragePenalty = Math.max(0, 24 - live_tool_count * 3);
    const usageBoost = Math.min(30, Math.floor(total_usage / 3));
    const requestBoost = Math.min(40, request_mentions * 6);
    const opportunity_score = Math.max(
      0,
      Math.min(100, coveragePenalty + usageBoost + requestBoost)
    );

    return {
      key: rule.key,
      label: rule.label,
      live_tool_count,
      total_usage,
      request_mentions,
      opportunity_score,
      recommended_engine_types: rule.recommended_engine_types.filter((engine) =>
        supportedEngines.has(engine)
      ),
      example_ideas: [...rule.example_ideas],
    };
  }).sort((a, b) => {
    if (b.opportunity_score !== a.opportunity_score) return b.opportunity_score - a.opportunity_score;
    if (b.request_mentions !== a.request_mentions) return b.request_mentions - a.request_mentions;
    return a.label.localeCompare(b.label);
  });

  return {
    opportunities,
  };
}