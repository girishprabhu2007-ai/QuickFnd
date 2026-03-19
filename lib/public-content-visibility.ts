import type { PublicContentItem } from "@/lib/content-pages";

/**
 * Generic visibility check for ANY content type
 */
export function isContentPubliclyVisible(item: PublicContentItem): boolean {
  if (!item.engine_type) return false;

  // hide generic-directory (non-runtime)
  if (item.engine_type === "generic-directory") return false;

  return true;
}

/**
 * Generic filter
 */
export function filterVisibleContent(items: PublicContentItem[]) {
  return items.filter(isContentPubliclyVisible);
}