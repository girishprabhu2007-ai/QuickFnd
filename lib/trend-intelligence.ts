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
// ─── Queries we cannot build (server-side, paid APIs, or out of scope) ─────────
// These are filtered OUT of the demand queue entirely

const UNBUILDABLE_PATTERNS = [
  // File conversion requiring server-side processing
  /mp4 to mp3|mp3 to mp4|convert mp4|convert mp3|youtube to mp3|youtube downloader/i,
  /pdf to word|word to pdf|pdf convert|compress pdf|merge pdf|split pdf/i,
  /jpg to pdf|png to pdf|pdf to jpg|image to pdf|pdf to image/i,
  /video convert|audio convert|compress video|compress image/i,
  /\bmp3\b|\bmp4\b|\bwav\b|\baac\b|\bflac\b|\bmkv\b|\bavi\b|\bmov\b/i,
  /excel to|to excel|docx to|to docx|ppt to|to ppt/i,
  // Requires live APIs / subscriptions
  /weather|stock price|cryptocurrency price|bitcoin price|forex live/i,
  /translate|google translate|language translate/i,
  /maps|directions|navigation|location finder/i,
  /flight|hotel|booking|travel planner/i,
  // Social media tools (no value)
  /instagram follower|tiktok follower|youtube subscriber/i,
  /social media post|tweet generator|hashtag generator/i,
  // Requires user accounts / data
  /resume builder|cv builder|invoice generator|receipt generator/i,
  /logo maker|banner maker|poster maker|flyer maker/i,
  // Out of scope
  /download|torrent|stream|watch online|free movie/i,
  /crack|hack|bypass|unlock/i,
];

export function isQueryBuildable(query: string): boolean {
  return !UNBUILDABLE_PATTERNS.some(p => p.test(query));
}

// ─── Engine pattern matching ──────────────────────────────────────────────────
// Maps query patterns to existing QuickFnd engine types

const ENGINE_PATTERNS: { pattern: RegExp; engine: string; category: "tool" | "calculator" | "ai_tool" }[] = [
  // ── Text tools ──
  { pattern: /word count|character count|text count|letter count/i, engine: "word-counter", category: "tool" },
  { pattern: /case convert|uppercase|lowercase|title case|camelcase|snake.?case/i, engine: "text-case-converter", category: "tool" },
  { pattern: /text transform|reverse text|flip text|mirror text/i, engine: "text-transformer", category: "tool" },
  { pattern: /remove space|trim text|clean text|remove line|remove duplicate/i, engine: "text-transformer", category: "tool" },
  { pattern: /count words|count characters|reading time/i, engine: "word-counter", category: "tool" },
  { pattern: /lorem ipsum|placeholder text|dummy text/i, engine: "text-transformer", category: "tool" },
  { pattern: /find replace|text replace|bulk replace/i, engine: "text-transformer", category: "tool" },
  { pattern: /sort lines|sort text|alphabetize/i, engine: "text-transformer", category: "tool" },

  // ── Developer / encoder tools ──
  { pattern: /base64 encode|base64 decode|encode base64|decode base64/i, engine: "base64-encoder", category: "tool" },
  { pattern: /url encode|url decode|percent encode|urlencode/i, engine: "url-encoder", category: "tool" },
  { pattern: /json format|json beautify|json lint|pretty print json|json minify/i, engine: "json-formatter", category: "tool" },
  { pattern: /json to csv|csv to json|json converter/i, engine: "csv-to-json", category: "tool" },
  { pattern: /uuid generator|guid generator|unique id/i, engine: "uuid-generator", category: "tool" },
  { pattern: /slug generator|url slug|permalink generator/i, engine: "slug-generator", category: "tool" },
  { pattern: /md5 hash|sha256|sha512|hash generator|checksum/i, engine: "sha256-generator", category: "tool" },
  { pattern: /password generator|random password|strong password/i, engine: "password-generator", category: "tool" },
  { pattern: /password strength|check password|password checker/i, engine: "password-strength-checker", category: "tool" },
  { pattern: /random string|random token|random key|api key generator/i, engine: "random-string-generator", category: "tool" },
  { pattern: /regex test|regular expression|regex checker|regex matcher/i, engine: "regex-tester", category: "tool" },
  { pattern: /markdown editor|md editor|markdown preview/i, engine: "markdown-editor", category: "tool" },
  { pattern: /ip address|ip lookup|ip locator|my ip|what is my ip/i, engine: "ip-lookup", category: "tool" },
  { pattern: /timestamp|unix time|epoch time|unix timestamp/i, engine: "timestamp-converter", category: "tool" },
  { pattern: /binary to|to binary|binary convert/i, engine: "text-transformer", category: "tool" },
  { pattern: /html encode|html decode|html escape|html entity/i, engine: "url-encoder", category: "tool" },
  { pattern: /number to word|words to number/i, engine: "text-transformer", category: "tool" },
  { pattern: /roman numeral|convert roman/i, engine: "text-transformer", category: "tool" },

  // ── Data / format tools ──
  { pattern: /qr code|qr generator|generate qr/i, engine: "qr-generator", category: "tool" },
  { pattern: /color picker|hex color|rgb to hex|hex to rgb|color convert|hsl color/i, engine: "color-picker", category: "tool" },
  { pattern: /barcode generator/i, engine: "qr-generator", category: "tool" },

  // ── Unit converters ──
  { pattern: /unit convert|length convert|weight convert|temperature convert/i, engine: "unit-converter", category: "tool" },
  { pattern: /km to miles|miles to km|meter to feet|feet to meter/i, engine: "unit-converter", category: "tool" },
  { pattern: /celsius to fahrenheit|fahrenheit to celsius|celsius to kelvin/i, engine: "unit-converter", category: "tool" },
  { pattern: /kg to lbs|lbs to kg|gram to ounce|pound to kilogram/i, engine: "unit-converter", category: "tool" },
  { pattern: /currency convert|exchange rate|dollar to rupee|usd to inr|usd to eur/i, engine: "currency-converter", category: "tool" },
  { pattern: /time zone|timezone convert|utc convert|ist to/i, engine: "timestamp-converter", category: "tool" },

  // ── Number / math ──
  { pattern: /random number|dice roll|number picker|lottery number/i, engine: "number-generator", category: "tool" },
  { pattern: /number format|format number|add comma/i, engine: "text-transformer", category: "tool" },

  // ── Finance calculators ──
  { pattern: /emi calculator|loan emi|equated monthly/i, engine: "emi-calculator", category: "calculator" },
  { pattern: /sip calculator|mutual fund|systematic investment/i, engine: "sip-calculator", category: "calculator" },
  { pattern: /gst calculator|goods and service tax/i, engine: "gst-calculator", category: "calculator" },
  { pattern: /vat calculator|sales tax calculator|tax calculator/i, engine: "gst-calculator", category: "calculator" },
  { pattern: /income tax|income tax calculator|it calculator/i, engine: "income-tax-calculator", category: "calculator" },
  { pattern: /fd calculator|fixed deposit|fd interest/i, engine: "fd-calculator", category: "calculator" },
  { pattern: /ppf calculator|public provident fund/i, engine: "ppf-calculator", category: "calculator" },
  { pattern: /hra calculator|house rent allowance/i, engine: "hra-calculator", category: "calculator" },
  { pattern: /mortgage calculator|home loan calculator|property loan/i, engine: "mortgage-calculator", category: "calculator" },
  { pattern: /loan calculator|personal loan|car loan|education loan/i, engine: "loan-calculator", category: "calculator" },
  { pattern: /compound interest|compound calculator/i, engine: "compound-interest-calculator", category: "calculator" },
  { pattern: /simple interest|si calculator/i, engine: "simple-interest-calculator", category: "calculator" },
  { pattern: /retirement calculator|pension calculator|nps calculator/i, engine: "retirement-calculator", category: "calculator" },
  { pattern: /investment calculator|return on investment|roi calculator/i, engine: "compound-interest-calculator", category: "calculator" },
  { pattern: /percentage calculator|percent calculator|percentage of/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /age calculator|date of birth|age from dob/i, engine: "age-calculator", category: "calculator" },
  { pattern: /salary calculator|take home salary|net salary|ctc calculator|in.hand salary/i, engine: "salary-calculator", category: "calculator" },
  { pattern: /tip calculator|split bill|restaurant bill/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /discount calculator|sale price|savings calculator/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /gpa calculator|grade calculator|cgpa/i, engine: "percentage-calculator", category: "calculator" },

  // ── Health calculators ──
  { pattern: /bmi calculator|body mass index|ideal weight/i, engine: "bmi-calculator", category: "calculator" },
  { pattern: /calorie calculator|bmr calculator|tdee calculator/i, engine: "bmi-calculator", category: "calculator" },
  { pattern: /body fat calculator|waist to hip/i, engine: "bmi-calculator", category: "calculator" },
  { pattern: /due date calculator|pregnancy calculator|ovulation/i, engine: "age-calculator", category: "calculator" },

  // ── Math calculators ──
  { pattern: /scientific calculator|advanced calculator|math calculator/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /fraction calculator|decimal to fraction|fraction simplify/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /area calculator|volume calculator|perimeter/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /speed calculator|distance calculator|time calculator/i, engine: "percentage-calculator", category: "calculator" },
  { pattern: /prime number|factor calculator|lcm calculator|gcd calculator/i, engine: "percentage-calculator", category: "calculator" },

  // ── Investment calculators (more specific) ──
  { pattern: /savings calculator|savings growth|save money/i, engine: "savings-calculator", category: "calculator" },
  { pattern: /roi calculator|return on investment/i, engine: "roi-calculator", category: "calculator" },
  { pattern: /cagr calculator|compound annual/i, engine: "cagr-calculator", category: "calculator" },
  { pattern: /gratuity calculator|gratuity amount/i, engine: "gratuity-calculator", category: "calculator" },
  { pattern: /fuel cost|petrol cost|trip cost|fuel calculator/i, engine: "fuel-cost-calculator", category: "calculator" },
  { pattern: /tip calculator|split bill/i, engine: "tip-calculator", category: "calculator" },
  { pattern: /discount calculator|sale price|percent off/i, engine: "discount-calculator", category: "calculator" },
  { pattern: /vat calculator/i, engine: "vat-calculator", category: "calculator" },
  { pattern: /sales tax/i, engine: "sales-tax-calculator", category: "calculator" },
  { pattern: /rd calculator|recurring deposit/i, engine: "rd-calculator", category: "calculator" },
  // ── Developer tools (more specific) ──
  { pattern: /barcode generator|barcode online/i, engine: "barcode-generator", category: "tool" },
  { pattern: /diff checker|code compare|text diff|compare code/i, engine: "diff-checker", category: "tool" },
  { pattern: /jwt decoder|jwt token|json web token/i, engine: "jwt-decoder", category: "tool" },
  { pattern: /cron expression|cron job|cron builder/i, engine: "cron-builder", category: "tool" },
  { pattern: /css gradient|gradient generator/i, engine: "css-gradient-generator", category: "tool" },
  { pattern: /box shadow|css shadow/i, engine: "box-shadow-generator", category: "tool" },
  { pattern: /email validator|validate email|check email/i, engine: "email-validator", category: "tool" },
  { pattern: /yaml to json|json to yaml/i, engine: "yaml-json-converter", category: "tool" },
  { pattern: /json to csv|csv from json/i, engine: "json-to-csv", category: "tool" },
  { pattern: /html minif|css minif|js minif|minify html|minify css/i, engine: "html-minifier", category: "tool" },
  { pattern: /robots.txt|robots txt generator/i, engine: "robots-txt-generator", category: "tool" },
  { pattern: /open graph|og preview|social preview/i, engine: "open-graph-tester", category: "tool" },
  { pattern: /color contrast|wcag contrast|contrast check/i, engine: "color-contrast-checker", category: "tool" },
  { pattern: /lorem ipsum|placeholder text/i, engine: "lorem-ipsum-generator", category: "tool" },
  { pattern: /binary|hexadecimal|octal|number base|base convert/i, engine: "number-base-converter", category: "tool" },
  { pattern: /html entity|html encode|html escape/i, engine: "html-entity-encoder", category: "tool" },
  { pattern: /string escape|escape string/i, engine: "string-escape-tool", category: "tool" },
  { pattern: /line sort|sort lines|remove duplicate lines/i, engine: "line-sorter", category: "tool" },

  // ── AI tools ──
  { pattern: /ai email|email writer ai|write email|email generator/i, engine: "ai-email-writer", category: "ai_tool" },
  { pattern: /ai prompt|prompt generator|chatgpt prompt|prompt writer/i, engine: "ai-prompt-generator", category: "ai_tool" },
  { pattern: /ai summarize|text summary|summarizer|tldr/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /ai paraphrase|paraphrasing tool|rewrite tool|rephrase/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /ai grammar|grammar checker|grammar fix|proofread/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /ai content|content generator|article generator|blog generator/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /ai outline|blog outline|content outline/i, engine: "ai-blog-outline-generator", category: "ai_tool" },
  { pattern: /ai writer|writing assistant|ai writing/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /cover letter|job application ai/i, engine: "ai-email-writer", category: "ai_tool" },
  { pattern: /product description|ai description|listing description/i, engine: "openai-text-tool", category: "ai_tool" },
  { pattern: /seo meta|meta description generator|title tag generator/i, engine: "openai-text-tool", category: "ai_tool" },
];

// ─── Engine inference ─────────────────────────────────────────────────────────

export function inferEngineAndCategory(query: string): {
  engine: string;
  category: "tool" | "calculator" | "ai_tool";
  confidence: "high" | "medium" | "low";
} {
  const lower = query.toLowerCase();

  // Check explicit patterns first
  for (const { pattern, engine, category } of ENGINE_PATTERNS) {
    if (pattern.test(lower)) return { engine, category, confidence: "high" };
  }

  // Smart fallback based on query structure
  // NOTE: formula-calculator requires a preset — never assign it as auto-fallback
  if (/calculator|compute|calc/.test(lower)) {
    return { engine: "percentage-calculator", category: "calculator", confidence: "medium" };
  }
  if (/ai |gpt|generate |write |summarize|paraphrase/.test(lower)) {
    return { engine: "openai-text-tool", category: "ai_tool", confidence: "medium" };
  }
  if (/convert|converter/.test(lower)) {
    return { engine: "unit-converter", category: "tool", confidence: "medium" };
  }
  if (/generator|maker|creator/.test(lower)) {
    return { engine: "qr-generator", category: "tool", confidence: "low" };
  }
  if (/checker|validator|tester/.test(lower)) {
    return { engine: "password-strength-checker", category: "tool", confidence: "low" };
  }
  if (/editor|formatter|beautifier/.test(lower)) {
    return { engine: "json-formatter", category: "tool", confidence: "low" };
  }
  if (/encoder|decoder|encode|decode/.test(lower)) {
    return { engine: "base64-encoder", category: "tool", confidence: "medium" };
  }

  // Final fallback — only use text-transformer for genuinely text-related queries
  if (/text|word|string|character|line/.test(lower)) {
    return { engine: "text-transformer", category: "tool", confidence: "low" };
  }

  // Default: word-counter is safer than text-transformer for unknown tools
  return { engine: "word-counter", category: "tool", confidence: "low" };
}

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
      // Tool discovery
      "free online tools",
      "best online calculator",
      "online tools for developers",
      "free ai tools online",
      "text tools online",
      "converter tools free",
      // Blog / how-to discovery (people also ask)
      "how to format json online",
      "how to calculate emi",
      "how to validate email",
      "how to generate qr code free",
      "how to check password strength",
      "how to convert base64",
      "best free developer tools 2025",
      "how to calculate gst india",
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

    // Skip queries we can't build
    if (!isQueryBuildable(signal.query)) { skipped++; continue; }

    const { engine, category, confidence } = inferEngineAndCategory(signal.query);

    // Skip low-confidence engine assignments with generic fallback
    // (these are queries like "free tool for X" that don't map to anything specific)
    if (confidence === "low" && engine === "text-transformer") { skipped++; continue; }

    const name = queryToName(signal.query);

    // Use insert with explicit error handling instead of upsert
    // (partial unique index on demand_queue doesn't work with upsert)
    const { error } = await supabase.from("demand_queue").insert({
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
    });

    if (!error) {
      queuedCount++;
      queuedSlugs.add(slug); // prevent dupes within same run
    } else if (error.code === "23505") {
      skipped++; // duplicate slug — already in queue
    } else {
      console.error("demand_queue insert error:", error.message, error.code);
      skipped++;
    }
  }

  return { queued: queuedCount, skipped };
}