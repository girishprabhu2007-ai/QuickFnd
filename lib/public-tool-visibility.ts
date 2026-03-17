import { inferEngineType } from "@/lib/engine-metadata";

type MinimalToolItem = {
  slug: string;
  name?: string | null;
  description?: string | null;
  engine_type?: string | null;
};

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

export function resolveToolEngineType(item: MinimalToolItem) {
  const explicit = normalize(item.engine_type);

  if (explicit && explicit !== "auto") {
    return explicit;
  }

  return String(inferEngineType("tool", item.slug) || "generic-directory");
}

export function isToolPlaceholder(item: MinimalToolItem) {
  const resolved = resolveToolEngineType(item);

  if (!resolved || resolved === "generic-directory") {
    return true;
  }

  return false;
}

export function isToolPubliclyVisible(item: MinimalToolItem) {
  return !isToolPlaceholder(item);
}

export function filterVisibleTools<T extends MinimalToolItem>(items: T[]) {
  return items.filter((item) => isToolPubliclyVisible(item));
}