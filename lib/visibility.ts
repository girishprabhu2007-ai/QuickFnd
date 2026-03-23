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
  // Confirmed duplicates / low-value
  "base64-decoder",
  "url-decoder",
  "text-transformer",
  "lowercase-text-converter",
  "uppercase-text-converter",
  "url-encoding-and-decoding-tool",
  "timestamp-to-date-converter",
  "tweet-timestamp-converter",
  "unix-timestamp-converter",
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
  // Add confirmed calculator duplicates here as they are identified
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