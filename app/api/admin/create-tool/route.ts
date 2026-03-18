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

async function generateItemFromIdea(
  idea: string,
  category: AdminCategory
): Promise<GeneratedItem | null> {
  const prompt = `
Return valid JSON only.
No markdown.
No code fences.

Create a QuickFnd ${category} entry for this idea: ${idea}

Return exactly this object:
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "related_slugs": ["string", "string", "string"],
  "engine_type": "string",
  "engine_config": {}
}

Rules:
- slug must be lowercase and hyphen-separated
- description should be 2 concise SEO-friendly sentences
- related_slugs should contain 3 to 6 realistic related slugs
- for AI tools, prefer a real matching AI engine
- for tools/calculators, choose the closest reusable engine
- engine_config should stay small and practical
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

    const suggestion = suggestAdminEngine(category, {
      name: item.name,
      slug: item.slug,
      description: item.description,
      engine_type: body.engine_type ?? item.engine_type,
      engine_config: body.engine_config ?? item.engine_config,
    });

    if (category !== "ai-tool" && !suggestion.is_supported) {
      return NextResponse.json(
        {
          error:
            "This item does not match a live reusable engine yet. Save it as a request/backlog item instead of publishing a placeholder page.",
        },
        { status: 400 }
      );
    }

    const existing = await findExistingBySlug(category, item.slug);
    if (existing) {
      const path = buildPublicPath(category, item.slug);

      if (requestId) {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from("tool_requests")
          .update({
            status: "implemented",
            created_public_slug: item.slug,
            implemented_at: new Date().toISOString(),
          })
          .eq("id", requestId);
      }

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

    if (requestId) {
      await supabaseAdmin
        .from("tool_requests")
        .update({
          status: "implemented",
          created_public_slug: uniqueSlug,
          implemented_at: new Date().toISOString(),
        })
        .eq("id", requestId);
    }

    return NextResponse.json({
      success: true,
      created: true,
      alreadyExists: false,
      slug: uniqueSlug,
      table,
      path: buildPublicPath(category, uniqueSlug),
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
      engine_reason: suggestion.reason,
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