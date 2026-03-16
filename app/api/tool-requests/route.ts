import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  inferLiveEngine,
  normalizeCategory,
  safeSlug,
} from "@/lib/admin-publishing";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

type Verdict = "build-now" | "needs-engine" | "not-recommended";

function fallbackVerdict(
  category: "tool" | "calculator" | "ai-tool",
  name: string
) {
  const slug = safeSlug(name);
  const engine = inferLiveEngine(category, slug);

  if (category === "ai-tool") {
    return {
      ai_summary: "This looks suitable for a live AI-powered text workflow.",
      ai_verdict: "build-now" as Verdict,
      recommended_category: category,
      recommended_engine: "openai-text-tool",
    };
  }

  if (engine !== "generic-directory") {
    return {
      ai_summary: "This looks compatible with an existing live reusable engine.",
      ai_verdict: "build-now" as Verdict,
      recommended_category: category,
      recommended_engine: engine,
    };
  }

  return {
    ai_summary:
      "This idea likely needs a new dedicated engine or external integration before it should be published live.",
    ai_verdict: "needs-engine" as Verdict,
    recommended_category: category,
    recommended_engine: engine,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const requested_name = String(body.requested_name || "").trim();
    const requested_category = normalizeCategory(body.requested_category);
    const description = String(body.description || "").trim();
    const requester_name = String(body.requester_name || "").trim();
    const requester_email = String(body.requester_email || "").trim();

    if (!requested_name || !description) {
      return NextResponse.json(
        { error: "Requested name and description are required." },
        { status: 400 }
      );
    }

    let assessment = fallbackVerdict(requested_category, requested_name);

    try {
      const response = await openai.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: `
Return valid JSON only.
No markdown.
No code fences.

Return exactly:
{
  "ai_summary": "string",
  "ai_verdict": "build-now | needs-engine | not-recommended",
  "recommended_category": "tool | calculator | ai-tool",
  "recommended_engine": "string"
}

Assess whether this user-requested QuickFnd idea should be built now,
needs a new engine, or should not be recommended.
            `.trim(),
          },
          {
            role: "user",
            content: `Name: ${requested_name}
Category: ${requested_category}
Description: ${description}`,
          },
        ],
      });

      const raw = response.output_text || "";
      const parsed = JSON.parse(raw);

      assessment = {
        ai_summary: String(parsed.ai_summary || assessment.ai_summary),
        ai_verdict: String(parsed.ai_verdict || assessment.ai_verdict) as Verdict,
        recommended_category: normalizeCategory(parsed.recommended_category),
        recommended_engine: String(
          parsed.recommended_engine || assessment.recommended_engine
        ),
      };
    } catch {
      // keep fallback
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.from("tool_requests").insert([
      {
        requested_name,
        requested_category,
        description,
        requester_name: requester_name || null,
        requester_email: requester_email || null,
        ai_summary: assessment.ai_summary,
        ai_verdict: assessment.ai_verdict,
        recommended_category: assessment.recommended_category,
        recommended_engine: assessment.recommended_engine,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully.",
    });
  } catch (error) {
    console.error("tool-requests route error:", error);

    return NextResponse.json(
      { error: "Failed to submit request." },
      { status: 500 }
    );
  }
}