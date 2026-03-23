/**
 * lib/visibility.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for what is publicly visible across tools,
 * calculators, and ai_tools.
 *
 * Rules applied in order:
 * 1. Item must have a non-empty slug
 * 2. Slug must not be in the hard-hidden list for its content type
 * 3. engine_type must not be a placeholder value
 * 4. (AI tools only) engine_config task must not be a generic/empty value
 *
 * All count displays, listing pages, sitemaps, and sidebars must go through
 * these functions. Never count raw DB results.
 */

import type { PublicContentItem } from "@/lib/content-pages";

// ─── Shared helpers ──────────────────────────────────────────────────────────

function normalize(value: string | null | undefined): string {
  return String(value ?? "").trim().toLowerCase();
}

/**
 * engine_type values that indicate a placeholder or unfinished item.
 * These are never shown publicly regardless of content type.
 */
const PLACEHOLDER_ENGINE_TYPES = new Set<string>([
  "",
  "auto",
  "generic-directory",
]);

function isPlaceholderEngine(item: PublicContentItem): boolean {
  return PLACEHOLDER_ENGINE_TYPES.has(normalize(item.engine_type));
}

// ─── TOOLS visibility ────────────────────────────────────────────────────────

/**
 * Slugs that are confirmed duplicates or thin variants of a canonical tool.
 * Add here when a cleanup pass identifies near-clones.
 */
const TOOL_HARD_HIDDEN = new Set<string>([
  // ── URL Encoder duplicates (keep canonical: url-encoder) ─────────────────
  "url-decoder",
  "url-encoding-and-decoding-tool",
  "seo-url-encoder",
  "seo-url-decoder",
  "url-encoder-for-seo",
  "url-encoder-for-campaign-links",
  "ig-story-url-encoder",
  "twitter-url-encoder",
  "youtube-url-encoder",
  "amazon-url-encoder",
  "facebook-url-encoder",

  // ── Word Counter duplicates (keep canonical: word-counter) ────────────────
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

  // ── JSON Formatter duplicates (keep canonical: json-formatter) ────────────
  "json-code-beautifier",
  "json-seo-schema-formatter",
  "twitter-content-json-formatter",
  "json-pretty-printer",
  "json-minifier",

  // ── Password Generator duplicates (keep canonical: password-generator) ────
  "human-readable-password-generator",
  "random-pronounceable-password-generator",
  "secure-password-creator",
  "story-highlight-password-checker",
  "instagram-password-generator",
  "wifi-password-generator",
  "pin-generator",

  // ── Base64 duplicates (keep canonical: base64-encoder) ───────────────────
  "base64-decoder",
  "base64-image-encoder",
  "base64-file-encoder",

  // ── Slug Generator duplicates (keep canonical: slug-generator) ───────────
  "seo-keyword-slug-generator",
  "url-slug-generator",
  "wordpress-slug-generator",
  "youtube-slug-generator",

  // ── Text Case duplicates (keep canonical: text-case-converter) ───────────
  "text-transformer",
  "lowercase-text-converter",
  "uppercase-text-converter",
  "title-case-converter",
  "sentence-case-converter",
  "camelcase-converter",

  // ── Timestamp duplicates (keep canonical: timestamp-converter) ───────────
  "timestamp-to-date-converter",
  "tweet-timestamp-converter",
  "unix-timestamp-converter",
  "epoch-converter",

  // ── Hash duplicates (keep canonical: sha256-generator) ───────────────────
  "cryptocurrency-price-hash-generator",
  "tweet-hash-generator",
  "instagram-post-hash-generator",
  "sha256-hash-checker",
  "md5-hash-generator",

  // ── Currency/Arbitrage junk ───────────────────────────────────────────────
  "currency-arbitrage-calculator",
  "forex-arbitrage-calculator",

  // ── Other thin keyword variants ───────────────────────────────────────────
  "advanced-text-transformer",
  "twitter-bio-formatter",
  "instagram-bio-formatter",
  "youtube-description-formatter",
  "linkedin-headline-formatter",
  "seo-title-formatter",
  "meta-description-formatter",
  "twitter-thread-formatter",
  "reddit-post-formatter",
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

// ─── CALCULATORS visibility ──────────────────────────────────────────────────

/**
 * Calculator slugs that are duplicates or should be hidden.
 */
const CALCULATOR_HARD_HIDDEN = new Set<string>([
  // ── Generator calculators (niche junk, not useful to general users) ───────
  "generator-fuel-efficiency-calculator",
  "generator-power-output-percentage-calculator",
  "generator-age-calculator",
  "generator-runtime-calculator",
  "generator-load-calculator",

  // ── SEO calculators (thin, very low search intent) ────────────────────────
  "seo-campaign-roi-calculator",
  "backlink-growth-rate-calculator",
  "seo-keyword-density-calculator",
  "seo-strength-calculator",
  "domain-authority-estimator",

  // ── Developer metric calculators (keep genuine ones, hide junk) ──────────
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
  return true;
}

export function filterVisibleCalculators<T extends PublicContentItem>(items: T[]): T[] {
  return items.filter((item) => isCalculatorVisible(item));
}

// ─── AI TOOLS visibility ─────────────────────────────────────────────────────

/**
 * AI tool slugs that are generic shells or duplicates.
 */
const AI_TOOL_HARD_HIDDEN = new Set<string>([
  // Add confirmed AI tool duplicates here as they are identified
]);

/**
 * engine_config.task values that indicate a generic/unfinished AI tool.
 */
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
  // AI tools with a specific named engine_type (not openai-text-tool generic)
  // are always visible. Generic openai-text-tool items are only visible if
  // they have a non-generic task config.
  const engineType = normalize(item.engine_type);
  if (engineType === "openai-text-tool" && isGenericAIEngine(item)) return false;
  return true;
}

export function filterVisibleAITools<T extends PublicContentItem>(items: T[]): T[] {
  return items.filter((item) => isAIToolVisible(item));
}

// ─── Universal filter (used by sitemap, etc.) ────────────────────────────────

export type ContentType = "tools" | "calculators" | "ai_tools";

export function filterVisibleByType<T extends PublicContentItem>(
  type: ContentType,
  items: T[]
): T[] {
  if (type === "tools") return filterVisibleTools(items);
  if (type === "calculators") return filterVisibleCalculators(items);
  return filterVisibleAITools(items);
}