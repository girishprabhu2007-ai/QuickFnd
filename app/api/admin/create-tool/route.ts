import { NextResponse } from "next/server";
import {
  buildPublicPath,
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
  getTable,
  normalizeCategory,
  type AdminCategory,
} from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import { normalizeGeneratedContent } from "@/lib/admin-content";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

type GeneratedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config?: Record<string, unknown>;
};

function normalizeGeneratedItem(
  input: Record<string, unknown>,
  category: AdminCategory
): GeneratedItem {
  const normalized = normalizeGeneratedContent(input, category);

  return {
    name: normalized.name,
    slug: normalized.slug,
    description: normalized.description,
    related_slugs: normalized.related_slugs,
    engine_type: String(normalized.engine_type || ""),
    engine_config: normalized.engine_config,
  };
}

function parseGeneratedItem(raw: string, category: AdminCategory): GeneratedItem | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return normalizeGeneratedItem(parsed, category);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;
      return normalizeGeneratedItem(parsed, category);
    } catch {
      return null;
    }
  }
}

function isWeakSlug(slug: string) {
  return slug.length < 5 || !slug.includes("-");
}

function isWeakDescription(desc: string) {
  return desc.length < 40;
}

async function generateItemFromIdea(
  idea: string,
  category: AdminCategory
): Promise<GeneratedItem | null> {
  const prompt = `
Return valid JSON only.
No markdown.
No code fences.

Create a HIGH QUALITY QuickFnd ${category} entry.

Idea: ${idea}

STRICT RULES:
- name must be clear and user-focused
- slug must be SEO-friendly and specific (avoid generic words)
- description must explain real user value (not generic filler)
- related_slugs must be relevant and realistic
- engine_type must match a REAL usable engine
- DO NOT invent fake tools

Return exactly:
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "related_slugs": ["string", "string", "string"],
  "engine_type": "string",
  "engine_config": {}
}
  `.trim();

  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [{ role: "system", content: prompt }],
  });

  return parseGeneratedItem(response.output_text || "", category);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const idea = String(body.idea || "").trim();
    const category = normalizeCategory(body.category);
    const requestId = body.requestId ? Number(body.requestId) : null;

    let item: GeneratedItem | null = null;

    const hasStructuredInput =
      String(body.name || "").trim() ||
      String(body.slug || "").trim() ||
      String(body.description || "").trim();

    if (hasStructuredInput) {
      item = normalizeGeneratedItem(body, category);
    } else if (idea) {
      item = await generateItemFromIdea(idea, category);
    }

    if (!item || !item.name || !item.slug || !item.description) {
      return NextResponse.json(
        { error: "Name and description are required, or provide a valid idea." },
        { status: 400 }
      );
    }

    // 🔥 QUALITY GUARD
    if (isWeakSlug(item.slug) || isWeakDescription(item.description)) {
      return NextResponse.json(
        {
          error:
            "Generated item is too weak (slug or description). Please refine the idea.",
        },
        { status: 400 }
      );
    }

    const suggestion = suggestAdminEngine(category, {
      name: item.name,
      slug: item.slug,
      description: item.description,
      engine_type: body.engine_type ?? item.engine_type,
      engine_config: body.engine_config ?? item.engine_config,
    });

    if (!suggestion.engine_type) {
      return NextResponse.json(
        { error: "No valid engine assigned. Cannot create item." },
        { status: 400 }
      );
    }

    if (category !== "ai-tool" && !suggestion.is_supported) {
      return NextResponse.json(
        {
          error:
            "This item does not match a real working engine. Avoid publishing fake tools.",
        },
        { status: 400 }
      );
    }

    const existing = await findExistingBySlug(category, item.slug);
    if (existing) {
      const path = buildPublicPath(category, item.slug);

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        slug: item.slug,
        table: getTable(category),
        path,
        engine_type: suggestion.engine_type,
        engine_config: suggestion.engine_config,
        engine_reason: suggestion.reason,
      });
    }

    const uniqueSlug = await ensureUniqueSlug(category, item.slug);
    const table = getTable(category);

    const payload = {
      name: item.name,
      slug: uniqueSlug,
      description: item.description,
      related_slugs: item.related_slugs,
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from(table).insert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      created: true,
      slug: uniqueSlug,
      table,
      path: buildPublicPath(category, uniqueSlug),
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
      engine_reason: suggestion.reason,
      quality: {
        strong_match: suggestion.is_supported,
      },
    });
  } catch (error) {
    console.error("create-tool route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create tool.",
      },
      { status: 500 }
    );
  }
}