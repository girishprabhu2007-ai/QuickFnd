import { NextResponse } from "next/server";
import {
  buildPublicPath,
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
  getTable,
  inferLiveEngine,
  normalizeCategory,
  safeSlug,
  type AdminCategory,
} from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";

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
  const name = String(input.name || "").trim();
  const slug = safeSlug(String(input.slug || name));
  const description = String(input.description || "").trim();
  const related = Array.isArray(input.related_slugs)
    ? input.related_slugs.map((item) => safeSlug(String(item))).filter(Boolean)
    : [];
  const engine_type =
    String(input.engine_type || "").trim() || inferLiveEngine(category, slug);
  const engine_config =
    input.engine_config &&
    typeof input.engine_config === "object" &&
    !Array.isArray(input.engine_config)
      ? (input.engine_config as Record<string, unknown>)
      : {};

  return {
    name,
    slug,
    description,
    related_slugs: related.slice(0, 6),
    engine_type,
    engine_config,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const idea = String(body.idea || "").trim();
    const category = normalizeCategory(body.category);
    const requestId = body.requestId ? Number(body.requestId) : null;

    if (!idea) {
      return NextResponse.json({ error: "Idea required." }, { status: 400 });
    }

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
- for AI tools, prefer "openai-text-tool"
- for tools/calculators, only use a real engine if the idea clearly matches a common live utility
- if no clear live engine exists, still return the best slug and a reasonable description
    `.trim();

    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [{ role: "system", content: prompt }],
    });

    const raw = response.output_text || "";
    const item = parseGeneratedItem(raw, category);

    if (!item || !item.name || !item.slug || !item.description) {
      return NextResponse.json(
        { error: "AI returned an invalid tool payload." },
        { status: 500 }
      );
    }

    const inferredEngine = inferLiveEngine(category, item.slug);

    if (category !== "ai-tool" && inferredEngine === "generic-directory") {
      return NextResponse.json(
        {
          error:
            "This idea does not match a live reusable engine yet. Submit it as a request/backlog item instead of publishing a placeholder page.",
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
      });
    }

    const uniqueSlug = await ensureUniqueSlug(category, item.slug);
    const table = getTable(category);

    const payload = {
      name: item.name,
      slug: uniqueSlug,
      description: item.description,
      related_slugs: item.related_slugs,
      engine_type: category === "ai-tool" ? "openai-text-tool" : inferredEngine,
      engine_config: item.engine_config || {},
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
    });
  } catch (error) {
    console.error("create-tool route error:", error);

    return NextResponse.json(
      { error: "Failed to create tool." },
      { status: 500 }
    );
  }
}