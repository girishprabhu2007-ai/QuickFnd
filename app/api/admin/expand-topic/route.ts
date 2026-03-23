import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { generateIdeas } from "@/lib/tool-bulk-generator";

type RequestBody = {
  topic_key?: string;
  count?: number;
};

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const topic = String(body.topic_key || "").trim();

    if (!topic) {
      return NextResponse.json({ error: "Missing topic_key" }, { status: 400 });
    }

    const [tools, calculators, aiTools] = await Promise.all([
      generateIdeas(topic, "tools"),
      generateIdeas(topic, "calculators"),
      generateIdeas(topic, "ai_tools"),
    ]);

    const selectedTools = tools.slice(0, 3);
    const selectedCalculators = calculators.slice(0, 3);
    const selectedAITools = aiTools.slice(0, 2);

    const combined = [
      ...selectedTools,
      ...selectedCalculators,
      ...selectedAITools,
    ];

    return NextResponse.json({
      success: true,
      suggestions: combined,
      breakdown: {
        tools: selectedTools.length,
        calculators: selectedCalculators.length,
        ai_tools: selectedAITools.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to expand topic",
      },
      { status: 500 }
    );
  }
}