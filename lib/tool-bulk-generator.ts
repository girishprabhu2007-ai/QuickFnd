import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import {
  getAdminEngineOptions,
  suggestAdminEngine,
} from "@/lib/admin-engine-assistant";
import { slugify } from "@/lib/admin-content";
import { resolveCalculatorEngine } from "@/lib/calculator-engine-map";

/* ================= TYPES ================= */

export type BulkGeneratedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

/* ================= HELPERS ================= */

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

/* ================= ENGINE SUPPORT ================= */

export function getSupportedToolEngineTypes(): string[] {
  return getAdminEngineOptions("tool")
    .map((o) => o.value)
    .filter((v) => v !== "generic-directory");
}

export function getSupportedCalculatorEngineTypes(): string[] {
  return getAdminEngineOptions("calculator")
    .map((o) => o.value)
    .filter((v) => v !== "generic-directory");
}

export function getSupportedAIToolEngineTypes(): string[] {
  return getAdminEngineOptions("ai-tool")
    .map((o) => o.value)
    .filter((v) => v !== "generic-directory");
}

/* ================= NORMALIZERS ================= */

export function normalizeBulkGeneratedTool(input: any): BulkGeneratedItem | null {
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
    description: input.description || buildDefaultDescription(name, "tool"),
    related_slugs: asStringArray(input.related_slugs).slice(0, 6),
    engine_type: suggestion.engine_type,
    engine_config: suggestion.engine_config || {},
  };
}

export function normalizeBulkGeneratedCalculator(input: any): BulkGeneratedItem | null {
  const name = String(input.name || "").trim();
  const slug = slugify(input.slug || name);
  if (!name || !slug) return null;

  const engine = input.engine_type || resolveCalculatorEngine(slug);

  if (!engine) return null;
  if (!getSupportedCalculatorEngineTypes().includes(engine)) return null;

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

export function normalizeBulkGeneratedAITool(input: any): BulkGeneratedItem | null {
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

/* ================= PARSERS ================= */

export function parseBulkGeneratedTools(raw: string): BulkGeneratedItem[] {
  try {
    const parsed = JSON.parse(raw);
    const items = Array.isArray(parsed) ? parsed : parsed.items || [];
    return items.map(normalizeBulkGeneratedTool).filter(Boolean);
  } catch {
    return [];
  }
}

/* ================= FILTERS ================= */

export function filterSupportedBulkTools(items: BulkGeneratedItem[]) {
  const supported = new Set(getSupportedToolEngineTypes());
  return items.filter((i) => supported.has(i.engine_type));
}

/* ================= INSERT ================= */

export async function insertBulkTools(items: BulkGeneratedItem[]) {
  const supabase = getSupabaseAdmin();

  const created: BulkGeneratedItem[] = [];
  const skipped: any[] = [];

  for (const item of items) {
    const { data: existing } = await supabase
      .from("tools")
      .select("slug")
      .eq("slug", item.slug)
      .maybeSingle();

    if (existing) {
      skipped.push({ slug: item.slug, reason: "exists" });
      continue;
    }

    const { error } = await supabase.from("tools").insert(item);

    if (error) {
      skipped.push({ slug: item.slug, reason: error.message });
      continue;
    }

    created.push(item);
  }

  return { created, skipped };
}

/* ================= GENERATOR ================= */

export async function generateIdeas(
  topic: string,
  type: "tools" | "calculators" | "ai_tools" = "tools"
): Promise<BulkGeneratedItem[]> {
  const openai = getOpenAIClient();

  let supported = "";

  if (type === "calculators") {
    supported = getSupportedCalculatorEngineTypes().join(", ");
  } else if (type === "ai_tools") {
    supported = getSupportedAIToolEngineTypes().join(", ");
  } else {
    supported = getSupportedToolEngineTypes().join(", ");
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
Return JSON only.

{
  "items": [
    {
      "name": "",
      "slug": "",
      "description": "",
      "related_slugs": [],
      "engine_type": "",
      "engine_config": {}
    }
  ]
}

Generate 8 ${type} for topic: ${topic}

Use only:
${supported}

No generic-directory.
        `,
      },
    ],
  });

  const parsed = JSON.parse(response.output_text || "{}");
  const items = parsed.items || [];

  if (type === "calculators") {
    return items.map(normalizeBulkGeneratedCalculator).filter(Boolean);
  }

  if (type === "ai_tools") {
    return items.map(normalizeBulkGeneratedAITool).filter(Boolean);
  }

  return items.map(normalizeBulkGeneratedTool).filter(Boolean);
}