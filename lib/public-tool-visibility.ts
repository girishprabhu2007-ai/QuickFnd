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
 * Canonical tool families for Phase 1 deduplication.
 * The key is the canonical public slug and the array contains
 * duplicate public slugs that should not remain publicly visible.
 */
const DUPLICATE_FAMILIES: Record<string, string[]> = {
  "base64-encoder": ["base64-decoder"],
  "url-encoder": ["url-decoder"],
};

/**
 * Tools intentionally hidden from public listings because they duplicate
 * stronger canonical tools or add too little standalone value.
 */
const HARD_HIDDEN_SLUGS = new Set<string>(["text-transformer"]);

/**
 * Generic / placeholder engines are not considered a working public engine.
 * Anything here should be treated as a placeholder until assigned a real engine.
 */
const PLACEHOLDER_ENGINE_TYPES = new Set<string>(["", "auto", "generic-directory"]);

function isDuplicateOfCanonical(slug: string) {
  for (const duplicates of Object.values(DUPLICATE_FAMILIES)) {
    if (duplicates.includes(slug)) {
      return true;
    }
  }

  return false;
}

function isHardHiddenSlug(slug: string) {
  return HARD_HIDDEN_SLUGS.has(slug);
}

function isNonPublicDuplicate(slug: string) {
  return isHardHiddenSlug(slug) || isDuplicateOfCanonical(slug);
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

/**
 * Narrow helper when a caller specifically wants a PublicContentItem[] result.
 * Keeps compatibility for places that work with public content shapes.
 */
export function filterVisiblePublicTools(items: PublicContentItem[]): PublicContentItem[] {
  return items.filter((item) => isToolPubliclyVisible(item));
}