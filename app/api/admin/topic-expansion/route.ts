import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getTopicExpansionIntelligence } from "@/lib/topic-expansion-intelligence";

export async function GET() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await getTopicExpansionIntelligence();

    return NextResponse.json(data);
  } catch (error) {
    console.error("topic-expansion route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to load topic expansion intelligence.",
      },
      { status: 500 }
    );
  }
}