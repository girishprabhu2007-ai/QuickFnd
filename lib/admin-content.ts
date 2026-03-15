import {
  normalizeEngineConfig,
  normalizeEngineType,
  type EngineCategory,
  type EngineConfig,
  type EngineType,
} from "@/lib/engine-metadata";

export type AdminCategory = "tool" | "calculator" | "ai-tool";

export type GeneratedAdminContent = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: EngineType | null;
  engine_config: EngineConfig;
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function normalizeRelatedSlugs(input: unknown): string[] {
  if (Array.isArray(input)) {
    return Array.from(
      new Set(
        input
          .map((item) => String(item).trim())
          .filter(Boolean)
          .map(slugify)
          .filter(Boolean)
      )
    );
  }

  if (typeof input === "string") {
    return Array.from(
      new Set(
        input
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
          .map(slugify)
          .filter(Boolean)
      )
    );
  }

  return [];
}

export function normalizeGeneratedContent(
  input: Partial<GeneratedAdminContent> & Record<string, unknown>,
  category?: AdminCategory
): GeneratedAdminContent {
  const name = String(input.name || "").trim();
  const slug = slugify(String(input.slug || input.name || ""));
  const description = String(input.description || "").trim();
  const related_slugs = normalizeRelatedSlugs(input.related_slugs);

  const engineCategory: EngineCategory | undefined = category;
  const engine_type = engineCategory
    ? normalizeEngineType(engineCategory, input.engine_type, slug)
    : null;

  const engine_config = normalizeEngineConfig(input.engine_config);

  return {
    name,
    slug,
    description,
    related_slugs,
    engine_type,
    engine_config,
  };
}