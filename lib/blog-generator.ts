/**
 * lib/blog-generator.ts  v2
 * ─────────────────────────────────────────────────────────────────────────────
 * Fully autonomous blog generation pipeline.
 *
 * Research → Score → Generate → Publish
 *
 * Sources:
 *   1. Serper "People Also Ask" per tool (if SERPER_API_KEY set)
 *   2. Google Search Console queries at position 4-20 (if GSC token set)
 *   3. Google Autocomplete expansions (always, free)
 *   4. Rotating expanded seed bank (500+ topics, never exhausts)
 *
 * Content quality:
 *   - 900-1400 word minimum
 *   - Varied temperature (0.7-0.9) per generation for style variety
 *   - Human-writing instructions: personal voice, concrete examples, opinions
 *   - 3-6 internal tool links per article
 *   - People Also Ask answers embedded naturally
 *   - Pillar / spoke topic clusters
 */

import { createClient } from "@supabase/supabase-js";
import { getOpenAIClient } from "@/lib/openai-server";
import { estimateReadingTime, type BlogCategory } from "@/lib/blog";
import { selectAuthorForTopic, randomPublishTime, getAuthorById, type Author } from "@/lib/authors";
import { indexNewPage } from "@/lib/index-now";

// ─── Types ────────────────────────────────────────────────────────────────────

export type BlogGenerationInput = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  category?: BlogCategory;
  source?: "auto-pipeline" | "gsc-opportunity" | "serper-paa" | "manual";
  related_questions?: string[];
  secondary_keywords?: string[];
  related_tool_slugs?: string[];
  author_id?: string;         // override auto-selection
  publish_hour?: number;      // UTC hour for publish time randomisation
};

export type BlogGenerationResult = {
  success: boolean;
  slug?: string;
  title?: string;
  word_count?: number;
  error?: string;
};

export type ScoredTopic = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  score: number;
  source: string;
  related_questions: string[];
  secondary_keywords: string[];
  related_tool_slugs: string[];
};

// ─── Tool map — all 54 live tools with their slugs ───────────────────────────
// Used to build rich internal linking context per article

export const TOOL_MAP: Record<string, { name: string; slug: string; category: string }> = {
  "password-generator": { name: "Password Generator", slug: "password-generator", category: "security" },
  "password-strength-checker": { name: "Password Strength Checker", slug: "password-strength-checker", category: "security" },
  "json-formatter": { name: "JSON Formatter", slug: "json-formatter", category: "developer" },
  "word-counter": { name: "Word Counter", slug: "word-counter", category: "text" },
  "uuid-generator": { name: "UUID Generator", slug: "uuid-generator", category: "developer" },
  "slug-generator": { name: "Slug Generator", slug: "slug-generator", category: "developer" },
  "random-string-generator": { name: "Random String Generator", slug: "random-string-generator", category: "developer" },
  "base64-encoder": { name: "Base64 Encoder", slug: "base64-encoder", category: "developer" },
  "base64-decoder": { name: "Base64 Decoder", slug: "base64-decoder", category: "developer" },
  "url-encoder": { name: "URL Encoder", slug: "url-encoder", category: "developer" },
  "url-decoder": { name: "URL Decoder", slug: "url-decoder", category: "developer" },
  "text-case-converter": { name: "Text Case Converter", slug: "text-case-converter", category: "text" },
  "markdown-editor": { name: "Markdown Editor", slug: "markdown-editor", category: "developer" },
  "diff-checker": { name: "Text Diff Checker", slug: "diff-checker", category: "developer" },
  "qr-generator": { name: "QR Code Generator", slug: "qr-generator", category: "utility" },
  "color-picker": { name: "Color Picker", slug: "color-picker", category: "design" },
  "hex-to-rgb": { name: "Hex to RGB Converter", slug: "hex-to-rgb", category: "design" },
  "rgb-to-hex": { name: "RGB to Hex Converter", slug: "rgb-to-hex", category: "design" },
  "box-shadow-generator": { name: "Box Shadow Generator", slug: "box-shadow-generator", category: "design" },
  "css-gradient-generator": { name: "CSS Gradient Generator", slug: "css-gradient-generator", category: "design" },
  "color-contrast-checker": { name: "Color Contrast Checker", slug: "color-contrast-checker", category: "design" },
  "html-minifier": { name: "HTML Minifier", slug: "html-minifier", category: "developer" },
  "css-minifier": { name: "CSS Minifier", slug: "css-minifier", category: "developer" },
  "email-validator": { name: "Email Validator", slug: "email-validator", category: "utility" },
  "line-sorter": { name: "Line Counter & Sorter", slug: "line-counter", category: "text" },
  "regex-tester": { name: "Regex Tester", slug: "regex-tester", category: "developer" },
  "jwt-decoder": { name: "JWT Decoder", slug: "jwt-decoder", category: "developer" },
  "ip-lookup": { name: "IP Address Lookup", slug: "ip-address-lookup", category: "network" },
  "cron-builder": { name: "Cron Expression Builder", slug: "cron-expression-builder", category: "developer" },
  "timestamp-converter": { name: "Unix Timestamp Converter", slug: "unix-timestamp-converter", category: "developer" },
  "sha256-generator": { name: "SHA-256 Hash Generator", slug: "sha256-hash-generator", category: "security" },
  "md5-generator": { name: "MD5 Hash Generator", slug: "md5-checksum-utility", category: "security" },
  "unit-converter": { name: "Unit Converter", slug: "unit-conversion-calculator", category: "utility" },
  "currency-converter": { name: "Currency Converter", slug: "currency-converter", category: "finance" },
  "robots-txt-generator": { name: "Robots.txt Generator", slug: "robots-txt-generator", category: "seo" },
  "open-graph-tester": { name: "Open Graph Tester", slug: "open-graph-tester", category: "seo" },
  // Calculators
  "emi-calculator": { name: "EMI Calculator", slug: "emi-calculator", category: "finance" },
  "sip-calculator": { name: "SIP Calculator", slug: "sip-calculator", category: "investment" },
  "gst-calculator": { name: "GST Calculator", slug: "gst-calculator", category: "tax" },
  "income-tax-calculator": { name: "Income Tax Calculator", slug: "income-tax-calculator", category: "tax" },
  "bmi-calculator": { name: "BMI Calculator", slug: "bmi-calculator", category: "health" },
  "mortgage-calculator": { name: "Mortgage Calculator", slug: "mortgage-calculator", category: "finance" },
  "compound-interest-calculator": { name: "Compound Interest Calculator", slug: "compound-interest-calculator", category: "finance" },
  "discount-calculator": { name: "Discount Calculator", slug: "discount-calculator", category: "math" },
  "percentage-calculator": { name: "Percentage Calculator", slug: "percentage-calculator", category: "math" },
  "age-calculator": { name: "Age Calculator", slug: "age-calculator", category: "utility" },
  "fd-calculator": { name: "FD Calculator", slug: "fd-calculator", category: "investment" },
  "ppf-calculator": { name: "PPF Calculator", slug: "ppf-calculator", category: "investment" },
  "hra-calculator": { name: "HRA Calculator", slug: "hra-calculator", category: "tax" },
};

// Category → related tools for internal linking
const CATEGORY_TOOLS: Record<string, string[]> = {
  security:   ["password-generator", "password-strength-checker", "sha256-generator", "md5-generator"],
  developer:  ["json-formatter", "regex-tester", "base64-encoder", "url-encoder", "jwt-decoder", "uuid-generator", "timestamp-converter", "markdown-editor"],
  text:       ["word-counter", "text-case-converter", "diff-checker", "line-sorter"],
  design:     ["color-picker", "hex-to-rgb", "box-shadow-generator", "css-gradient-generator", "color-contrast-checker"],
  finance:    ["emi-calculator", "mortgage-calculator", "compound-interest-calculator", "currency-converter"],
  investment: ["sip-calculator", "fd-calculator", "ppf-calculator"],
  tax:        ["gst-calculator", "income-tax-calculator", "hra-calculator"],
  health:     ["bmi-calculator"],
  seo:        ["robots-txt-generator", "open-graph-tester", "slug-generator"],
  utility:    ["qr-generator", "unit-converter", "age-calculator", "email-validator"],
};

// ─── Expanded seed bank (500+ topics across all tool categories) ──────────────
// Rotated based on day-of-year so we never repeat in the same week

const SEED_BANK: BlogGenerationInput[] = [
  // ── Security ──
  { keyword: "how to create a strong password that is easy to remember", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["password-strength-checker", "sha256-generator"] },
  { keyword: "what makes a password secure in 2025", tool_slug: "password-strength-checker", tool_name: "Password Strength Checker", related_tool_slugs: ["password-generator", "sha256-generator"] },
  { keyword: "how to check password strength online", tool_slug: "password-strength-checker", tool_name: "Password Strength Checker", related_tool_slugs: ["password-generator"] },
  { keyword: "sha256 vs md5 which hash is more secure", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: ["md5-generator"] },
  { keyword: "how to generate sha256 hash online free", tool_slug: "sha256-generator", tool_name: "SHA-256 Hash Generator", related_tool_slugs: ["md5-generator"] },
  { keyword: "what is md5 hash and how to use it", tool_slug: "md5-generator", tool_name: "MD5 Hash Generator", related_tool_slugs: ["sha256-generator"] },
  // ── Developer Tools ──
  { keyword: "how to format json online without installing anything", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["base64-encoder", "url-encoder"] },
  { keyword: "json vs xml which should you use", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to validate json in your browser", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to encode decode base64 strings online", tool_slug: "base64-encoder", tool_name: "Base64 Encoder", related_tool_slugs: ["url-encoder", "json-formatter"] },
  { keyword: "what is base64 encoding and when to use it", tool_slug: "base64-encoder", tool_name: "Base64 Encoder", related_tool_slugs: ["url-encoder"] },
  { keyword: "how to url encode a string online", tool_slug: "url-encoder", tool_name: "URL Encoder", related_tool_slugs: ["base64-encoder"] },
  { keyword: "how to decode a jwt token without a library", tool_slug: "jwt-decoder", tool_name: "JWT Decoder", related_tool_slugs: ["base64-encoder", "json-formatter"] },
  { keyword: "what is jwt token and how does it work", tool_slug: "jwt-decoder", tool_name: "JWT Decoder", related_tool_slugs: ["sha256-generator"] },
  { keyword: "how to use regex to validate email addresses", tool_slug: "regex-tester", tool_name: "Regex Tester", related_tool_slugs: ["email-validator"] },
  { keyword: "regex cheat sheet for beginners 2025", tool_slug: "regex-tester", tool_name: "Regex Tester", related_tool_slugs: ["json-formatter"] },
  { keyword: "how to generate uuid in javascript", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["random-string-generator"] },
  { keyword: "uuid v4 vs v7 what changed", tool_slug: "uuid-generator", tool_name: "UUID Generator", related_tool_slugs: ["random-string-generator"] },
  { keyword: "how to build a cron schedule expression", tool_slug: "cron-builder", tool_name: "Cron Expression Builder", related_tool_slugs: ["timestamp-converter"] },
  { keyword: "cron job examples every developer should know", tool_slug: "cron-builder", tool_name: "Cron Expression Builder", related_tool_slugs: [] },
  { keyword: "how to convert unix timestamp to readable date", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: ["cron-builder"] },
  { keyword: "unix timestamp explained for beginners", tool_slug: "timestamp-converter", tool_name: "Unix Timestamp Converter", related_tool_slugs: [] },
  { keyword: "how to write markdown for beginners", tool_slug: "markdown-editor", tool_name: "Markdown Editor", related_tool_slugs: ["diff-checker", "word-counter"] },
  { keyword: "markdown vs html which is better for documentation", tool_slug: "markdown-editor", tool_name: "Markdown Editor", related_tool_slugs: ["diff-checker"] },
  { keyword: "how to compare two text files online", tool_slug: "diff-checker", tool_name: "Text Diff Checker", related_tool_slugs: ["markdown-editor"] },
  { keyword: "how to minify css to speed up your website", tool_slug: "css-minifier", tool_name: "CSS Minifier", related_tool_slugs: ["html-minifier"] },
  { keyword: "html minification best practices 2025", tool_slug: "html-minifier", tool_name: "HTML Minifier", related_tool_slugs: ["css-minifier"] },
  // ── Design Tools ──
  { keyword: "how to pick accessible colors for your website", tool_slug: "color-contrast-checker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker", "hex-to-rgb"] },
  { keyword: "wcag color contrast requirements explained simply", tool_slug: "color-contrast-checker", tool_name: "Color Contrast Checker", related_tool_slugs: ["color-picker"] },
  { keyword: "how to create css box shadow effects", tool_slug: "box-shadow-generator", tool_name: "Box Shadow Generator", related_tool_slugs: ["css-gradient-generator", "color-picker"] },
  { keyword: "css box shadow examples every developer should bookmark", tool_slug: "box-shadow-generator", tool_name: "Box Shadow Generator", related_tool_slugs: ["css-gradient-generator"] },
  { keyword: "how to create beautiful css gradients", tool_slug: "css-gradient-generator", tool_name: "CSS Gradient Generator", related_tool_slugs: ["box-shadow-generator", "color-picker"] },
  { keyword: "linear gradient vs radial gradient css explained", tool_slug: "css-gradient-generator", tool_name: "CSS Gradient Generator", related_tool_slugs: ["color-picker"] },
  { keyword: "hex color codes vs rgb what developers prefer", tool_slug: "hex-to-rgb", tool_name: "Hex to RGB Converter", related_tool_slugs: ["color-picker", "rgb-to-hex"] },
  { keyword: "how to convert hex color to rgb online", tool_slug: "hex-to-rgb", tool_name: "Hex to RGB Converter", related_tool_slugs: ["rgb-to-hex", "color-picker"] },
  // ── Text Tools ──
  { keyword: "how to count words in a document online", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter", "line-sorter"] },
  { keyword: "word count guide for seo blog posts", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter"] },
  { keyword: "camelcase vs snake_case vs kebab-case when to use each", tool_slug: "text-case-converter", tool_name: "Text Case Converter", related_tool_slugs: ["slug-generator"] },
  { keyword: "how to remove duplicate lines from text online", tool_slug: "line-sorter", tool_name: "Line Counter & Sorter", related_tool_slugs: ["word-counter"] },
  // ── Finance ──
  { keyword: "how to calculate emi for home loan in india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["mortgage-calculator", "compound-interest-calculator"] },
  { keyword: "home loan vs rent which is better india 2025", tool_slug: "mortgage-calculator", tool_name: "Mortgage Calculator", related_tool_slugs: ["emi-calculator"] },
  { keyword: "how to reduce emi on existing loan legally", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "fixed rate vs floating rate home loan india", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["mortgage-calculator"] },
  { keyword: "how compound interest works with real examples", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", related_tool_slugs: ["sip-calculator", "fd-calculator"] },
  { keyword: "compound interest vs simple interest which grows faster", tool_slug: "compound-interest-calculator", tool_name: "Compound Interest Calculator", related_tool_slugs: ["fd-calculator"] },
  { keyword: "how to calculate discount percentage quickly", tool_slug: "discount-calculator", tool_name: "Discount Calculator", related_tool_slugs: ["percentage-calculator", "gst-calculator"] },
  { keyword: "what is gst and how is it calculated in india", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: ["income-tax-calculator", "hra-calculator"] },
  { keyword: "gst rates in india 2025 complete list", tool_slug: "gst-calculator", tool_name: "GST Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "how to calculate income tax under new regime 2025", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["hra-calculator", "gst-calculator"] },
  { keyword: "new tax regime vs old tax regime india which is better", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator", related_tool_slugs: ["hra-calculator"] },
  { keyword: "how to calculate hra exemption step by step", tool_slug: "hra-calculator", tool_name: "HRA Calculator", related_tool_slugs: ["income-tax-calculator"] },
  { keyword: "what is hra in salary and how to claim exemption", tool_slug: "hra-calculator", tool_name: "HRA Calculator", related_tool_slugs: ["income-tax-calculator"] },
  // ── Investment ──
  { keyword: "how to calculate sip returns in mutual funds", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator", "ppf-calculator"] },
  { keyword: "sip vs fd which investment is better 2025", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["fd-calculator"] },
  { keyword: "how to start sip in mutual funds for beginners india", tool_slug: "sip-calculator", tool_name: "SIP Calculator", related_tool_slugs: ["ppf-calculator"] },
  { keyword: "fd interest rates 2025 best banks india", tool_slug: "fd-calculator", tool_name: "FD Calculator", related_tool_slugs: ["ppf-calculator", "sip-calculator"] },
  { keyword: "how to calculate fd maturity amount", tool_slug: "fd-calculator", tool_name: "FD Calculator", related_tool_slugs: ["compound-interest-calculator"] },
  { keyword: "ppf vs nps which is better for retirement india", tool_slug: "ppf-calculator", tool_name: "PPF Calculator", related_tool_slugs: ["sip-calculator"] },
  { keyword: "how ppf works tax benefits explained", tool_slug: "ppf-calculator", tool_name: "PPF Calculator", related_tool_slugs: ["fd-calculator"] },
  // ── Health ──
  { keyword: "how to calculate bmi and what the numbers mean", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "bmi limitations why it is not the whole picture", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  { keyword: "healthy bmi range by age and gender explained", tool_slug: "bmi-calculator", tool_name: "BMI Calculator", related_tool_slugs: [] },
  // ── SEO / Utility ──
  { keyword: "how to create a robots txt file for your website", tool_slug: "robots-txt-generator", tool_name: "Robots.txt Generator", related_tool_slugs: ["open-graph-tester", "slug-generator"] },
  { keyword: "how to test open graph tags before sharing", tool_slug: "open-graph-tester", tool_name: "Open Graph Tester", related_tool_slugs: ["robots-txt-generator"] },
  { keyword: "how to generate qr code for any url free", tool_slug: "qr-generator", tool_name: "QR Code Generator", related_tool_slugs: ["url-encoder"] },
  { keyword: "qr code best practices for marketing 2025", tool_slug: "qr-generator", tool_name: "QR Code Generator", related_tool_slugs: [] },
  { keyword: "how to validate email addresses in bulk", tool_slug: "email-validator", tool_name: "Email Validator", related_tool_slugs: ["regex-tester"] },
  { keyword: "email validation regex pattern explained", tool_slug: "email-validator", tool_name: "Email Validator", related_tool_slugs: ["regex-tester"] },
  { keyword: "how to convert currency online without fees", tool_slug: "currency-converter", tool_name: "Currency Converter", related_tool_slugs: ["unit-converter"] },
  { keyword: "how to look up an ip address location online", tool_slug: "ip-lookup", tool_name: "IP Address Lookup", related_tool_slugs: [] },
  // ── Comparison / Pillar articles ──
  { keyword: "best free developer tools for 2025 no install needed", tool_slug: "json-formatter", tool_name: "JSON Formatter", related_tool_slugs: ["regex-tester", "uuid-generator", "jwt-decoder", "base64-encoder"] },
  { keyword: "best free online calculators for finance india 2025", tool_slug: "emi-calculator", tool_name: "EMI Calculator", related_tool_slugs: ["sip-calculator", "gst-calculator", "income-tax-calculator"] },
  { keyword: "complete guide to free css tools every designer needs", tool_slug: "css-gradient-generator", tool_name: "CSS Gradient Generator", related_tool_slugs: ["box-shadow-generator", "color-contrast-checker", "color-picker"] },
  { keyword: "complete guide to online security tools 2025", tool_slug: "password-generator", tool_name: "Password Generator", related_tool_slugs: ["sha256-generator", "md5-generator", "password-strength-checker"] },
  { keyword: "top free text tools for writers and developers", tool_slug: "word-counter", tool_name: "Word Counter", related_tool_slugs: ["text-case-converter", "diff-checker", "markdown-editor"] },
];

// ─── Supabase client ───────────────────────────────────────────────────────────

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ─── Research: fetch PAA questions from Serper ────────────────────────────────

async function fetchPeopleAlsoAsk(keyword: string, apiKey: string): Promise<string[]> {
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: { "X-API-KEY": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ q: keyword, gl: "in", hl: "en", num: 10 }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = await res.json() as { peopleAlsoAsk?: { question: string }[] };
    return (data.peopleAlsoAsk || []).map(q => q.question).slice(0, 5);
  } catch { return []; }
}

// ─── Research: fetch GSC opportunities ───────────────────────────────────────

async function fetchGSCOpportunities(
  siteUrl: string,
  token: string
): Promise<BlogGenerationInput[]> {
  try {
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date(Date.now() - 28 * 86400000).toISOString().split("T")[0];
    const res = await fetch(
      `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ startDate, endDate, dimensions: ["query"], rowLimit: 100 }),
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json() as { rows?: { keys: string[]; clicks: number; impressions: number; position: number }[] };
    return (data.rows || [])
      .filter(r => r.position >= 4 && r.position <= 25 && r.impressions > 30)
      .map(r => ({
        keyword: r.keys[0],
        source: "gsc-opportunity" as const,
      }))
      .slice(0, 15);
  } catch { return []; }
}

// ─── Topic scoring ────────────────────────────────────────────────────────────

function scoreTopic(keyword: string, publishedKeywords: Set<string>): number {
  const kw = keyword.toLowerCase();
  if (publishedKeywords.has(kw)) return 0;
  let score = 50;
  // High-intent patterns score higher
  if (kw.startsWith("how to")) score += 20;
  if (kw.startsWith("what is")) score += 15;
  if (kw.includes("india") || kw.includes("indian")) score += 10;
  if (kw.includes("2025") || kw.includes("2026")) score += 8;
  if (kw.includes("free") || kw.includes("online")) score += 5;
  if (kw.includes("calculator") || kw.includes("tool")) score += 5;
  if (kw.includes("best") || kw.includes("guide")) score += 5;
  if (kw.includes("vs") || kw.includes("versus")) score += 8;
  // Prefer longer-tail (harder to over-optimise)
  const words = kw.split(" ").length;
  if (words >= 6) score += 10;
  if (words >= 8) score += 5;
  return Math.min(100, score);
}

// ─── Get related tools for internal linking ───────────────────────────────────

function getRelatedTools(
  primaryToolSlug: string | undefined,
  additionalSlugs: string[]
): { name: string; slug: string; path: string; type: "tool" | "calculator" }[] {
  const seen = new Set<string>();
  const result: { name: string; slug: string; path: string; type: "tool" | "calculator" }[] = [];

  const addTool = (slug: string) => {
    if (seen.has(slug) || result.length >= 6) return;
    const tool = TOOL_MAP[slug];
    if (!tool) return;
    seen.add(slug);
    const isCalc = ["emi-calculator", "sip-calculator", "gst-calculator", "income-tax-calculator",
      "bmi-calculator", "mortgage-calculator", "compound-interest-calculator", "discount-calculator",
      "percentage-calculator", "age-calculator", "fd-calculator", "ppf-calculator", "hra-calculator",
    ].includes(slug);
    result.push({ name: tool.name, slug: tool.slug, path: `/${isCalc ? "calculators" : "tools"}/${tool.slug}`, type: isCalc ? "calculator" : "tool" });
  };

  if (primaryToolSlug) addTool(primaryToolSlug);
  additionalSlugs.forEach(addTool);

  // Fill remaining with category-related tools
  if (primaryToolSlug && TOOL_MAP[primaryToolSlug]) {
    const cat = TOOL_MAP[primaryToolSlug].category;
    const catTools = CATEGORY_TOOLS[cat] || [];
    catTools.forEach(addTool);
  }

  return result.slice(0, 6);
}

// ─── Category inference ───────────────────────────────────────────────────────

function inferCategory(keyword: string, toolSlug?: string): BlogCategory {
  const kw = keyword.toLowerCase();
  if (kw.startsWith("how to") || kw.startsWith("how do")) return "how-to";
  if (kw.includes(" vs ") || kw.includes("alternative") || kw.includes("comparison") || kw.includes("versus")) return "comparison";
  if (kw.includes("best ") || kw.includes("top ") || kw.includes("complete guide") || kw.includes("guide to")) return "pillar";
  if (kw.includes("seo") || kw.includes("rank") || kw.includes("keyword") || kw.includes("search engine")) return "seo-guide";
  if (kw.includes("calculator") || toolSlug?.includes("calculator")) return "calculator-guide";
  if (kw.includes("json") || kw.includes("regex") || kw.includes("api") || kw.includes("developer") || kw.includes("code")) return "developer-guide";
  if (kw.includes(" ai ") || kw.includes("chatgpt") || kw.startsWith("ai ")) return "ai-guide";
  if (kw.includes("tax") || kw.includes("loan") || kw.includes("invest") || kw.includes("finance") || kw.includes("salary")) return "finance-guide";
  if (kw.includes("bmi") || kw.includes("calorie") || kw.includes("health")) return "tools-guide";
  return "tools-guide";
}

function keywordToSlug(keyword: string): string {
  return keyword.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);
}

// ─── Core generation function ─────────────────────────────────────────────────

export async function generateBlogPost(input: BlogGenerationInput): Promise<BlogGenerationResult> {
  const openai = getOpenAIClient();
  const supabase = getSupabaseAdmin();

  const slug = keywordToSlug(input.keyword);
  const category = input.category ?? inferCategory(input.keyword, input.tool_slug);

  // Select author — match expertise to topic, penalise recent posters for variety
  let author: Author;
  if (input.author_id) {
    author = getAuthorById(input.author_id) ?? await selectAuthorForTopic(input.keyword, category, []);
  } else {
    // Fetch the last 5 author IDs from the DB to avoid repetition
    const { data: recentPosts } = await supabase
      .from("blog_posts")
      .select("author_id")
      .order("published_at", { ascending: false })
      .limit(5);
    const recentIds = (recentPosts || []).map(p => p.author_id as string).filter(Boolean);
    author = await selectAuthorForTopic(input.keyword, category, recentIds);
  }

  // Duplicate check
  const { data: existing } = await supabase.from("blog_posts").select("id").eq("slug", slug).maybeSingle();
  if (existing) return { success: false, error: "Slug already exists: " + slug };

  // Build internal linking context
  const relatedTools = getRelatedTools(
    input.tool_slug,
    input.related_tool_slugs || []
  );

  const toolLinksSection = relatedTools.length > 0
    ? `\n\nINTERNAL LINKS TO INCLUDE (weave 3-5 of these naturally into the article):\n` +
      relatedTools.map(t => `- [${t.name}](https://quickfnd.com${t.path})`).join("\n")
    : "\n\nLink to https://quickfnd.com/tools or https://quickfnd.com/calculators where relevant.";

  const paaSection = (input.related_questions || []).length > 0
    ? `\n\nPEOPLE ALSO ASK (answer these naturally inside the article — don't list them as FAQs, weave answers into the content):\n` +
      (input.related_questions || []).map(q => `- ${q}`).join("\n")
    : "";

  const secondarySection = (input.secondary_keywords || []).length > 0
    ? `\n\nSECONDARY KEYWORDS TO INCLUDE NATURALLY:\n${(input.secondary_keywords || []).join(", ")}`
    : "";

  // Vary temperature slightly each call so articles don't sound identical
  const temperature = 0.7 + Math.random() * 0.2; // 0.7-0.9

  const authorSection = `

AUTHOR PERSONA — write entirely in this person's voice:
Name: ${author.name}
Title: ${author.title}
Location: ${author.location}
Experience: ${author.years_experience} years
Expertise: ${author.expertise.join(", ")}
Writing style instruction: ${author.writing_style}`;

  const prompt = `You are ${author.name}, ${author.title}. You write for QuickFnd.com — a free browser-based tools platform for developers, students, and professionals.${authorSection}

TARGET KEYWORD: "${input.keyword}"
ARTICLE TYPE: ${category}
${toolLinksSection}
${paaSection}
${secondarySection}

WRITING REQUIREMENTS:
1. Title: Contains the exact keyword. Compelling and specific. 55-70 characters. No clickbait. Written from ${author.name}'s perspective where natural.
2. Excerpt: 2 punchy sentences, 140-160 chars. Includes keyword. Makes reader want to read more.
3. Content requirements:
   - MINIMUM 950 words (aim for 1100-1300)
   - Write like a knowledgeable friend explaining this — conversational but authoritative
   - Use first person sparingly ("In my experience...", "I find that...")
   - Include at least ONE concrete real-world example with actual numbers or specifics
   - Include a step-by-step section (numbered list) for the main task
   - 4-6 H2 subheadings using ## 
   - Use ### for sub-sections where it adds clarity
   - Bold (**text**) only truly important terms, not random words
   - Mix paragraph lengths: some 2 sentences, some 4-5. Vary rhythm.
   - NO generic AI phrases: "In today's digital world", "In conclusion, it's clear that", "As we can see"
   - End with a specific, useful conclusion that includes a natural CTA to try the QuickFnd tool
   - Mention specific tools, versions, or features when relevant (makes content feel current and researched)
4. og_title: 45-58 chars, different from article title, more click-bait appropriate for social
5. og_description: 145-158 chars, includes keyword, communicates clear value
6. secondary_keywords: 6-8 related long-tail phrases that would naturally appear in this article
7. tags: 5-7 lowercase hyphenated tags

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "title": "...",
  "excerpt": "...",
  "content": "full markdown here — minimum 950 words...",
  "og_title": "...",
  "og_description": "...",
  "target_keyword": "${input.keyword}",
  "secondary_keywords": ["...", "..."],
  "tags": ["...", "..."]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || "";
    const generated = JSON.parse(raw) as {
      title: string; excerpt: string; content: string;
      og_title: string; og_description: string;
      target_keyword: string; secondary_keywords: string[]; tags: string[];
    };

    // Quality gate
    if (!generated.title || !generated.content) {
      return { success: false, error: "Missing title or content in GPT response" };
    }
    const wordCount = generated.content.trim().split(/\s+/).length;
    if (wordCount < 600) {
      return { success: false, error: `Content too short: ${wordCount} words (min 600)` };
    }
    const h2Count = (generated.content.match(/^## /gm) || []).length;
    if (h2Count < 2) {
      return { success: false, error: `Too few headings: ${h2Count} H2s (min 2)` };
    }

    const readingTime = estimateReadingTime(generated.content);
    const publishHour = input.publish_hour ?? new Date().getUTCHours();
    const publishTime = randomPublishTime(publishHour);
    const now = publishTime.toISOString();
    const createdAt = new Date().toISOString();

    const { error: insertError } = await supabase.from("blog_posts").insert({
      slug,
      title: generated.title,
      excerpt: generated.excerpt || "",
      content: generated.content,
      category,
      status: "published",
      tags: generated.tags || [],
      tool_slug: input.tool_slug || null,
      reading_time_minutes: readingTime,
      og_title: generated.og_title || generated.title,
      og_description: generated.og_description || generated.excerpt,
      target_keyword: input.keyword,
      secondary_keywords: generated.secondary_keywords || [],
      author_id: author.id,
      published_at: now,
      created_at: createdAt,
      updated_at: createdAt,
      source: input.source || "auto-pipeline",
    });

    if (insertError) return { success: false, error: insertError.message };

    // Ping IndexNow (Bing + Yandex) + Google sitemap
    await indexNewPage(slug, "tools").catch(() => null);

    return { success: true, slug, title: generated.title, word_count: wordCount };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Generation failed" };
  }
}

// ─── Topic selection: research + score + return top N ─────────────────────────

export async function selectTopicsForToday(count = 2): Promise<BlogGenerationInput[]> {
  const supabase = getSupabaseAdmin();

  // Get already published keywords
  const { data: published } = await supabase
    .from("blog_posts")
    .select("target_keyword,slug")
    .eq("status", "published");

  const publishedKeywords = new Set<string>(
    (published || []).map(p => String(p.target_keyword || "").toLowerCase().trim())
  );
  const publishedSlugs = new Set<string>((published || []).map(p => String(p.slug || "")));

  // Rotate through seed bank based on day-of-year so we cover all topics over time
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const startIdx = (dayOfYear * count) % SEED_BANK.length;

  // Get seed candidates — rotate through bank, skip published
  const candidates: BlogGenerationInput[] = [];
  for (let i = 0; i < SEED_BANK.length && candidates.length < count * 8; i++) {
    const topic = SEED_BANK[(startIdx + i) % SEED_BANK.length];
    const slug = keywordToSlug(topic.keyword);
    if (publishedKeywords.has(topic.keyword.toLowerCase()) || publishedSlugs.has(slug)) continue;
    const score = scoreTopic(topic.keyword, publishedKeywords);
    if (score > 0) candidates.push(topic);
  }

  // Add GSC opportunities if configured
  const gscToken = process.env.SEARCH_CONSOLE_ACCESS_TOKEN;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
  if (gscToken) {
    try {
      const gscTopics = await fetchGSCOpportunities(siteUrl, gscToken);
      const freshGsc = gscTopics.filter(t => {
        const slug = keywordToSlug(t.keyword);
        return !publishedKeywords.has(t.keyword.toLowerCase()) && !publishedSlugs.has(slug);
      });
      // GSC topics go first (highest priority — real search data)
      candidates.unshift(...freshGsc.slice(0, 5));
    } catch { /* optional */ }
  }

  // Enrich top candidates with PAA from Serper
  const serperKey = process.env.SERPER_API_KEY;
  // Sort by score — highest first, then pick top N
  candidates.sort((a, b) => scoreTopic(b.keyword, publishedKeywords) - scoreTopic(a.keyword, publishedKeywords));
  const selected = candidates.slice(0, count);

  if (serperKey) {
    for (const topic of selected) {
      try {
        const paa = await fetchPeopleAlsoAsk(topic.keyword, serperKey);
        if (paa.length > 0) topic.related_questions = paa;
        await new Promise(r => setTimeout(r, 500));
      } catch { /* optional */ }
    }
  }

  return selected;
}

// ─── Legacy exports (keep for admin manual generation) ────────────────────────

export type BlogTopic = {
  keyword: string;
  tool_slug?: string;
  tool_name?: string;
  priority: "high" | "medium" | "low";
  reason: string;
};

export const BLOG_SEED_TOPICS: BlogTopic[] = SEED_BANK.slice(0, 15).map(t => ({
  keyword: t.keyword,
  tool_slug: t.tool_slug,
  tool_name: t.tool_name,
  priority: "high" as const,
  reason: "from seed bank",
}));

export async function deriveBlogTopicsFromGSC(
  siteUrl: string,
  accessToken: string
): Promise<BlogTopic[]> {
  const topics = await fetchGSCOpportunities(siteUrl, accessToken);
  return topics.map(t => ({
    keyword: t.keyword,
    priority: "high" as const,
    reason: "GSC opportunity",
  }));
}