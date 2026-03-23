import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenAIClient } from "@/lib/openai-server";
import {
  filterSupportedBulkTools,
  getSupportedToolEngineTypes,
  insertBulkTools,
  parseBulkGeneratedTools,
} from "@/lib/tool-bulk-generator";

type RequestBody = {
  theme?: string;
  count?: number;
};

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const theme = String(body.theme || "").trim();
    const count = Math.max(2, Math.min(30, Number(body.count) || 8));

    if (!theme) {
      return NextResponse.json(
        { error: "Theme is required." },
        { status: 400 }
      );
    }

    const supportedEngineTypes = getSupportedToolEngineTypes();

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
Generate ${count} QuickFnd tool ideas for this niche/theme: ${theme}

Rules:
- Only suggest tools that can be powered by existing supported engine types.
- The engine_type must be one of these exact values:
${supportedEngineTypes.join("\n")}
- Keep names short and product-ready.
- Slugs must be lowercase and hyphen-separated.
- Description must be 2 concise SEO-friendly sentences.
- related_slugs must contain 3 to 6 realistic related tool slugs.
- engine_config should usually be {} unless config improves the tool.
- Avoid duplicates.
          `.trim(),
        },
      ],
    });

    const raw = response.output_text || "";
    const parsedItems = parseBulkGeneratedTools(raw);
    const supportedItems = filterSupportedBulkTools(parsedItems);

    if (supportedItems.length === 0) {
      return NextResponse.json(
        { error: "AI did not return any supported tool ideas." },
        { status: 400 }
      );
    }

    const result = await insertBulkTools(supportedItems);

    return NextResponse.json({
      success: true,
      theme,
      requestedCount: count,
      generatedCount: parsedItems.length,
      supportedCount: supportedItems.length,
      createdCount: result.created.length,
      skippedCount: result.skipped.length,
      created: result.created,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("bulk-create-tools route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to bulk create tools.",
      },
      { status: 500 }
    );
  }
}