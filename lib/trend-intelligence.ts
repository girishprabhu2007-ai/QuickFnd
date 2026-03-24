/**
 * lib/trend-intelligence.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Core intelligence engine for QuickFnd's autonomous content pipeline.
 * 
 * Sources (all free or very cheap):
 *  1. Google Autocomplete — free, no key, real-time completions
 *  2. Google Search Console — free, your own query data
 *  3. Serper.dev — People Also Ask + related searches (~$3/month)
 * 
 * Architecture: collect signals → score gaps → queue for generation
 */

import { createClient } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

export type TrendSignal = {
  query: string;
  source: "search_console" | "autocomplete" | "serper" | "dataforseo" | "manual";
  volume: number;
  growth_pct: number;
  geo: string;
  category: string;
  related_queries: string[];
  raw_data: Record<string, unknown>;
  date_bucket: string;
};

export type DemandGap = {
  query: string;
  suggested_name: string;
  suggested_slug: string;
  suggested_category: "tool" | "calculator" | "ai_tool";
  suggested_engine: string;
  demand_score: number;
  search_volume: number;
  gap_score: number;
  sources: string[];
};

// ─── Seed keywords — global coverage across all major English-speaking markets ─
// These are the root queries we expand via autocomplete

// Global seed keywords — covers all major markets (US, UK, EU, IN, AU, CA)
const SEED_KEYWORDS = {
  tools: [
    "free online tool",
    "browser based tool",
    "developer tool online",
    "text tool online free",
    "converter online free",
    "generator online free",
    "formatter online free",
    "encoder decoder online",
    "password tool online",
    "code tool online",
    "file converter online",
    "image tool online free",
  ],
  calculators: [
    "calculator online free",
    "finance calculator",
    "tax calculator online",
    "salary calculator",
    "loan calculator online",
    "investment calculator",
    "health calculator online",
    "math calculator free",
    "percentage calculator",
    "mortgage calculator",
    "compound interest calculator",
    "retirement calculator",
  ],
  ai_tools: [
    "ai writing tool free",
    "ai text generator online",
    "ai content tool free",
    "free ai tools online",
    "chatgpt alternative free",
    "ai summarizer online",
    "ai paraphraser free",
    "ai grammar checker",
  ],
};

// Map query patterns to engine types for auto-assignment
const ENGINE_PATTERNS: { pattern: RegExp; engine: string; category: "tool" | "calculator" | "ai_tool" }[] = [
  { pattern: /word count|character count|text count/i, engine: "word-counter", category: "tool" },
  { pattern: /password generator|random password/i, engine: "password-generator", category: "tool" },
  { pattern: /qr code|qr generator/i, engine: "qr-generator", category: "tool" },
  { pattern: /base64|encode decode/i, engine: "base64-encoder", category: "tool" },
  { pattern: /url encode|url decode/i, engine: "url-encoder", category: "tool" },
  { pattern: /json format|json beautify|json lint/i, engine: "json-formatter", category: "tool" },
  { pattern: /uuid|guid generator/i, engine: "uuid-generator", category: "tool" },
  { pattern: /slug generator|url slug/i, engine: "slug-generator", category: "tool" },
  { pattern: /md5|sha256|hash generator/i, engine: "sha256-generator", category: "tool" },
  { pattern: /color picker|hex color|rgb color/i, engine: "color-picker", category: "tool" },
  { pattern: /markdown editor|md editor/i, engine: "markdown-editor", category: "tool" },
  { pattern: /csv to json|csv convert/i, engine: "csv-to-json", category: "tool" },
  { pattern: /ip address|ip lookup|ip locator/i, engine: "ip-lookup", category: "tool" },
  { pattern: /regex test|regular expression/i, engine: "regex-tester", category: "tool" },
  { pattern: /timestamp|unix time|epoch/i, engine: "timestamp-converter", category: "tool" },
  { pattern: /unit convert|km to miles|celsius to fahrenheit/i, engine: "unit-converter", category: "tool" },
  { pattern: /random number|dice roll/i, engine: "number-generator", category: "tool" },
  { pattern: /case convert|uppercase|lowercase|title case/i, engine: "text-case-converter", category: "tool" },
  { pattern: /bmi calculator|body mass/i, engine: "bmi-calculator", category: "calculator" },
  { pattern: /emi calculator|loan emi/i, engine: "emi-calculator", category: "calculator" },
  { pattern: /gst calculator/i, engine: "gst-calculator", category: "calculator" },
  { pattern: /vat calculator|sales tax calculator/i, engine: "gst-calculator", category: "calculator" },
  { pattern: /mortgage calculator|home loan calculator/i, engine: "loan-calculator", category: "calculator" },
  { pattern: /retirement calculator|pension calculator/i, engine: "compound-interest-calculator", category: "calculator" },
  { pattern: /currency convert|exchange rate/i, engine: "currency-converter", category: "tool" },
  { pattern: /time zone|timezone convert/i, engine: "timestamp-converter", category: "tool" },
  { pattern: /word counter|character counter/i, engine: "word-counter", category: "tool" },
  { pattern: /lorem ipsum|placeholder text/i, engine: "text-transformer", category: "tool" },
  { pattern: /binary convert|binary to text/i, engine: "binary-to-text", category: "tool" },
  { pattern: /hex to rgb|rgb to hex|color convert/i, engine: "hex-to-rgb", category: "tool" },
  { pattern: /sip calculator|mutual fund sip/i, engine: "sip-calculator", category: "calculator" },
  { pattern: /fd calculator|fixed deposit/i, engine: "fd-calculator", category: "calculator" },
  { pattern: /ppf calculator|public provident/i, engine: "ppf-calculator", category: "calculator" },
  { pattern: /income tax|tax calculator/i, engine: "income-tax-calculator", category: "calculator" },
  { pattern: /hra calculator|house rent allowance/i, engine: "hra-calculator", category: "calculator" },
  { pattern: /compound interest/i, engine: "compound-interest-calculator", category: "calculator" },
  { pattern: /percentage calculator/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /age calculator/i, engine: "age-calculator", category: "calculator" },
  { pattern: /loan calculator|home loan/i, engine: "loan-calculator", category: "calculator" },
  { pattern: /simple interest/i, engine: "simple-interest-calculator", category: "calculator" },
  { pattern: /ai email|email writer|email generator/i, engine: "ai-email-writer", category: "ai_tool" },
  { pattern: /ai prompt|prompt generator|chatgpt prompt/i, engine: "ai-prompt-generator", category: "ai_tool" },
  { pattern: /blog outline|content outline/i, engine: "ai-blog-outline-generator", category: "ai_tool" },
  { pattern: /ai writer|content writer ai|article generator/i, engine: "openai-text-tool", category: "ai_tool" },
];

// ─── Supabase client ──────────────────────────────────────────────────────────

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Source 1: Google Autocomplete (free, no API key) ────────────────────────

export async function fetchGoogleAutocomplete(seed: string, geo = "US"): Promise<string[]> {
  try {
    const query = encodeURIComponent(seed);
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${query}&gl=${geo}&hl=en`;
    
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(5000),
    });
    
    if (!res.ok) return [];
    const data = await res.json() as [string, string[]];
    return Array.isArray(data[1]) ? data[1].slice(0, 10) : [];
  } catch {
    return [];
  }
}

// ─── Source 2: Search Console (your own data via API) ────────────────────────

export async function fetchSearchConsoleQueries(
  siteUrl: string,
  accessToken: string,
  daysBack = 28
): Promise<{ query: string; clicks: number; impressions: number; position: number }[]> {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - daysBack * 86400000).toISOString().split("T")[0];

    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 200,
          dimensionFilterGroups: [{
            filters: [{
              dimension: "country",
              operator: "equals",
              expression: "ind",
            }],
          }],
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (!res.ok) return [];
    const data = await res.json() as {
      rows?: { keys: string[]; clicks: number; impressions: number; position: number }[]
    };
    
    return (data.rows || []).map(row => ({
      query: row.keys[0],
      clicks: row.clicks,
      impressions: row.impressions,
      position: row.position,
    }));
  } catch {
    return [];
  }
}

// ─── Source 3: Serper.dev (People Also Ask + related) ────────────────────────

export async function fetchSerperSignals(
  query: string,
  apiKey: string
): Promise<{ relatedSearches: string[]; peopleAlsoAsk: string[] }> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: query,
        gl: "in",
        hl: "en",
        num: 10,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return { relatedSearches: [], peopleAlsoAsk: [] };
    const data = await res.json() as {
      relatedSearches?: { query: string }[];
      peopleAlsoAsk?: { question: string }[];
    };

    return {
      relatedSearches: (data.relatedSearches || []).map(r => r.query).slice(0, 8),
      peopleAlsoAsk: (data.peopleAlsoAsk || []).map(r => r.question).slice(0, 8),
    };
  } catch {
    return { relatedSearches: [], peopleAlsoAsk: [] };
  }
}

// ─── Gap analysis: score a query against existing tools ──────────────────────

export function inferEngineAndCategory(query: string): {
  engine: string;
  category: "tool" | "calculator" | "ai_tool";
} {
  const lower = query.toLowerCase();
  for (const { pattern, engine, category } of ENGINE_PATTERNS) {
    if (pattern.test(lower)) return { engine, category };
  }
  // Default inference
  if (/calculator|compute|calc/.test(lower)) return { engine: "formula-calculator", category: "calculator" };
  if (/ai |gpt|generate|write/.test(lower)) return { engine: "openai-text-tool", category: "ai_tool" };
  return { engine: "text-transformer", category: "tool" };
}

export function queryToSlug(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

export function queryToName(query: string): string {
  return query
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")
    .replace(/\bOnline\b/g, "")
    .replace(/\bFree\b/g, "")
    .replace(/\bBest\b/g, "")
    .trim();
}

export async function scoreGap(
  query: string,
  existingSlugs: string[],
  volume: number
): Promise<number> {
  const slug = queryToSlug(query);
  
  // Already exists as exact slug — no gap
  if (existingSlugs.some(s => s === slug)) return 0;
  
  // Very close match (first 2 words match an existing slug) — low score
  const firstTwoWords = slug.split("-").slice(0, 2).join("-");
  const closeMatch = firstTwoWords.length > 5 && existingSlugs.some(s => s.startsWith(firstTwoWords));
  if (closeMatch) return 5; // Still queue it but very low priority
  
  // High-intent universal keywords (applies globally)
  const intentBonus = /calculator|tool|generator|converter|checker|formatter|editor|maker|online|free/.test(query.toLowerCase()) ? 15 : 0;

  // Finance/tax keywords — high value globally
  const financeBonus = /tax|salary|mortgage|loan|interest|investment|retirement|pension|vat|gst|income/.test(query.toLowerCase()) ? 10 : 0;

  // Developer keywords — high global demand
  const devBonus = /json|regex|base64|uuid|hash|encode|decode|format|convert|api|code/.test(query.toLowerCase()) ? 10 : 0;

  // Volume-based score (capped at 50)
  const volumeScore = Math.min(50, Math.floor(volume / 100));
  
  return Math.min(100, volumeScore + intentBonus + financeBonus + devBonus + 20);
}

// ─── Main collection function ─────────────────────────────────────────────────

export async function collectTrendSignals(options: {
  serperApiKey?: string;
  searchConsoleToken?: string;
  searchConsoleSite?: string;
  maxSignals?: number;
}): Promise<{ collected: number; errors: string[] }> {
  const supabase = getSupabase();
  const dateBucket = new Date().toISOString().split("T")[0];
  const errors: string[] = [];
  let collected = 0;

  // ── Source 1: Google Autocomplete (always runs, free) ──
  const allSeeds = [
    ...SEED_KEYWORDS.tools,
    ...SEED_KEYWORDS.calculators,
    ...SEED_KEYWORDS.ai_tools,
  ];

  for (const seed of allSeeds.slice(0, options.maxSignals ? 15 : allSeeds.length)) {
    try {
      const suggestions = await fetchGoogleAutocomplete(seed);
      
      for (const suggestion of suggestions) {
        if (suggestion.length < 5 || suggestion.length > 80) continue;
        
        const { error } = await supabase.from("trend_signals").upsert({
          query: suggestion.toLowerCase().trim(),
          source: "autocomplete",
          volume: 0, // autocomplete doesn't give volume
          growth_pct: 0,
          geo: "GLOBAL",
          category: SEED_KEYWORDS.calculators.some(s => seed === s) ? "calculators" : 
                    SEED_KEYWORDS.ai_tools.some(s => seed === s) ? "ai_tools" : "tools",
          related_queries: [],
          raw_data: { seed },
          date_bucket: dateBucket,
        }, { onConflict: "query,source,date_bucket" });

        if (!error) collected++;
      }

      // Rate limit — be gentle
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      errors.push(`Autocomplete error for "${seed}": ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  // ── Source 2: Serper.dev (if API key provided) ──
  if (options.serperApiKey) {
    const serperSeeds = [
      "free online tools",
      "best online calculator",
      "online tools for developers",
      "free ai tools online",
      "text tools online",
      "converter tools free",
    ];

    for (const seed of serperSeeds) {
      try {
        const { relatedSearches, peopleAlsoAsk } = await fetchSerperSignals(seed, options.serperApiKey);
        const allQueries = [...relatedSearches, ...peopleAlsoAsk];

        for (const query of allQueries) {
          if (query.length < 5 || query.length > 100) continue;
          
          const { error } = await supabase.from("trend_signals").upsert({
            query: query.toLowerCase().trim(),
            source: "serper",
            volume: 100, // Serper signals indicate real search demand
            growth_pct: 0,
            geo: "GLOBAL",
            category: "tools",
            related_queries: [],
            raw_data: { seed, type: relatedSearches.includes(query) ? "related" : "paa" },
            date_bucket: dateBucket,
          }, { onConflict: "query,source,date_bucket" });

          if (!error) collected++;
        }

        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        errors.push(`Serper error: ${e instanceof Error ? e.message : "unknown"}`);
      }
    }
  }

  // ── Source 3: Search Console (if token provided) ──
  if (options.searchConsoleToken && options.searchConsoleSite) {
    try {
      const queries = await fetchSearchConsoleQueries(
        options.searchConsoleSite,
        options.searchConsoleToken
      );

      for (const row of queries) {
        // Focus on queries where we're ranking 4-20 (almost there, push them up)
        if (row.position < 4 || row.position > 50) continue;
        
        const { error } = await supabase.from("trend_signals").upsert({
          query: row.query.toLowerCase().trim(),
          source: "search_console",
          volume: row.impressions,
          growth_pct: 0,
          geo: "GLOBAL",
          category: "tools",
          related_queries: [],
          raw_data: { clicks: row.clicks, impressions: row.impressions, position: row.position },
          date_bucket: dateBucket,
        }, { onConflict: "query,source,date_bucket" });

        if (!error) collected++;
      }
    } catch (e) {
      errors.push(`Search Console error: ${e instanceof Error ? e.message : "unknown"}`);
    }
  }

  return { collected, errors };
}

// ─── Gap analysis function ────────────────────────────────────────────────────

export async function analyzeGaps(options: {
  minScore?: number;
  limit?: number;
}): Promise<{ queued: number; skipped: number }> {
  const supabase = getSupabase();
  const minScore = options.minScore ?? 30;
  const limit = options.limit ?? 50;

  // Get recent signals (last 7 days)
  const { data: signals } = await supabase
    .from("trend_signals")
    .select("query, source, volume, category")
    .gte("captured_at", new Date(Date.now() - 7 * 86400000).toISOString())
    .order("volume", { ascending: false })
    .limit(500);

  if (!signals?.length) return { queued: 0, skipped: 0 };

  // Get existing tool slugs
  const [{ data: tools }, { data: calcs }, { data: aiTools }] = await Promise.all([
    supabase.from("tools").select("slug, name"),
    supabase.from("calculators").select("slug, name"),
    supabase.from("ai_tools").select("slug, name"),
  ]);

  const existingSlugs = [
    ...(tools || []).map(t => t.slug),
    ...(calcs || []).map(c => c.slug),
    ...(aiTools || []).map(a => a.slug),
  ];

  // Get already queued slugs
  const { data: queued } = await supabase
    .from("demand_queue")
    .select("suggested_slug")
    .in("status", ["pending", "generating", "approved", "published"]);

  const queuedSlugs = new Set((queued || []).map(q => q.suggested_slug));

  let queuedCount = 0;
  let skipped = 0;

  // Deduplicate signals by query
  const uniqueSignals = new Map<string, typeof signals[0]>();
  for (const signal of signals) {
    const key = signal.query.toLowerCase().trim();
    if (!uniqueSignals.has(key)) uniqueSignals.set(key, signal);
  }

  for (const [, signal] of uniqueSignals) {
    if (queuedCount >= limit) break;

    const slug = queryToSlug(signal.query);
    if (queuedSlugs.has(slug)) { skipped++; continue; }

    const score = await scoreGap(signal.query, existingSlugs, signal.volume || 0);
    if (score < minScore) { skipped++; continue; }

    const { engine, category } = inferEngineAndCategory(signal.query);
    const name = queryToName(signal.query);

    const { error } = await supabase.from("demand_queue").upsert({
      query: signal.query,
      suggested_name: name,
      suggested_slug: slug,
      suggested_category: category,
      suggested_engine: engine,
      demand_score: score,
      search_volume: signal.volume || 0,
      gap_score: score,
      sources: [signal.source],
      status: "pending",
    }, { onConflict: "suggested_slug" });

    if (!error) queuedCount++;
    else skipped++;
  }

  return { queued: queuedCount, skipped };
}