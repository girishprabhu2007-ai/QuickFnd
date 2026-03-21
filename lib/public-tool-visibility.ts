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
 * Generic / placeholder engines are not considered a working public engine.
 */
const PLACEHOLDER_ENGINE_TYPES = new Set<string>(["", "auto", "generic-directory"]);

/**
 * Strict explicit suppression only.
 *
 * IMPORTANT:
 * - No broad family-pattern hiding.
 * - Only known duplicate / low-value public slugs go here.
 * - This keeps counts stable and behavior predictable.
 */
const HIDDEN_PUBLIC_TOOL_SLUGS = new Set<string>([
  "base64-decoder",
  "url-decoder",
  "text-transformer",
]);

function isExplicitlyHidden(slug: string) {
  return HIDDEN_PUBLIC_TOOL_SLUGS.has(slug);
}

export function resolveToolEngineType(item: ToolVisibilityItem): string {
  return normalize(item.engine_type);
}

export function isToolPlaceholder(item: ToolVisibilityItem): boolean {
  const slug = normalize(item.slug);

  if (!slug) {
    return true;
  }

  /**
   * Explicitly hidden tools are inventory-policy exclusions,
   * not admin placeholders.
   */
  if (isExplicitlyHidden(slug)) {
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

  if (isExplicitlyHidden(slug)) {
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