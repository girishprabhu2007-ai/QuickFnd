/**
 * lib/public-content-visibility.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * COMPATIBILITY SHIM — re-exports from the unified lib/visibility.ts
 *
 * All new code should import directly from @/lib/visibility.
 */

import type { PublicContentItem } from "@/lib/content-pages";
import { filterVisibleByType, type ContentType } from "@/lib/visibility";

export function isContentPubliclyVisible(item: PublicContentItem): boolean {
  if (!item.engine_type) return false;
  if (item.engine_type === "generic-directory") return false;
  return true;
}

export function filterVisibleContent(
  items: PublicContentItem[],
  type?: ContentType
): PublicContentItem[] {
  if (type) return filterVisibleByType(type, items);
  return items.filter(isContentPubliclyVisible);
}
