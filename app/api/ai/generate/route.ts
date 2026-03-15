import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  normalizeGeneratedContent,
  type AdminCategory,
} from "@/lib/admin-content";
import { getAdminUser } from "@/lib/admin-auth";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type PublicToolName =
  | "ai-prompt-generator"
  | "ai-email-writer"
  | "ai-blog-outline-generator";

type PublicToolBody = {
  tool?: PublicToolName;
  input?: {
    goal?: string;
    style?: string;
    purpose?: string;
    recipient?: string;
    tone?: string;
    topic?: string;
    audience?: string;
  };
};

type RequestBody = {
  mode?: "admin-content" | "bulk-admin-content";
  topic?: string;
  theme?: string;
  category?: AdminCategory;
  count?: number;
  tool?: PublicToolName;
  input?: {
    goal?: string;
    style?: string;
    purpose?: string;
    recipient?: string;
    tone?: string;
    topic?: string;
    audience?: string;
  };
};

function parseAdminContent(raw: string) {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return normalizeGeneratedContent(parsed);
  } catch {
    return null;
  }
}

function parseBulkAdminContent(raw: string) {
  try {
    const parsed = JSON.parse(raw) as unknown;

    let items: unknown[] = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (
      parsed &&
      typeof parsed === "object" &&
      "items" in parsed &&
      Array.isArray((parsed as { items?: unknown[] }).items)
    ) {
      items = (parsed as { items: unknown[] }).items;
    }

    return items
      .map((item: unknown) =>
        normalizeGeneratedContent((item ?? {}) as Record<string, unknown>)
      )
      .filter((item) => item.name && item.slug && item.description);
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    if (body.mode === "admin-content") {
      const adminUser = await getAdminUser();

      if (!adminUser) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const topic = String(body.topic || "").trim();
      const category = body.category;

      if (!topic) {
        return NextResponse.json({ error: "Topic is required." }, { status: 400 });
      }

      if (!category || !["tool", "calculator", "ai-tool"].includes(category)) {
        return NextResponse.json(
          { error: "Valid category is required." },
          { status: 400 }
        );
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

    if (body.mode === "bulk-admin-content") {
      const adminUser = await getAdminUser();

      if (!adminUser) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
      }

      const theme = String(body.theme || "").trim();
      const category = body.category;
      const count = Math.max(2, Math.min(25, Number(body.count) || 10));

      if (!theme) {
        return NextResponse.json({ error: "Theme is required." }, { status: 400 });
      }

      if (!category || !["tool", "calculator", "ai-tool"].includes(category)) {
        return NextResponse.json(
          { error: "Valid category is required." },
          { status: 400 }
        );
      }

      const response = await client.responses.create({
        model: "gpt-4.1-mini",
        input: [
          {
            role: "system",
            content: `
You generate bulk QuickFnd admin content for the category "${category}".
Return valid JSON only.
No markdown. No code fences.

Return this exact shape:
{
  "items": [
    {
      "name": "string",
      "slug": "string",
      "description": "string",
      "related_slugs": ["string", "string", "string"]
    }
  ]
}

Rules:
- Return exactly ${count} items.
- Items must be distinct and useful.
- "name" should be clear and human-friendly.
- "slug" must be lowercase, hyphen-separated, URL-safe.
- "description" should be 2 to 4 sentences, concise, useful, and SEO-friendly.
- "related_slugs" should contain 3 to 6 realistic related slugs.
- Avoid duplicates.
- Do not include explanations outside the JSON.
            `.trim(),
          },
          {
            role: "user",
            content: `Generate ${count} QuickFnd ${category} entries for this theme: ${theme}`,
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

      const items = parseBulkAdminContent(raw);

      if (items.length === 0) {
        return NextResponse.json(
          { error: "AI returned an invalid bulk content payload." },
          { status: 500 }
        );
      }

      return NextResponse.json({ items });
    }

    const publicBody = body as PublicToolBody;
    const tool = publicBody.tool;
    const input = publicBody.input || {};

    let systemPrompt = "";
    let userPrompt = "";

    if (tool === "ai-prompt-generator") {
      systemPrompt =
        "You create high-quality prompts for AI tools. Return only the final prompt text, clearly written and optimized.";
      userPrompt = `Create a strong AI prompt for this goal: ${input.goal || ""}. Use this style: ${input.style || ""}.`;
    } else if (tool === "ai-email-writer") {
      systemPrompt =
        "You write professional emails. Return only the email draft, ready to use.";
      userPrompt = `Write an email with these details:
Purpose: ${input.purpose || ""}
Recipient: ${input.recipient || ""}
Tone: ${input.tone || ""}`;
    } else if (tool === "ai-blog-outline-generator") {
      systemPrompt =
        "You create SEO-friendly blog outlines. Return only the final blog outline in a clean structure.";
      userPrompt = `Create a blog outline for this topic: ${input.topic || ""}. Target audience: ${input.audience || ""}.`;
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