import { NextRequest, NextResponse } from "next/server";
import { getReviewAuditData } from "@/lib/review-audit";

function isAuthorized(request: NextRequest) {
  const enabled = process.env.REVIEW_AUDIT_ENABLED === "true";
  const expectedKey = String(process.env.REVIEW_AUDIT_KEY || "").trim();
  const providedKey = String(request.nextUrl.searchParams.get("key") || "").trim();

  if (!enabled) {
    return false;
  }

  if (!expectedKey) {
    return false;
  }

  return providedKey === expectedKey;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await getReviewAuditData();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load review audit data.",
      },
      { status: 500 }
    );
  }
}