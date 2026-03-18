import { NextResponse } from "next/server";
import { runAITool } from "@/lib/ai-engine";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const input = String(body.input || "").trim();
    const config = body.config || {};

    if (!input) {
      return NextResponse.json(
        { error: "Input is required" },
        { status: 400 }
      );
    }

    const output = await runAITool(input, config);

    return NextResponse.json({
      success: true,
      output,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI execution failed",
      },
      { status: 500 }
    );
  }
}