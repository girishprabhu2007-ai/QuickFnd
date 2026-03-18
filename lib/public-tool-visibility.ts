import { inferEngineType } from "@/lib/engine-catalog";

type ToolLike = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
  external_url?: string | null;
  is_placeholder?: boolean | null;
  type?: string | null;
};

function asText(item: ToolLike) {
  return `${item.name || ""} ${item.slug || ""} ${item.description || ""}`.toLowerCase();
}

export function resolveToolEngineType(item: ToolLike): string | null {
  if (item.engine_type && String(item.engine_type).trim()) {
    return String(item.engine_type).trim().toLowerCase();
  }

  const inferred = inferEngineType("tool", `${item.slug || ""} ${asText(item)}`);
  return inferred && inferred !== "generic-directory" ? inferred : null;
}

export function isToolPlaceholder(item: ToolLike): boolean {
  if (!item) return true;
  if (item.is_placeholder === true) return true;

  const engineType = resolveToolEngineType(item);
  const externalOnly = Boolean(item.external_url) && !engineType;

  if (externalOnly) return true;

  const text = asText(item);

  if (text.includes("coming soon")) return true;
  if (text.includes("placeholder")) return true;
  if (text.includes("under construction")) return true;

  return false;
}

export function isToolVisible(item: ToolLike): boolean {
  if (!item) return false;
  return !isToolPlaceholder(item);
}

export function isToolPubliclyVisible(item: ToolLike): boolean {
  return isToolVisible(item);
}

export function filterVisibleTools<T extends ToolLike>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isToolPubliclyVisible(item));
}