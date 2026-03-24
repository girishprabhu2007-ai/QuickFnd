/**
 * POST /api/admin/generate-seo-content
 * 
 * Generates unique SEO content for a tool/calculator/AI tool using GPT,
 * then saves it to the seo_content table in Supabase.
 * 
 * The seo_content table is the runtime source — seo-content.ts is the 
 * hardcoded fallback. This API makes content generation fully automatic.
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenAIClient } from "@/lib/openai-server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

type RequestBody = {
  slug: string;
  name: string;
  description: string;
  table: "tools" | "calculators" | "ai_tools";
  overwrite?: boolean;
};

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await req.json()) as RequestBody;
    const { slug, name, description, table, overwrite = false } = body;

    if (!slug || !name) {
      return NextResponse.json({ error: "slug and name are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Check if content already exists
    if (!overwrite) {
      const { data: existing } = await supabase
        .from("seo_content")
        .select("slug")
        .eq("slug", slug)
        .eq("table_name", table)
        .maybeSingle();

      if (existing) {
        return NextResponse.json({
          success: false,
          reason: "Content already exists. Pass overwrite:true to regenerate.",
          slug,
        });
      }
    }

    const typeLabel = table === "calculators" ? "calculator"
      : table === "ai_tools" ? "AI tool"
      : "tool";

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are an SEO content writer for QuickFnd — a free browser-based tools platform.
Write genuinely useful, specific content for a single ${typeLabel}.
Content must be unique, accurate, and helpful — not generic filler.
Return JSON only with exactly this shape:
{
  "intro": "2-3 sentences. What it does, how it works, what makes it useful.",
  "benefits": ["4 specific benefits — each a complete sentence describing real user value"],
  "steps": ["4 clear how-to steps — specific to this tool, not generic"],
  "useCases": ["4 real-world use cases — specific scenarios users would recognise"],
  "faqs": [
    {"question": "Specific question about this tool", "answer": "Helpful 1-2 sentence answer"},
    {"question": "Another specific question", "answer": "Helpful answer"},
    {"question": "Third question", "answer": "Helpful answer"},
    {"question": "Fourth question", "answer": "Helpful answer"}
  ]
}`,
        },
        {
          role: "user",
          content: `Generate SEO content for this QuickFnd ${typeLabel}:

Name: ${name}
Slug: ${slug}
Description: ${description}

Write content that:
- Is specific to THIS tool — not generic copy that could apply to any tool
- Uses the tool's actual name naturally throughout
- FAQs should address real questions users would Google about this specific tool
- Steps should reflect how this specific tool actually works
- Benefits should reflect what this tool actually does better than alternatives`,
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";

    let parsed: {
      intro: string;
      benefits: string[];
      steps: string[];
      useCases: string[];
      faqs: { question: string; answer: string }[];
    };

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    // Validate structure
    if (!parsed.intro || !Array.isArray(parsed.benefits) || !Array.isArray(parsed.faqs)) {
      return NextResponse.json({ error: "Invalid AI response structure", parsed }, { status: 500 });
    }

    // Save to seo_content table
    const { error: upsertError } = await supabase
      .from("seo_content")
      .upsert({
        slug,
        table_name: table,
        name,
        intro: parsed.intro,
        benefits: parsed.benefits,
        steps: parsed.steps,
        use_cases: parsed.useCases,
        faqs: parsed.faqs,
        generated_at: new Date().toISOString(),
        source: "gpt-4o-mini",
      }, {
        onConflict: "slug,table_name",
      });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      slug,
      name,
      table,
      content: parsed,
    });

  } catch (error) {
    console.error("generate-seo-content error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate content" },
      { status: 500 }
    );
  }
}

// GET — check if content exists for a slug
export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const table = searchParams.get("table") || "tools";

    if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("seo_content")
      .select("*")
      .eq("slug", slug)
      .eq("table_name", table)
      .maybeSingle();

    return NextResponse.json({ exists: !!data, content: data });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}