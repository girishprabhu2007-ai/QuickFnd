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
 * Canonical public representatives for duplicated tool families.
 * Only the canonical slug should remain publicly visible.
 */
const CANONICAL_TOOL_FAMILIES: Record<string, string> = {
  "base64-family": "base64-encoder",
  "url-family": "url-encoder",
  "text-case-family": "text-case-converter",
  "slug-family": "slug-generator",
  "json-family": "json-formatter",
  "binary-family": "text-to-binary",
  "color-family": "hex-to-rgb",
};

/**
 * Generic / placeholder engines are not considered a working public engine.
 */
const PLACEHOLDER_ENGINE_TYPES = new Set<string>(["", "auto", "generic-directory"]);

/**
 * Explicitly hidden tools even if they technically have an engine.
 */
const HARD_HIDDEN_SLUGS = new Set<string>(["text-transformer"]);

function detectFamily(slug: string): string | null {
  if (!slug) return null;

  if (slug.includes("base64")) return "base64-family";

  if (
    slug.includes("url-encoder") ||
    slug.includes("url-decoder") ||
    (slug.includes("url") && (slug.includes("encode") || slug.includes("decode")))
  ) {
    return "url-family";
  }

  if (
    slug.includes("text-case") ||
    slug.includes("case-style") ||
    slug.includes("case-conversion") ||
    slug.includes("text-transform")
  ) {
    return "text-case-family";
  }

  if (slug.includes("slug")) return "slug-family";

  if (
    slug.includes("json-formatter") ||
    slug.includes("json-pretty") ||
    slug.includes("json-minify")
  ) {
    return "json-family";
  }

  if (slug.includes("text-to-binary") || slug.includes("binary-to-text")) {
    return "binary-family";
  }

  if (slug.includes("hex-to-rgb") || slug.includes("rgb-to-hex")) {
    return "color-family";
  }

  return null;
}

function isCanonicalFamilyMismatch(slug: string) {
  const family = detectFamily(slug);

  if (!family) {
    return false;
  }

  const canonicalSlug = CANONICAL_TOOL_FAMILIES[family];
  return Boolean(canonicalSlug && slug !== canonicalSlug);
}

function isNonPublicDuplicate(slug: string) {
  return HARD_HIDDEN_SLUGS.has(slug) || isCanonicalFamilyMismatch(slug);
}

export function resolveToolEngineType(item: ToolVisibilityItem): string {
  return normalize(item.engine_type);
}

export function isToolPlaceholder(item: ToolVisibilityItem): boolean {
  const slug = normalize(item.slug);

  if (!slug) {
    return true;
  }

  if (isNonPublicDuplicate(slug)) {
    return false;
  }

  const engineType = resolveToolEngineType(item);
  return PLACEHOLDER_ENGINE_TYPES.has(engineType);
}

export function isToolPubliclyVisible(item: ToolVisibilityItem): boolean {
  const slug = normalize(item.slug);

  if (!slug) {
    return false;
  }

  if (isNonPublicDuplicate(slug)) {
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