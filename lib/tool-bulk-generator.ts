import { ENGINE_OPTIONS, inferEngineType, normalizeEngineConfig } from "@/lib/engine-metadata";
import { ensureUniqueSlug, findExistingBySlug, getSupabaseAdmin, safeSlug } from "@/lib/admin-publishing";

export type BulkGeneratedTool = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

export function getSupportedToolEngineTypes() {
  return ENGINE_OPTIONS.tool
    .map((option) => option.value)
    .filter((value) => value !== "generic-directory");
}

export function normalizeBulkGeneratedTool(input: Record<string, unknown>): BulkGeneratedTool | null {
  const name = String(input.name || "").trim();
  const slug = safeSlug(String(input.slug || name));
  const description = String(input.description || "").trim();

  const relatedSlugs = Array.isArray(input.related_slugs)
    ? input.related_slugs.map((item) => safeSlug(String(item))).filter(Boolean)
    : [];

  const suggestedEngineType = String(input.engine_type || "").trim().toLowerCase();
  const inferredEngineType = inferEngineType("tool", slug) || "generic-directory";
  const engineType = suggestedEngineType || inferredEngineType;

  const engineConfig = normalizeEngineConfig(input.engine_config);

  if (!name || !slug || !description) {
    return null;
  }

  return {
    name,
    slug,
    description,
    related_slugs: relatedSlugs.slice(0, 6),
    engine_type: engineType,
    engine_config: engineConfig,
  };
}

export function filterSupportedBulkTools(items: BulkGeneratedTool[]) {
  const supported = new Set(getSupportedToolEngineTypes());

  return items.filter((item) => {
    return supported.has(item.engine_type as never);
  });
}

export function parseBulkGeneratedTools(raw: string): BulkGeneratedTool[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    return normalizeBulkPayload(parsed);
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]|\{[\s\S]*\}/);
    if (!match) return [];

    try {
      const parsed = JSON.parse(match[0]) as unknown;
      return normalizeBulkPayload(parsed);
    } catch {
      return [];
    }
  }
}

function normalizeBulkPayload(parsed: unknown): BulkGeneratedTool[] {
  let items: unknown[] = [];

  if (Array.isArray(parsed)) {
    items = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    "items" in parsed &&
    Array.isArray((parsed as { items?: unknown[] }).items)
  ) {
    items = (parsed as { items: unknown[] }).items;
  }

  return items
    .map((item) => normalizeBulkGeneratedTool((item ?? {}) as Record<string, unknown>))
    .filter((item): item is BulkGeneratedTool => Boolean(item));
}

export async function insertBulkTools(items: BulkGeneratedTool[]) {
  const supabaseAdmin = getSupabaseAdmin();
  const created: BulkGeneratedTool[] = [];
  const skipped: { slug: string; reason: string }[] = [];

  for (const item of items) {
    const existing = await findExistingBySlug("tool", item.slug);

    if (existing) {
      skipped.push({
        slug: item.slug,
        reason: "already-exists",
      });
      continue;
    }

    const uniqueSlug = await ensureUniqueSlug("tool", item.slug);

    const payload = {
      name: item.name,
      slug: uniqueSlug,
      description: item.description,
      related_slugs: item.related_slugs,
      engine_type: item.engine_type,
      engine_config: item.engine_config,
    };

    const { error } = await supabaseAdmin.from("tools").insert([payload]);

    if (error) {
      skipped.push({
        slug: item.slug,
        reason: error.message,
      });
      continue;
    }

    created.push({
      ...item,
      slug: uniqueSlug,
    });
  }

  return { created, skipped };
}