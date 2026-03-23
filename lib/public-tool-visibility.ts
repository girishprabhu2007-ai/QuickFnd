/**
 * lib/public-tool-visibility.ts
 * COMPATIBILITY SHIM — re-exports from the unified lib/visibility.ts
 * All new code should import directly from @/lib/visibility.
 */

import type { PublicContentItem } from "@/lib/content-pages";
import { isToolVisible, filterVisibleTools } from "@/lib/visibility";

export type ToolVisibilityItem = {
  slug?: string | null | undefined;
  engine_type?: string | null | undefined;
  name?: string | null | undefined;
  description?: string | null | undefined;
  engine_config?: unknown;
};

export function resolveToolEngineType(item: ToolVisibilityItem): string {
  return String(item.engine_type ?? "").trim().toLowerCase();
}

export function isToolPlaceholder(item: ToolVisibilityItem): boolean {
  const PLACEHOLDER = new Set(["", "auto", "generic-directory"]);
  return PLACEHOLDER.has(resolveToolEngineType(item));
}

// Accepts both ToolVisibilityItem (loose) and PublicContentItem (strict)
export function isToolPubliclyVisible(item: ToolVisibilityItem): boolean {
  return isToolVisible({
    slug: item.slug ?? "",
    engine_type: item.engine_type as PublicContentItem["engine_type"],
    name: String(item.name ?? ""),
    description: String(item.description ?? ""),
    related_slugs: [],
  });
}

export { filterVisibleTools };