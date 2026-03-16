import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenAIClient } from "@/lib/openai-server";
import {
  filterNewDemandSuggestions,
  filterSupportedDemandSuggestions,
  getDemandSignals,
  parseDemandSuggestions,
} from "@/lib/tool-demand-engine";

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
    const count = Math.max(5, Math.min(40, Number(body.count) || 15));

    if (!theme) {
      return NextResponse.json({ error: "Theme is required." }, { status: 400 });
    }

    const signals = await getDemandSignals();
    const openai = getOpenAIClient();

    const topUsed = Object.entries(signals.topUsage)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 20)
      .map(([slug, metrics]) => `${slug} (total:${metrics.total}, month:${metrics.thisMonth})`)
      .join("\n");

    const recentRequests = signals.requests
      .slice(0, 30)
      .map((row) => {
        return `name:${row.requested_name || ""} | category:${row.requested_category || ""} | verdict:${row.ai_verdict || ""} | engine:${row.recommended_engine || ""} | description:${row.description || ""}`;
      })
      .join("\n");

    const existingTools = signals.existingTools
      .slice(0, 300)
      .map((row) => `${row.slug} | ${row.name} | ${row.engine_type || ""}`)
      .join("\n");

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
      "engine_config": {},
      "demand_score": 1,
      "demand_reason": "string"
    }
  ]
}

Task:
Generate ${count} high-potential QuickFnd tool ideas for this niche/theme: ${theme}

Use these decision inputs:
1. Existing published tools
2. Recent user requests
3. Current top usage patterns
4. Only supported engine-backed tools

Rules:
- Only use these exact supported engine_type values:
${signals.supportedEngineTypes.join("\n")}
- Suggest tools with strong search/demand potential inside the requested niche.
- Prefer gaps not already covered by existing tools.
- demand_score must be 1 to 100.
- demand_reason must be one concise sentence.
- name should be product-ready.
- slug must be lowercase and hyphen-separated.
- description should be 2 concise SEO-friendly sentences.
- related_slugs should contain 3 to 6 realistic related slugs.
- engine_config should usually be {} unless needed.
- Avoid duplicates and avoid already existing slugs when possible.
          `.trim(),
        },
        {
          role: "user",
          content: `
NICHE / THEME:
${theme}

CURRENT EXISTING TOOLS:
${existingTools || "none"}

RECENT TOOL REQUESTS:
${recentRequests || "none"}

TOP USAGE SIGNALS:
${topUsed || "none"}
          `.trim(),
        },
      ],
    });

    const raw = response.output_text || "";
    const parsed = parseDemandSuggestions(raw);
    const supported = filterSupportedDemandSuggestions(parsed);
    const fresh = filterNewDemandSuggestions(supported, signals.existingTools);

    return NextResponse.json({
      success: true,
      theme,
      suggestions: fresh,
      generatedCount: parsed.length,
      supportedCount: supported.length,
      newCount: fresh.length,
    });
  } catch (error) {
    console.error("tool-demand route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate demand suggestions.",
      },
      { status: 500 }
    );
  }
}