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

function getSupportedEngineTypes(category: "tool" | "calculator" | "ai-tool") {
  return getAdminEngineOptions(category)
    .map((o) => o.value)
    .filter((v) => v !== "generic-directory");
}

/* -------------------- NORMALIZERS -------------------- */

function normalizeTool(input: any): BulkGeneratedItem | null {
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return null;

  const suggestion = suggestAdminEngine("tool", {
    name,
    slug,
    description: input.description,
  });

  if (!suggestion.engine_type || suggestion.engine_type === "generic-directory") {
    return null;
  }

  return {
    name,
    slug,
    description:
      input.description || buildDefaultDescription(name, "tool"),
    related_slugs: asStringArray(input.related_slugs).slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

function normalizeCalculator(input: any): BulkGeneratedItem | null {
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return null;

  const engine =
    input.engine_type || resolveCalculatorEngine(slug);

  if (!engine) return null;

  if (!getSupportedEngineTypes("calculator").includes(engine)) {
    return null;
  }

  return {
    name,
    slug,
    description:
      input.description || buildDefaultDescription(name, "calculator"),
    related_slugs: asStringArray(input.related_slugs).slice(0, 6),
    engine_type: engine,
    engine_config: input.engine_config || {},
  };
}

function normalizeAITool(input: any): BulkGeneratedItem | null {
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return null;

  const suggestion = suggestAdminEngine("ai-tool", {
    name,
    slug,
    description: input.description,
  });

  if (!suggestion.engine_type || suggestion.engine_type === "generic-directory") {
    return null;
  }

  return {
    name,
    slug,
    description:
      input.description || buildDefaultDescription(name, "ai_tool"),
    related_slugs: asStringArray(input.related_slugs).slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

/* -------------------- PARSERS -------------------- */

function parse(raw: string): any[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.items)) return parsed.items;
    return [];
  } catch {
    return [];
  }
}

/* -------------------- MAIN GENERATOR -------------------- */

export async function generateIdeas(
  topic: string,
  type: "tools" | "calculators" | "ai_tools" = "tools"
): Promise<BulkGeneratedItem[]> {
  const openai = getOpenAIClient();

  let category: "tool" | "calculator" | "ai-tool" = "tool";

  if (type === "calculators") category = "calculator";
  if (type === "ai_tools") category = "ai-tool";

  const supported = getSupportedEngineTypes(category).join(", ");

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
Return only valid JSON.

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

Generate 8 QuickFnd ${type} ideas for topic: ${topic}

Use ONLY these engine types:
${supported}

Do NOT return generic-directory.
        `.trim(),
      },
    ],
  });

  const items = parse(response.output_text || "");

  if (type === "calculators") {
    return items.map(normalizeCalculator).filter(Boolean);
  }

  if (type === "ai_tools") {
    return items.map(normalizeAITool).filter(Boolean);
  }

  return items.map(normalizeTool).filter(Boolean);
}