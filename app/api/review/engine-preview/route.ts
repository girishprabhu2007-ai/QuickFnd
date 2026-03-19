import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedReviewRequest } from "@/lib/review-access";
import { getEnginePreview } from "@/lib/review-console";

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorizedReviewRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await request.json()) as {
      category?: "tool" | "calculator" | "ai-tool";
      name?: string;
      slug?: string;
      description?: string;
    };

    const category = body.category || "tool";
    const name = String(body.name || "").trim();
    const slug = String(body.slug || "").trim();
    const description = String(body.description || "").trim();

    if (!name && !slug) {
      return NextResponse.json(
        { error: "Name or slug is required." },
        { status: 400 }
      );
    }

    const data = await getEnginePreview({
      category,
      name,
      slug,
      description,
    });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load engine preview.",
      },
      { status: 500 }
    );
  }
}