import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenAIClient } from "@/lib/openai-server";
import {
  filterSupportedBulkTools,
  parseBulkGeneratedTools,
} from "@/lib/tool-bulk-generator";
import { getTopicExpansionIntelligence } from "@/lib/topic-expansion-intelligence";

type RequestBody = {
  topic_key?: string;
  count?: number;
};

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const topicKey = String(body.topic_key || "").trim();
    const count = Math.max(2, Math.min(20, Number(body.count) || 6));

    if (!topicKey) {
      return NextResponse.json({ error: "Topic key is required." }, { status: 400 });
    }

    const intelligence = await getTopicExpansionIntelligence();
    const topic = intelligence.opportunities.find((item) => item.key === topicKey);

    if (!topic) {
      return NextResponse.json({ error: "Topic not found." }, { status: 404 });
    }

    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Return valid JSON only.
No markdown.
No code fences.

Return exactly this shape:
{
  "items": [
    {
      "name": "string",
      "slug": "string",
      "description": "string",
      "related_slugs": ["string", "string", "string"],
      "engine_type": "string",
      "engine_config": {}
    }
  ]
}

Task:
Generate ${count} QuickFnd tool ideas for this topic:
${topic.label}

Rules:
- Only use these engine types:
${topic.recommended_engine_types.join("\n")}
- Tools must be strongly relevant to the topic.
- Name must be product-ready.
- Slug must be lowercase and hyphen-separated.
- Description must be 2 concise SEO-friendly sentences.
- related_slugs must contain 3 to 6 realistic related tool slugs.
- Avoid duplicates.
- Avoid weak generic naming.
- Avoid ideas that are not directly useful.
          `.trim(),
        },
      ],
    });

    const parsed = parseBulkGeneratedTools(response.output_text || "");
    const supported = filterSupportedBulkTools(parsed);

    return NextResponse.json({
      success: true,
      topic_key: topic.key,
      topic_label: topic.label,
      suggestionsCount: supported.length,
      suggestions: supported,
    });
  } catch (error) {
    console.error("expand-topic route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to preview topic expansion.",
      },
      { status: 500 }
    );
  }
}