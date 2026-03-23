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
      ai_summary: "AI tool request.",
      ai_verdict: "build-now" as Verdict,
      recommended_category: category,
      recommended_engine: "openai-text-tool",
    };
  }

  if (engine !== "generic-directory") {
    return {
      ai_summary: "Compatible with existing engine.",
      ai_verdict: "build-now" as Verdict,
      recommended_category: category,
      recommended_engine: engine,
    };
  }

  return {
    ai_summary: "Needs new engine.",
    ai_verdict: "needs-engine" as Verdict,
    recommended_category: category,
    recommended_engine: engine,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const mode = String(body.mode || "request"); // 🔥 NEW
    const ref_slug = String(body.ref || ""); // 🔥 NEW

    const requested_name = String(body.name || body.requested_name || "").trim();
    const requested_category = normalizeCategory(body.category || body.requested_category);
    const description = String(body.description || "").trim();

    if (!requested_name || !description) {
      return NextResponse.json(
        { error: "Name and description are required." },
        { status: 400 }
      );
    }

    let assessment = fallbackVerdict(requested_category, requested_name);

    // 🔥 ONLY RUN AI FOR REQUESTS (NOT REPORTS)
    if (mode !== "report") {
      try {
        const response = await openai.responses.create({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content: `Return valid JSON only.`,
            },
            {
              role: "user",
              content: `Name: ${requested_name}\nDescription: ${description}`,
            },
          ],
        });

        const raw = response.output_text || "";
        const parsed = JSON.parse(raw);

        assessment = {
          ai_summary: String(parsed.ai_summary || ""),
          ai_verdict: String(parsed.ai_verdict || "build-now") as Verdict,
          recommended_category: normalizeCategory(parsed.recommended_category),
          recommended_engine: String(parsed.recommended_engine || ""),
        };
      } catch {}
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.from("tool_requests").insert([
      {
        requested_name,
        requested_category,
        description,

        mode, // 🔥 NEW
        ref_slug, // 🔥 NEW

        ai_summary: assessment.ai_summary,
        ai_verdict: assessment.ai_verdict,
        recommended_category: assessment.recommended_category,
        recommended_engine: assessment.recommended_engine,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit." },
      { status: 500 }
    );
  }
}