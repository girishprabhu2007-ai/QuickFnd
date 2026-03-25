import { NextResponse } from "next/server";
import { runAITool } from "@/lib/ai-engine";
import { checkAIRateLimit, recordAIUsage } from "@/lib/ai-rate-limit";

export async function POST(req: Request) {
  try {
    const rateCheck = await checkAIRateLimit(req);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.reason, retryAfter: rateCheck.retryAfter, rateLimited: true },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfter * 60), "X-RateLimit-Limit": "10" } }
      );
    }
    const body = await req.json();
    const input = String(body.input || "").trim();
    const config = body.config || {};
    if (!input) return NextResponse.json({ error: "Input is required" }, { status: 400 });
    if (input.length > 5000) return NextResponse.json({ error: "Input too long. Maximum 5000 characters." }, { status: 400 });
    const output = await runAITool(input, config);
    const tokensEstimate = Math.ceil((input.length + (output?.length || 0)) / 4);
    recordAIUsage(req, tokensEstimate).catch(() => {});
    return NextResponse.json({ success: true, output, remaining: rateCheck.remaining });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "AI execution failed" }, { status: 500 });
  }
}