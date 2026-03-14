import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type SearchItem = {
  name: string;
  slug: string;
  description: string;
  type: "tool" | "calculator" | "ai-tool";
  href: string;
};

function normalizeQuery(value: string) {
  return value.trim();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = normalizeQuery(searchParams.get("q") || "");

    if (!q) {
      return NextResponse.json({
        query: "",
        tools: [],
        calculators: [],
        aiTools: [],
      });
    }

    const like = `%${q}%`;

    const [toolsResult, calculatorsResult, aiToolsResult] = await Promise.all([
      supabase
        .from("tools")
        .select("name, slug, description")
        .or(`name.ilike.${like},description.ilike.${like}`)
        .limit(8),

      supabase
        .from("calculators")
        .select("name, slug, description")
        .or(`name.ilike.${like},description.ilike.${like}`)
        .limit(8),

      supabase
        .from("ai_tools")
        .select("name, slug, description")
        .or(`name.ilike.${like},description.ilike.${like}`)
        .limit(8),
    ]);

    const tools: SearchItem[] = (toolsResult.data || []).map((item) => ({
      name: item.name,
      slug: item.slug,
      description: item.description,
      type: "tool",
      href: `/tools/${item.slug}`,
    }));

    const calculators: SearchItem[] = (calculatorsResult.data || []).map((item) => ({
      name: item.name,
      slug: item.slug,
      description: item.description,
      type: "calculator",
      href: `/calculators/${item.slug}`,
    }));

    const aiTools: SearchItem[] = (aiToolsResult.data || []).map((item) => ({
      name: item.name,
      slug: item.slug,
      description: item.description,
      type: "ai-tool",
      href: `/ai-tools/${item.slug}`,
    }));

    return NextResponse.json({
      query: q,
      tools,
      calculators,
      aiTools,
    });
  } catch (error) {
    console.error("Search route error:", error);
    return NextResponse.json(
      { error: "Failed to search content." },
      { status: 500 }
    );
  }
}