import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { isToolPubliclyVisible } from "@/lib/public-tool-visibility";

type SearchItem = {
  name: string;
  slug: string;
  description: string;
  type: "tool" | "calculator" | "ai-tool";
  href: string;
  engine_type?: string | null;
};

function normalizeQuery(value: string) {
  return value.trim().toLowerCase();
}

function matchesQuery(item: { name: string; slug: string; description: string }, query: string) {
  const q = normalizeQuery(query);
  if (!q) return false;

  const haystack = `${item.name} ${item.slug} ${item.description}`.toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

function rankItems<T extends SearchItem>(items: T[], query: string) {
  const q = normalizeQuery(query);

  return items
    .map((item) => {
      let score = 0;
      const name = item.name.toLowerCase();
      const slug = item.slug.toLowerCase();
      const description = item.description.toLowerCase();

      if (name === q) score += 100;
      if (slug === q) score += 90;
      if (name.startsWith(q)) score += 60;
      if (slug.startsWith(q)) score += 50;
      if (name.includes(q)) score += 30;
      if (slug.includes(q)) score += 20;
      if (description.includes(q)) score += 10;

      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.item);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = String(searchParams.get("q") || "").trim();

    if (!query) {
      return NextResponse.json({
        query: "",
        tools: [],
        calculators: [],
        aiTools: [],
      });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const [toolsRes, calculatorsRes, aiToolsRes] = await Promise.all([
      supabaseAdmin.from("tools").select("name,slug,description,engine_type"),
      supabaseAdmin.from("calculators").select("name,slug,description"),
      supabaseAdmin.from("ai_tools").select("name,slug,description"),
    ]);

    if (toolsRes.error) throw new Error(toolsRes.error.message);
    if (calculatorsRes.error) throw new Error(calculatorsRes.error.message);
    if (aiToolsRes.error) throw new Error(aiToolsRes.error.message);

    const tools: SearchItem[] = (toolsRes.data || [])
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        type: "tool" as const,
        href: `/tools/${item.slug}`,
        engine_type: item.engine_type,
      }))
      .filter((item) => isToolPubliclyVisible(item))
      .filter((item) => matchesQuery(item, query));

    const calculators: SearchItem[] = (calculatorsRes.data || [])
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        type: "calculator" as const,
        href: `/calculators/${item.slug}`,
      }))
      .filter((item) => matchesQuery(item, query));

    const aiTools: SearchItem[] = (aiToolsRes.data || [])
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        type: "ai-tool" as const,
        href: `/ai-tools/${item.slug}`,
      }))
      .filter((item) => matchesQuery(item, query));

    return NextResponse.json({
      query,
      tools: rankItems(tools, query).slice(0, 24),
      calculators: rankItems(calculators, query).slice(0, 24),
      aiTools: rankItems(aiTools, query).slice(0, 24),
    });
  } catch (error) {
    console.error("search route error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Search failed.",
        query: "",
        tools: [],
        calculators: [],
        aiTools: [],
      },
      { status: 500 }
    );
  }
}