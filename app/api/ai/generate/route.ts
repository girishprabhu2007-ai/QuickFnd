import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tool, input } = body;

    let systemPrompt = "";
    let userPrompt = "";

    if (tool === "ai-prompt-generator") {
      systemPrompt =
        "You create high-quality prompts for AI tools. Return only the final prompt text, clearly written and optimized.";
      userPrompt = `Create a strong AI prompt for this goal: ${input.goal}. Use this style: ${input.style}.`;
    } else if (tool === "ai-email-writer") {
      systemPrompt =
        "You write professional emails. Return only the email draft, ready to use.";
      userPrompt = `Write an email with these details:
Purpose: ${input.purpose}
Recipient: ${input.recipient}
Tone: ${input.tone}`;
    } else if (tool === "ai-blog-outline-generator") {
      systemPrompt =
        "You create SEO-friendly blog outlines. Return only the final blog outline in a clean structure.";
      userPrompt = `Create a blog outline for this topic: ${input.topic}. Target audience: ${input.audience}.`;
    } else {
      return NextResponse.json({ error: "Invalid tool type" }, { status: 400 });
    }

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const output = response.output_text?.trim();

    if (!output) {
      return NextResponse.json(
        { error: "No output returned from AI." },
        { status: 500 }
      );
    }

    return NextResponse.json({ result: output });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response." },
      { status: 500 }
    );
  }
}