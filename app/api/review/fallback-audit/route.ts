import { NextRequest, NextResponse } from "next/server";
import { isAuthorizedReviewRequest } from "@/lib/review-access";
import { getFallbackAudit } from "@/lib/review-console";

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorizedReviewRequest(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await getFallbackAudit();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load fallback audit.",
      },
      { status: 500 }
    );
  }
}