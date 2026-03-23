import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getToolPerformanceIntelligence } from "@/lib/tool-performance-intelligence";

export async function GET() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await getToolPerformanceIntelligence();

    return NextResponse.json(data);
  } catch (error) {
    console.error("performance-intelligence route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load performance intelligence.",
      },
      { status: 500 }
    );
  }
}