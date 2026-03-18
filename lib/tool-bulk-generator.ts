import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import { getAdminEngineOptions, suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { slugify } from "@/lib/admin-content";
import { resolveCalculatorEngine } from "@/lib/calculator-engine-map";

export type BulkGeneratedTool = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

export type BulkGeneratedItem = BulkGeneratedTool;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

function buildDefaultDescription(name: string, category: "tool" | "calculator") {
  if (category === "calculator") {
    return `Use the ${name} on QuickFnd to calculate results instantly with a simple browser-based workflow.`;
  }

  return `Use the ${name} on QuickFnd to get fast results in a simple browser-based workflow.`;
}

export function getSupportedToolEngineTypes(): string[] {
  return getAdminEngineOptions("tool")
    .map((option) => option.value)
    .filter((value) => value !== "generic-directory");
}

export function getSupportedCalculatorEngineTypes(): string[] {
  return getAdminEngineOptions("calculator")
    .map((option) => option.value)
    .filter((value) => value !== "generic-directory");
}

export function normalizeBulkGeneratedTool(input: unknown): BulkGeneratedTool | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const name = String(record.name || "").trim();
  const slug = slugify(String(record.slug || name));
  const description = String(record.description || "").trim();

  if (!name || !slug) return null;

  const suggestion = suggestAdminEngine("tool", {
    name,
    slug,
    description,
    engine_type: record.engine_type,
    engine_config: record.engine_config,
  });

  if (
    !suggestion.is_supported ||
    !suggestion.engine_type ||
    suggestion.engine_type === "generic-directory"
  ) {
    return null;
  }

  return {
    name,
    slug,
    description: description || buildDefaultDescription(name, "tool"),
    related_slugs: asStringArray(record.related_slugs)
      .map(slugify)
      .filter(Boolean)
      .slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

export function normalizeBulkGeneratedCalculator(input: unknown): BulkGeneratedItem | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const name = String(record.name || "").trim();
  const slug = slugify(String(record.slug || name));
  const description = String(record.description || "").trim();

  if (!name || !slug) return null;

  const suggestedEngine =
    String(record.engine_type || "").trim().toLowerCase() || resolveCalculatorEngine(slug);

  if (!suggestedEngine) {
    return null;
  }

  if (!getSupportedCalculatorEngineTypes().includes(suggestedEngine)) {
    return null;
  }

  return {
    name,
    slug,
    description: description || buildDefaultDescription(name, "calculator"),
    related_slugs: asStringArray(record.related_slugs)
      .map(slugify)
      .filter(Boolean)
      .slice(0, 6),
    engine_type: suggestedEngine,
    engine_config:
      record.engine_config && typeof record.engine_config === "object" && !Array.isArray(record.engine_config)
        ? (record.engine_config as Record<string, unknown>)
        : {},
  };
}

export function parseBulkGeneratedTools(raw: string): BulkGeneratedTool[] {
  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => normalizeBulkGeneratedTool(item))
        .filter((item): item is BulkGeneratedTool => Boolean(item));
    }

    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items
        .map((item: unknown) => normalizeBulkGeneratedTool(item))
        .filter((item: BulkGeneratedTool | null): item is BulkGeneratedTool => Boolean(item));
    }

    return [];
  } catch {
    return [];
  }
}

export function parseBulkGeneratedCalculators(raw: string): BulkGeneratedItem[] {
  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => normalizeBulkGeneratedCalculator(item))
        .filter((item): item is BulkGeneratedItem => Boolean(item));
    }

    if (parsed && Array.isArray(parsed.items)) {
      return parsed.items
        .map((item: unknown) => normalizeBulkGeneratedCalculator(item))
        .filter((item: BulkGeneratedItem | null): item is BulkGeneratedItem => Boolean(item));
    }

    return [];
  } catch {
    return [];
  }
}

export function filterSupportedBulkTools(items: BulkGeneratedTool[]): BulkGeneratedTool[] {
  const supported = new Set(getSupportedToolEngineTypes());

  return items.filter((item) => {
    if (!item?.name || !item?.slug || !item?.engine_type) return false;
    if (item.engine_type === "generic-directory") return false;
    return supported.has(item.engine_type);
  });
}

export function filterSupportedBulkCalculators(items: BulkGeneratedItem[]): BulkGeneratedItem[] {
  const supported = new Set(getSupportedCalculatorEngineTypes());

  return items.filter((item) => {
    if (!item?.name || !item?.slug || !item?.engine_type) return false;
    if (item.engine_type === "generic-directory") return false;
    return supported.has(item.engine_type);
  });
}

export async function insertBulkTools(items: BulkGeneratedTool[]) {
  const supabase = getSupabaseAdmin();

  const created: BulkGeneratedTool[] = [];
  const skipped: Array<{ slug: string; reason: string }> = [];

  for (const item of items) {
    const normalized = normalizeBulkGeneratedTool(item);

    if (!normalized) {
      skipped.push({
        slug: String(item?.slug || ""),
        reason: "Invalid or unsupported item shape.",
      });
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("tools")
      .select("slug")
      .eq("slug", normalized.slug)
      .maybeSingle();

    if (existingError) {
      skipped.push({
        slug: normalized.slug,
        reason: existingError.message,
      });
      continue;
    }

    if (existing) {
      skipped.push({
        slug: normalized.slug,
        reason: "Slug already exists.",
      });
      continue;
    }

    const { error: insertError } = await supabase.from("tools").insert({
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      related_slugs: normalized.related_slugs,
      engine_type: normalized.engine_type,
      engine_config: normalized.engine_config,
    });

    if (insertError) {
      skipped.push({
        slug: normalized.slug,
        reason: insertError.message,
      });
      continue;
    }

    created.push(normalized);
  }

  return {
    created,
    skipped,
    createdCount: created.length,
    skippedCount: skipped.length,
  };
}

export async function insertBulkCalculators(items: BulkGeneratedItem[]) {
  const supabase = getSupabaseAdmin();

  const created: BulkGeneratedItem[] = [];
  const skipped: Array<{ slug: string; reason: string }> = [];

  for (const item of items) {
    const normalized = normalizeBulkGeneratedCalculator(item);

    if (!normalized) {
      skipped.push({
        slug: String(item?.slug || ""),
        reason: "Invalid or unsupported calculator shape.",
      });
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("calculators")
      .select("slug")
      .eq("slug", normalized.slug)
      .maybeSingle();

    if (existingError) {
      skipped.push({
        slug: normalized.slug,
        reason: existingError.message,
      });
      continue;
    }

    if (existing) {
      skipped.push({
        slug: normalized.slug,
        reason: "Slug already exists.",
      });
      continue;
    }

    const { error: insertError } = await supabase.from("calculators").insert({
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      related_slugs: normalized.related_slugs,
      engine_type: normalized.engine_type,
      engine_config: normalized.engine_config,
    });

    if (insertError) {
      skipped.push({
        slug: normalized.slug,
        reason: insertError.message,
      });
      continue;
    }

    created.push(normalized);
  }

  return {
    created,
    skipped,
    createdCount: created.length,
    skippedCount: skipped.length,
  };
}

export async function insertBulkItems(
  items: BulkGeneratedItem[],
  category: "tool" | "calculator"
) {
  if (category === "calculator") {
    return insertBulkCalculators(items);
  }

  return insertBulkTools(items);
}

export async function generateIdeas(
  topic: string,
  type: "tools" | "calculators" | "ai_tools" = "tools"
): Promise<BulkGeneratedItem[]> {
  const openai = getOpenAIClient();

  if (type === "calculators") {
    const supportedEngines = getSupportedCalculatorEngineTypes().join(", ");

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Return only valid JSON.
No markdown.
No code fences.

Return exactly this shape:
{
  "items": [
    {
      "name": "string",
      "slug": "string",
      "description": "string",
      "related_slugs": ["string"],
      "engine_type": "string",
      "engine_config": {}
    }
  ]
}

Generate 8 QuickFnd calculator ideas for the topic: ${topic}

Only use these supported engine types:
${supportedEngines}

Do not return generic-directory or placeholder items.
          `.trim(),
        },
      ],
    });

    const parsed = parseBulkGeneratedCalculators(response.output_text || "");
    return filterSupportedBulkCalculators(parsed);
  }

  const supportedEngines = getSupportedToolEngineTypes().join(", ");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
Return only valid JSON.
No markdown.
No code fences.

Return exactly this shape:
{
  "items": [
    {
      "name": "string",
      "slug": "string",
      "description": "string",
      "related_slugs": ["string"],
      "engine_type": "string",
      "engine_config": {}
    }
  ]
}

Generate 8 QuickFnd ${type} ideas for the topic: ${topic}

Only use these supported engine types:
${supportedEngines}

Do not return generic-directory or placeholder items.
        `.trim(),
      },
    ],
  });

  const parsed = parseBulkGeneratedTools(response.output_text || "");
  return filterSupportedBulkTools(parsed);
}