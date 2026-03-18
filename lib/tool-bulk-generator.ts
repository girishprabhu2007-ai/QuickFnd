import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";

export type BulkGeneratedTool = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

const SUPPORTED_ENGINE_TYPES = [
  "password-strength-checker",
  "password-generator",
  "json-formatter",
  "word-counter",
  "uuid-generator",
  "slug-generator",
  "random-string-generator",
  "base64-encoder",
  "base64-decoder",
  "currency-converter",
  "regex-tester",
  "timestamp-converter",
  "md5-generator",
  "sha256-generator",
  "binary-to-text",
  "text-to-binary",
  "hex-to-rgb",
  "rgb-to-hex",
  "openai-text-tool",
  "text-case-converter",
  "text-transformer",
] as const;

function safeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean);
}

export function getSupportedToolEngineTypes(): string[] {
  return [...SUPPORTED_ENGINE_TYPES];
}

export function normalizeBulkGeneratedTool(input: any): BulkGeneratedTool | null {
  if (!input || typeof input !== "object") return null;

  const name = String(input.name || "").trim();
  const description = String(input.description || "").trim();
  const slug = safeSlug(String(input.slug || name));
  const engine_type = String(input.engine_type || "").trim();

  if (!name || !slug || !engine_type) return null;

  return {
    name,
    slug,
    description: description || `${name} on QuickFnd.`,
    related_slugs: asStringArray(input.related_slugs).slice(0, 6),
    engine_type,
    engine_config:
      input.engine_config && typeof input.engine_config === "object"
        ? input.engine_config
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

export function filterSupportedBulkTools(items: BulkGeneratedTool[]): BulkGeneratedTool[] {
  const supported = new Set(getSupportedToolEngineTypes());

  return items.filter((item) => {
    if (!item?.name || !item?.slug || !item?.engine_type) return false;
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
        reason: "Invalid item shape.",
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

export async function generateIdeas(
  topic: string,
  type: "tools" | "calculators" | "ai_tools" = "tools"
): Promise<BulkGeneratedTool[]> {
  const openai = getOpenAIClient();
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
        `.trim(),
      },
    ],
  });

  const parsed = parseBulkGeneratedTools(response.output_text || "");
  return filterSupportedBulkTools(parsed);
}