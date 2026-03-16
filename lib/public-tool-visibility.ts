import { inferEngineType } from "@/lib/engine-metadata";

type MinimalToolItem = {
  slug: string;
  engine_type?: string | null;
};

export function resolveToolEngineType(item: MinimalToolItem) {
  const explicit = String(item.engine_type || "").trim().toLowerCase();

  if (explicit && explicit !== "auto") {
    return explicit;
  }

  return String(inferEngineType("tool", item.slug) || "generic-directory");
}

export function isToolPlaceholder(item: MinimalToolItem) {
  const resolved = resolveToolEngineType(item);
  return !resolved || resolved === "generic-directory";
}

export function isToolPubliclyVisible(item: MinimalToolItem) {
  return !isToolPlaceholder(item);
}

export function filterVisibleTools<T extends MinimalToolItem>(items: T[]) {
  return items.filter((item) => isToolPubliclyVisible(item));
}