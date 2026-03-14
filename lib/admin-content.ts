export type AdminCategory = "tool" | "calculator" | "ai-tool";

export type GeneratedAdminContent = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
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
  input: Partial<GeneratedAdminContent>
): GeneratedAdminContent {
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || input.name || "");
  const description = String(input.description || "").trim();
  const related_slugs = normalizeRelatedSlugs(input.related_slugs);

  return {
    name,
    slug,
    description,
    related_slugs,
  };
}