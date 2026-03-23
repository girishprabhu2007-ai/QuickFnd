import { NextResponse } from "next/server";
import { getFallbackAudit } from "@/lib/review-console";

export async function GET() {
  try {
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