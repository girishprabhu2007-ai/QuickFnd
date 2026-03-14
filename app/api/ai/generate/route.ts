import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  normalizeGeneratedContent,
  type AdminCategory,
} from "@/lib/admin-content";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PublicToolInput =
  | {
      tool: "ai-prompt-generator";
      input: { goal: string; style: string };
    }
  | {
      tool: "ai-email-writer";
      input: { purpose: string; recipient: string; tone: string };
    }
  | {
      tool: "ai-blog-outline-generator";
      input: { topic: string; audience: string };
    };

type AdminContentInput = {
  mode: "admin-content";
  topic: string;
  category: AdminCategory;
};

function parseAdminContent(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return normalizeGeneratedContent(parsed);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<PublicToolInput & AdminContentInput>;

    if (body.mode === "admin-content") {
      const topic = String(body.topic || "").trim();
      const category = body.category;

      if (!topic) {
        return NextResponse.json({ error: "Topic is required." }, { status: 400 });
      }

      if (!category || !["tool", "calculator", "ai-tool"].includes(category)) {
        return NextResponse.json({ error: "Valid category is required." }, { status: 400 });
      }

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: `
You generate QuickFnd admin content for a ${category}.
Return valid JSON only.
No markdown. No code fences.

Required JSON shape:
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "related_slugs": ["string", "string", "string"]
}

Rules:
- "name" should be clear and human-friendly.
- "slug" must be lowercase, hyphen-separated, URL-safe.
- "description" should be 2 to 4 sentences, concise, useful, and SEO-friendly.
- "related_slugs" should contain 3 to 6 realistic related slugs.
- Do not include explanations outside the JSON.
            `.trim(),
          },
          {
            role: "user",
            content: `Create a QuickFnd ${category} entry for this topic: ${topic}`,
          },
        ],
      });

      const raw = response.output_text?.trim();

      if (!raw) {
        return NextResponse.json(
          { error: "No output returned from AI." },
          { status: 500 }
        );
      }

      const item = parseAdminContent(raw);

      if (!item || !item.name || !item.slug || !item.description) {
        return NextResponse.json(
          { error: "AI returned an invalid admin content payload." },
          { status: 500 }
        );
      }

      return NextResponse.json({ item });
    }

    const { tool, input } = body as PublicToolInput;

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