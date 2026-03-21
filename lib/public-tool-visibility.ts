import type { PublicContentItem } from "@/lib/content-pages";

export type ToolVisibilityItem = {
  slug: string | null | undefined;
  engine_type?: string | null | undefined;
  name?: string | null | undefined;
  description?: string | null | undefined;
  engine_config?: unknown;
};

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

/**
 * Placeholder engines are not valid public tools
 */
const PLACEHOLDER_ENGINE_TYPES = new Set<string>(["", "auto", "generic-directory"]);

/**
 * Canonical tools (trusted core set)
 */
const CANONICAL_TOOL_SLUGS = new Set<string>([
  "password-generator",
  "json-formatter",
  "word-counter",
  "uuid-generator",
  "slug-generator",
  "random-string-generator",
  "base64-encoder",
  "url-encoder",
  "text-case-converter",
  "random-number-generator",
  "meters-to-feet-converter",
  "timestamp-converter",
]);

/**
 * Explicit hard removals (verified duplicates / low-value)
 */
const HARD_HIDDEN_SLUGS = new Set<string>([
  // Phase 1
  "base64-decoder",
  "url-decoder",
  "text-transformer",

  // Phase 3.3 (explicit cleanup)
  "lowercase-text-converter",
  "uppercase-text-converter",
  "url-encoding-and-decoding-tool",
  "timestamp-to-date-converter",
  "tweet-timestamp-converter",
  "unix-timestamp-converter",
]);

export function resolveToolEngineType(item: ToolVisibilityItem): string {
  return normalize(item.engine_type);
}

export function isToolPlaceholder(item: ToolVisibilityItem): boolean {
  const slug = normalize(item.slug);

  if (!slug) return true;

  if (HARD_HIDDEN_SLUGS.has(slug)) return false;

  const engineType = resolveToolEngineType(item);
  return PLACEHOLDER_ENGINE_TYPES.has(engineType);
}

export function isToolPubliclyVisible(item: ToolVisibilityItem): boolean {
  const slug = normalize(item.slug);

  if (!slug) return false;

  // Always allow canonical tools
  if (CANONICAL_TOOL_SLUGS.has(slug)) {
    return true;
  }

  // Explicit removals only
  if (HARD_HIDDEN_SLUGS.has(slug)) {
    return false;
  }

  return true;
}

export function filterVisibleTools<T extends ToolVisibilityItem>(items: T[]): T[] {
  return items.filter((item) => isToolPubliclyVisible(item));
}

export function filterVisiblePublicTools(items: PublicContentItem[]): PublicContentItem[] {
  return items.filter((item) => isToolPubliclyVisible(item));
}