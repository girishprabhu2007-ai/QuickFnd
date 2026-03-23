import {
  normalizeEngineConfig,
  type EngineCategory,
  type EngineConfig,
} from "@/lib/engine-metadata";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

export type AdminCategory = "tool" | "calculator" | "ai-tool";

export type GeneratedAdminContent = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string | null;
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

function buildDefaultDescription(name: string, category?: AdminCategory) {
  if (!name) return "";

  if (category === "calculator") {
    return `Use the ${name} on QuickFnd to calculate results instantly with a simple, browser-based interface. Fast, practical, and built for everyday decision-making.`;
  }

  if (category === "ai-tool") {
    return `Use the ${name} on QuickFnd to generate helpful AI-powered output in seconds. Simple, practical, and built for real workflow use.`;
  }

  return `Use the ${name} on QuickFnd to get fast results with a simple, browser-based tool interface. Built for practical everyday use with no unnecessary complexity.`;
}

export function normalizeGeneratedContent(
  input: Partial<GeneratedAdminContent> & Record<string, unknown>,
  category?: AdminCategory
): GeneratedAdminContent {
  const name = String(input.name || "").trim();
  const slug = slugify(String(input.slug || input.name || ""));
  const description =
    String(input.description || "").trim() || buildDefaultDescription(name, category);
  const related_slugs = normalizeRelatedSlugs(input.related_slugs);

  const engineCategory: EngineCategory | undefined = category;
  const suggestion = engineCategory
    ? suggestAdminEngine(engineCategory, {
        name,
        slug,
        description,
        engine_type: input.engine_type,
        engine_config: input.engine_config,
      })
    : null;

  const engine_type = suggestion?.engine_type || null;
  const engine_config = suggestion
    ? suggestion.engine_config
    : normalizeEngineConfig(input.engine_config);

  return {
    name,
    slug,
    description,
    related_slugs,
    engine_type,
    engine_config,
  };
}