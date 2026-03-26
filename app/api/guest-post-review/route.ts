import { NextResponse } from "next/server";
import { getOpenAIClient } from "@/lib/openai-server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type ReviewBreakdown = {
  [key: string]: { score: number; max: number; note: string };
};

type AIReviewResult = {
  score: number;
  passed: boolean;
  feedback: string;
  breakdown: ReviewBreakdown;
};

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      title: string;
      content: string;
      target_keyword: string;
      category: string;
      excerpt?: string;
      tool_slug?: string;
    };

    if (!body.title || !body.content || !body.target_keyword) {
      return NextResponse.json({ error: "title, content and target_keyword required" }, { status: 400 });
    }

    const wordCount = body.content.trim().split(/\s+/).filter(Boolean).length;
    const h2Count = (body.content.match(/^## /gm) || []).length;
    const hasInternalLinks = body.content.includes("quickfnd.com");
    const keywordInTitle = body.title.toLowerCase().includes(body.target_keyword.toLowerCase().split(" ")[0]);
    const keywordInContent = body.content.toLowerCase().includes(body.target_keyword.toLowerCase());

    // Pre-compute structural scores (no AI needed for these)
    const structuralBreakdown: ReviewBreakdown = {
      word_count: {
        score: wordCount >= 900 ? 15 : wordCount >= 600 ? 10 : wordCount >= 300 ? 5 : 0,
        max: 15,
        note: `${wordCount} words${wordCount < 900 ? ` (need ${900 - wordCount} more)` : " ✓"}`,
      },
      headings: {
        score: h2Count >= 4 ? 10 : h2Count >= 2 ? 7 : h2Count >= 1 ? 3 : 0,
        max: 10,
        note: `${h2Count} H2 headings${h2Count < 3 ? " (need at least 3)" : " ✓"}`,
      },
      internal_links: {
        score: hasInternalLinks ? 10 : 0,
        max: 10,
        note: hasInternalLinks ? "QuickFnd links found ✓" : "No links to quickfnd.com tools found",
      },
      keyword_usage: {
        score: (keywordInTitle ? 5 : 0) + (keywordInContent ? 5 : 0),
        max: 10,
        note: `Keyword in title: ${keywordInTitle ? "yes" : "no"} · In content: ${keywordInContent ? "yes" : "no"}`,
      },
    };

    const structuralScore = Object.values(structuralBreakdown).reduce((s, v) => s + v.score, 0);

    // Use GPT to evaluate qualitative dimensions
    const openai = getOpenAIClient();
    const prompt = `You are a senior editorial reviewer for QuickFnd.com — a free browser-based tools platform for developers, finance professionals, and students.

Review this guest article submission and score it on 4 qualitative dimensions. Be strict but fair. Return ONLY valid JSON.

ARTICLE TITLE: "${body.title}"
TARGET KEYWORD: "${body.target_keyword}"
CATEGORY: "${body.category}"
EXCERPT: "${body.excerpt || "(not provided)"}"

ARTICLE CONTENT (first 3000 chars):
${body.content.slice(0, 3000)}

Score each dimension out of the max points. Be specific in notes — these are shown to the contributor.

Return exactly this JSON structure:
{
  "originality": { "score": 0-15, "max": 15, "note": "specific feedback" },
  "relevance": { "score": 0-15, "max": 15, "note": "specific feedback" },
  "writing_quality": { "score": 0-20, "max": 20, "note": "specific feedback" },
  "brand_fit": { "score": 0-5, "max": 5, "note": "specific feedback" },
  "overall_feedback": "2-3 sentence summary of what's good and what needs improvement"
}

Scoring guidelines:
- originality (15): Does it offer a unique angle? Not just repeating what every other article says?
- relevance (15): Is this genuinely useful to QuickFnd's audience? Does it connect to tools/calculators?
- writing_quality (20): Clear structure, good examples, expert voice, no padding or generic AI phrasing?
- brand_fit (5): Helpful tone, not promotional, respects reader's intelligence?`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const aiResult = JSON.parse(raw) as {
      originality: { score: number; max: number; note: string };
      relevance: { score: number; max: number; note: string };
      writing_quality: { score: number; max: number; note: string };
      brand_fit: { score: number; max: number; note: string };
      overall_feedback: string;
    };

    const aiBreakdown: ReviewBreakdown = {
      originality: aiResult.originality || { score: 8, max: 15, note: "Could not evaluate" },
      relevance: aiResult.relevance || { score: 8, max: 15, note: "Could not evaluate" },
      writing_quality: aiResult.writing_quality || { score: 12, max: 20, note: "Could not evaluate" },
      brand_fit: aiResult.brand_fit || { score: 3, max: 5, note: "Could not evaluate" },
    };

    const aiScore = Object.values(aiBreakdown).reduce((s, v) => s + v.score, 0);
    const totalScore = structuralScore + aiScore;

    const review: AIReviewResult = {
      score: totalScore,
      passed: totalScore >= 70,
      feedback: aiResult.overall_feedback || "Review completed.",
      breakdown: { ...structuralBreakdown, ...aiBreakdown },
    };

    return NextResponse.json({ success: true, review });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Review failed" }, { status: 500 });
  }
}