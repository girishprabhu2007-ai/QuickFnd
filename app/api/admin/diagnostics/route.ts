import { NextResponse } from "next/server";
import { getReviewDiagnostics } from "@/lib/review-console";

export async function GET() {
  try {
    const data = await getReviewDiagnostics();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load diagnostics.",
      },
      { status: 500 }
    );
  }
}