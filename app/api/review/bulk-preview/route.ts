import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedReviewRequest } from "@/lib/review-access";
import { getBulkPreview } from "@/lib/review-console";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedReviewRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      topic?: string;
      type?: "tools" | "calculators" | "ai_tools";
    };

    const topic = String(body.topic || "").trim();
    const type = body.type || "tools";

    if (!topic) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const data = await getBulkPreview({
      topic,
      type,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load bulk preview.",
      },
      { status: 500 }
    );
  }
}