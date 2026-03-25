/**
 * lib/visibility.ts — SINGLE SOURCE OF TRUTH for public visibility
 * 
 * Rules applied in order:
 * 1. Item must have a non-empty slug
 * 2. Slug must not be in the hard-hidden list
 * 3. engine_type must not be a placeholder
 * 4. (AI tools only) engine_config.task must not be generic
 *
 * HIDDEN STRATEGY:
 * - Keep ONE canonical tool per function (e.g. "word-counter" not "smart-word-counter")
 * - Hide all platform-specific keyword variants (Twitter X, Instagram Y, YouTube Z)
 * - Hide tools that are just renamed versions of existing tools
 * - Hide tools with no real engine (generic-directory only)
 */

import type { PublicContentItem } from "@/lib/content-pages";

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

const PLACEHOLDER_ENGINE_TYPES = new Set<string>([
  "",
  "auto",
  "generic-directory",
]);

function isPlaceholderEngine(item: PublicContentItem): boolean {
  return PLACEHOLDER_ENGINE_TYPES.has(normalize(item.engine_type));
}

// ─── TOOLS — hard hidden list ─────────────────────────────────────────────────

const TOOL_HARD_HIDDEN = new Set<string>([

  // ── Base64 duplicates (keep: base64-encoder) ──────────────────────────────
    "base64-image-encoder",
  "base64-file-encoder",

  // ── URL Encoder duplicates (keep: url-encoder) ────────────────────────────
    "url-encoding-and-decoding-tool",
  "seo-url-encoder",
      "url-encoder-for-campaign-links",
  "ig-story-url-encoder",
  "tweet-url-encoder",
  "youtube-url-encoder",
  "amazon-url-encoder",
  "facebook-url-encoder",

  // ── Word Counter duplicates (keep: word-counter) ──────────────────────────
  "smart-word-counter",
  "hashtag-word-counter",
  "twitter-bio-word-counter",
  "video-transcript-word-counter",
  "content-length-counter",
  "instagram-caption-word-counter",
  "linkedin-post-word-counter",
  "youtube-description-word-counter",
  "seo-meta-description-length-checker",
  "tweet-character-counter",
  "meta-description-word-counter",
  "video-description-word-counter",
  "word-count-assistant",

  // ── JSON Formatter duplicates (keep: json-formatter) ─────────────────────
  "json-code-beautifier",
  "json-seo-schema-formatter",
  "twitter-content-json-formatter",
  "json-pretty-printer",
  "json-minifier",
  "tweet-json-formatter",

  // ── Password duplicates (keep: password-generator, password-strength-checker)
  "human-readable-password-generator",
  "random-pronounceable-password-generator",
  "secure-password-creator",
  "story-highlight-password-checker",
  "instagram-password-generator",
  "wifi-password-generator",
  "pin-generator",
  "twitter-bio-password-strength",

  // ── Slug Generator duplicates (keep: slug-generator) ─────────────────────
  "seo-keyword-slug-generator",
  "url-slug-generator",
  "wordpress-slug-generator",
  "youtube-slug-generator",
  "twitter-username-slugifier",

  // ── Text Case duplicates (keep: text-case-converter) ─────────────────────
    "lowercase-text-converter",
  "uppercase-text-converter",
  "title-case-formatter",
  "sentence-capitalizer",
  "case-style-converter",
    "youtube-comment-text-transformer",
  "thumbnail-caption-transformer",
  "text-case-conversion-suite",

  // ── Timestamp duplicates (keep: timestamp-converter) ─────────────────────
  "timestamp-to-date-converter",
  "tweet-timestamp-converter",
    "epoch-converter",

  // ── Hash duplicates (keep: sha256-generator, md5-generator) ──────────────
  "cryptocurrency-price-hash-generator",
  "tweet-hash-generator",
  "instagram-post-hash-generator",
  "sha256-hash-checker",
  "twitter-md5-hash-generator",

  // ── Currency/arbitrage junk ───────────────────────────────────────────────
  "currency-arbitrage-calculator",
  "forex-arbitrage-calculator",

  // ── Twitter keyword variants (thin, no unique function) ──────────────────
  "twitter-bio-formatter",
  "twitter-hashtag-formatter",
  "twitter-thread-formatter",
  "twitter-username-formatter",
  "tweet-formatter",

  // ── Instagram keyword variants ────────────────────────────────────────────
  "instagram-bio-formatter",
  "instagram-caption-formatter",
  "instagram-hashtag-formatter",

  // ── YouTube keyword variants (keep genuine tools only) ───────────────────
  "youtube-description-formatter",
  "youtube-hashtag-formatter",
  "youtube-title-formatter",

  // ── LinkedIn/Reddit/other social variants ─────────────────────────────────
  "linkedin-headline-formatter",
  "linkedin-post-formatter",
  "reddit-post-formatter",

  // ── SEO formatter variants (thin) ─────────────────────────────────────────
  "seo-title-formatter",
  "meta-description-formatter",
  "seo-text-transformer",
  "headline-enhancer",
  "text-simplifier",
  "passive-voice-detector",
  "sentence-capitalizer",

  // ── Random string variants (keep: random-string-generator) ───────────────
  "random-string-generator-with-custom-rules",

  // ── Other confirmed thin/duplicate tools ──────────────────────────────────
  "meta-description-generator",
  "keyword-density-analyzer",
]);

export function isToolVisible(item: PublicContentItem): boolean {
  const slug = normalize(item.slug);
  if (!slug) return false;
  if (TOOL_HARD_HIDDEN.has(slug)) return false;
  if (isPlaceholderEngine(item)) return false;
  return true;
}

export function filterVisibleTools<T extends PublicContentItem>(items: T[]): T[] {
  return items.filter((item) => isToolVisible(item));
}

// ─── CALCULATORS — hard hidden list ──────────────────────────────────────────

const CALCULATOR_HARD_HIDDEN = new Set<string>([
  // Generator calculators (low intent)
  "generator-fuel-efficiency-calculator",
  "generator-power-output-percentage-calculator",
  "generator-age-calculator",
  "generator-runtime-calculator",
  "generator-load-calculator",

  // SEO calculators (thin)
  "seo-campaign-roi-calculator",
  "backlink-growth-rate-calculator",
  "seo-keyword-density-calculator",
  "seo-strength-calculator",
  "domain-authority-estimator",

  // Auto-published with wrong engine (formula-calculator, no preset)
  "investment-calculator",

  // Dev metric calculators (obscure, low search intent)
  "merge-conflict-probability-calculator",
  "code-review-efficiency-calculator",
  "ci-build-time-calculator",
  "function-performance-cost-calculator",
  "bug-fix-rate-calculator",
  "deployment-frequency-calculator",
]);

export function isCalculatorVisible(item: PublicContentItem): boolean {
  const slug = normalize(item.slug);
  if (!slug) return false;
  if (CALCULATOR_HARD_HIDDEN.has(slug)) return false;
  if (isPlaceholderEngine(item)) return false;

  // Hide formula-calculators with no preset — they show a useless generic interface
  if (normalize(item.engine_type) === "formula-calculator") {
    const config = item.engine_config as Record<string, unknown> | null;
    const preset = String(config?.preset || "").trim();
    if (!preset || preset === "metric-ratio") return false;
  }

  return true;
}

export function filterVisibleCalculators<T extends PublicContentItem>(items: T[]): T[] {
  return items.filter((item) => isCalculatorVisible(item));
}

// ─── AI TOOLS — hard hidden list ─────────────────────────────────────────────

const AI_TOOL_HARD_HIDDEN = new Set<string>([]);

const GENERIC_AI_TASKS = new Set<string>([
  "",
  "text-generation",
  "general",
  "default",
]);

function isGenericAIEngine(item: PublicContentItem): boolean {
  if (!item.engine_config) return true;
  const config = item.engine_config as Record<string, unknown>;
  const task = normalize(config.task as string);
  return GENERIC_AI_TASKS.has(task);
}

export function isAIToolVisible(item: PublicContentItem): boolean {
  const slug = normalize(item.slug);
  if (!slug) return false;
  if (AI_TOOL_HARD_HIDDEN.has(slug)) return false;
  if (isPlaceholderEngine(item)) return false;
  const engineType = normalize(item.engine_type);
  if (engineType === "openai-text-tool" && isGenericAIEngine(item)) return false;
  return true;
}

export function filterVisibleAITools<T extends PublicContentItem>(items: T[]): T[] {
  return items.filter((item) => isAIToolVisible(item));
}

// ─── Universal filter ─────────────────────────────────────────────────────────

export type ContentType = "tools" | "calculators" | "ai_tools";

export function filterVisibleByType<T extends PublicContentItem>(
  type: ContentType,
  items: T[]
): T[] {
  if (type === "tools") return filterVisibleTools(items);
  if (type === "calculators") return filterVisibleCalculators(items);
  return filterVisibleAITools(items);
}