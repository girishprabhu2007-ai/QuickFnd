import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import {
  getAdminEngineOptions,
  suggestAdminEngine,
} from "@/lib/admin-engine-assistant";
import { slugify } from "@/lib/admin-content";
import { resolveCalculatorEngine } from "@/lib/calculator-engine-map";

export type BulkGeneratedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

function buildDefaultDescription(name: string, category: string) {
  if (category === "calculator") {
    return `Use the ${name} on QuickFnd to calculate results instantly.`;
  }
  if (category === "ai_tool") {
    return `Use the ${name} on QuickFnd to generate AI-powered results instantly.`;
  }
  return `Use the ${name} on QuickFnd to get fast results instantly.`;
}

function extractJsonText(raw: string): string {
  const text = String(raw || "").trim();
  if (!text) return '{"items":[]}';

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.slice(firstBrace, lastBrace + 1).trim();
  }

  const firstBracket = text.indexOf("[");
  const lastBracket = text.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    return text.slice(firstBracket, lastBracket + 1).trim();
  }

  return text;
}

function safeParseItems(raw: string): unknown[] {
  try {
    const jsonText = extractJsonText(raw);
    const parsed = JSON.parse(jsonText);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    if (parsed && typeof parsed === "object" && Array.isArray((parsed as { items?: unknown[] }).items)) {
      return (parsed as { items: unknown[] }).items;
    }

    return [];
  } catch {
    return [];
  }
}

export function getSupportedToolEngineTypes(): string[] {
  return getAdminEngineOptions("tool")
    .map((o) => String(o.value))
    .filter((v) => v !== "generic-directory");
}

export function getSupportedCalculatorEngineTypes(): string[] {
  return getAdminEngineOptions("calculator")
    .map((o) => String(o.value))
    .filter((v) => v !== "generic-directory");
}

export function getSupportedAIToolEngineTypes(): string[] {
  return getAdminEngineOptions("ai-tool")
    .map((o) => String(o.value))
    .filter((v) => v !== "generic-directory");
}

export function normalizeBulkGeneratedTool(input: unknown): BulkGeneratedItem | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const name = String(record.name || "").trim();
  const slug = slugify(String(record.slug || name));
  if (!name || !slug) return null;

  const suggestion = suggestAdminEngine("tool", {
    name,
    slug,
    description: String(record.description || ""),
    engine_type: record.engine_type,
    engine_config: record.engine_config,
  });

  if (!suggestion.engine_type || suggestion.engine_type === "generic-directory") {
    return null;
  }

  return {
    name,
    slug,
    description:
      String(record.description || "").trim() || buildDefaultDescription(name, "tool"),
    related_slugs: asStringArray(record.related_slugs).map(slugify).filter(Boolean).slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

export function normalizeBulkGeneratedCalculator(input: unknown): BulkGeneratedItem | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const name = String(record.name || "").trim();
  const slug = slugify(String(record.slug || name));
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
    description:
      String(record.description || "").trim() || buildDefaultDescription(name, "calculator"),
    related_slugs: asStringArray(record.related_slugs).map(slugify).filter(Boolean).slice(0, 6),
    engine_type: suggestedEngine,
    engine_config:
      record.engine_config &&
      typeof record.engine_config === "object" &&
      !Array.isArray(record.engine_config)
        ? (record.engine_config as Record<string, unknown>)
        : {},
  };
}

export function normalizeBulkGeneratedAITool(input: unknown): BulkGeneratedItem | null {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;

  const name = String(record.name || "").trim();
  const slug = slugify(String(record.slug || name));
  if (!name || !slug) return null;

  const suggestion = suggestAdminEngine("ai-tool", {
    name,
    slug,
    description: String(record.description || ""),
    engine_type: record.engine_type,
    engine_config: record.engine_config,
  });

  if (!suggestion.engine_type || suggestion.engine_type === "generic-directory") {
    return null;
  }

  return {
    name,
    slug,
    description:
      String(record.description || "").trim() || buildDefaultDescription(name, "ai_tool"),
    related_slugs: asStringArray(record.related_slugs).map(slugify).filter(Boolean).slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

export function parseBulkGeneratedTools(raw: string): BulkGeneratedItem[] {
  return safeParseItems(raw)
    .map((item) => normalizeBulkGeneratedTool(item))
    .filter((item): item is BulkGeneratedItem => Boolean(item));
}

export function parseBulkGeneratedCalculators(raw: string): BulkGeneratedItem[] {
  return safeParseItems(raw)
    .map((item) => normalizeBulkGeneratedCalculator(item))
    .filter((item): item is BulkGeneratedItem => Boolean(item));
}

export function parseBulkGeneratedAITools(raw: string): BulkGeneratedItem[] {
  return safeParseItems(raw)
    .map((item) => normalizeBulkGeneratedAITool(item))
    .filter((item): item is BulkGeneratedItem => Boolean(item));
}

export function filterSupportedBulkTools(items: BulkGeneratedItem[]) {
  const supported = new Set(getSupportedToolEngineTypes());
  return items.filter((i) => supported.has(i.engine_type));
}

export function filterSupportedBulkCalculators(items: BulkGeneratedItem[]) {
  const supported = new Set(getSupportedCalculatorEngineTypes());
  return items.filter((i) => supported.has(i.engine_type));
}

export function filterSupportedBulkAITools(items: BulkGeneratedItem[]) {
  const supported = new Set(getSupportedAIToolEngineTypes());
  return items.filter((i) => supported.has(i.engine_type));
}

export async function insertBulkTools(items: BulkGeneratedItem[]) {
  const supabase = getSupabaseAdmin();

  const created: BulkGeneratedItem[] = [];
  const skipped: Array<{ slug: string; reason: string }> = [];

  for (const item of items) {
    const normalized = normalizeBulkGeneratedTool(item);

    if (!normalized) {
      skipped.push({
        slug: String(item?.slug || ""),
        reason: "Invalid or unsupported tool shape.",
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

export async function insertBulkAITools(items: BulkGeneratedItem[]) {
  const supabase = getSupabaseAdmin();

  const created: BulkGeneratedItem[] = [];
  const skipped: Array<{ slug: string; reason: string }> = [];

  for (const item of items) {
    const normalized = normalizeBulkGeneratedAITool(item);

    if (!normalized) {
      skipped.push({
        slug: String(item?.slug || ""),
        reason: "Invalid or unsupported AI tool shape.",
      });
      continue;
    }

    const { data: existing, error: existingError } = await supabase
      .from("ai_tools")
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

    const { error: insertError } = await supabase.from("ai_tools").insert({
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

export async function generateIdeas(
  topic: string,
  type: "tools" | "calculators" | "ai_tools" = "tools"
): Promise<BulkGeneratedItem[]> {
  const openai = getOpenAIClient();

  let supported = "";
  let contentTypeLabel: string = type;

  if (type === "calculators") {
    supported = getSupportedCalculatorEngineTypes().join(", ");
    contentTypeLabel = "calculators";
  } else if (type === "ai_tools") {
    supported = getSupportedAIToolEngineTypes().join(", ");
    contentTypeLabel = "AI tools";
  } else {
    supported = getSupportedToolEngineTypes().join(", ");
    contentTypeLabel = "tools";
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
Return JSON only.
Do not use markdown.
Do not use code fences.

Return exactly:
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

Generate 8 QuickFnd ${contentTypeLabel} for topic: ${topic}

Use only these engine types:
${supported}

Do not return generic-directory.
Do not return placeholders.
        `.trim(),
      },
    ],
  });

  const output = response.output_text || "";

  if (type === "calculators") {
    return filterSupportedBulkCalculators(parseBulkGeneratedCalculators(output));
  }

  if (type === "ai_tools") {
    return filterSupportedBulkAITools(parseBulkGeneratedAITools(output));
  }

  return filterSupportedBulkTools(parseBulkGeneratedTools(output));
}