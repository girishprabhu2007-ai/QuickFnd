import { NextResponse } from "next/server";
import { getRecentItems } from "@/lib/review-console";

export async function GET() {
  try {
    const data = await getRecentItems();

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to load recent items.",
      },
      { status: 500 }
    );
  }
}