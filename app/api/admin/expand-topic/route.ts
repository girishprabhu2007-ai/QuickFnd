import { NextResponse } from "next/server";
import {
  buildPublicPath,
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
  getTable,
  normalizeCategory,
  type AdminCategory,
} from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";
import { normalizeGeneratedContent } from "@/lib/admin-content";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { generateToolDescription } from "@/lib/content-engine";

type GeneratedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config?: Record<string, unknown>;
};

function normalizeGeneratedItem(
  input: Record<string, unknown>,
  category: AdminCategory
): GeneratedItem {
  const normalized = normalizeGeneratedContent(input, category);

  return {
    name: normalized.name,
    slug: normalized.slug,
    description: normalized.description,
    related_slugs: normalized.related_slugs,
    engine_type: String(normalized.engine_type || ""),
    engine_config: normalized.engine_config,
  };
}

function parseGeneratedItem(raw: string, category: AdminCategory): GeneratedItem | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const parsed = JSON.parse(trimmed) as Record<string, unknown>;
    return normalizeGeneratedItem(parsed, category);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;

    try {
      const parsed = JSON.parse(match[0]) as Record<string, unknown>;
      return normalizeGeneratedItem(parsed, category);
    } catch {
      return null;
    }
  }
}

function isWeakSlug(slug: string) {
  return slug.length < 5 || !slug.includes("-");
}

function isWeakDescription(desc: string) {
  return desc.length < 40;
}


const ENGINE_CAPABILITY_MAP: Record<string, string> = {
  "password-generator": "Generates random secure passwords — configurable length, uppercase, numbers, symbols",
  "password-strength-checker": "Evaluates password strength — good for security analysis tools",
  "json-formatter": "Formats, prettifies, or minifies JSON — good for any JSON manipulation tool",
  "word-counter": "Counts words, characters, sentences, reading time — good for text analysis",
  "uuid-generator": "Generates unique IDs (UUIDs) — good for ID/token generation tools",
  "slug-generator": "Converts text to URL-safe slugs — good for URL/permalink/filename tools",
  "random-string-generator": "Generates random strings with configurable options",
  "base64-encoder": "Encodes text to Base64",
  "base64-decoder": "Decodes Base64 back to text",
  "url-encoder": "Encodes text for safe URL use",
  "url-decoder": "Decodes percent-encoded URLs",
  "text-case-converter": "Converts text between UPPER, lower, Title, sentence, slug, camelCase",
  "text-transformer": "Applies text transformations — trim, reverse, remove spaces",
  "code-formatter": "Formats or minifies code blocks and JSON",
  "code-snippet-manager": "Saves and retrieves reusable code snippets in the browser",
  "number-generator": "Generates random numbers within a configurable range",
  "unit-converter": "Converts between units with a configurable multiplier",
  "currency-converter": "Converts between currency pairs using live exchange rates",
  "regex-tester": "Tests a regex pattern against text and shows matches",
  "regex-extractor": "Extracts all regex matches from text as a list",
  "sha256-generator": "Generates SHA-256 cryptographic hash of input text",
  "md5-generator": "Generates MD5 hash of input text",
  "timestamp-converter": "Converts between Unix timestamps and human-readable dates",
  "hex-to-rgb": "Converts hex color codes to RGB values",
  "rgb-to-hex": "Converts RGB values to hex color codes",
  "text-to-binary": "Converts text to binary representation",
  "binary-to-text": "Converts binary back to readable text",
  "json-escape": "Escapes special characters for safe use inside JSON strings",
  "json-unescape": "Unescapes JSON-encoded string content",
  "qr-generator": "Generates QR codes from any text, URL, or data",
  "color-picker": "Visual color picker outputting HEX, RGB, HSL values",
  "markdown-editor": "Markdown editor with real-time HTML preview",
  "csv-to-json": "Converts CSV data to JSON format",
  "ip-lookup": "Looks up location, ISP, timezone for any IP address",
};

async function generateItemFromIdea(
  idea: string,
  category: AdminCategory
): Promise<GeneratedItem | null> {
  // Try content engine first (centralised brand voice)
  try {
    const result = await generateToolDescription({
      query: idea,
      suggested_name: idea,
      suggested_slug: idea.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      engine_type: "",
      category: category === "ai-tool" ? "ai-tool" : category === "calculator" ? "calculator" : "tool",
    });

    if (result.success) {
      return {
        name: result.output.name,
        slug: result.output.slug,
        description: result.output.description,
        related_slugs: [],
        engine_type: "",
        engine_config: {},
      };
    }
  } catch {
    // Content engine failed — fall back to inline OpenAI
  }

  // Fallback: direct OpenAI call
  const engineList = Object.entries(ENGINE_CAPABILITY_MAP)
    .map(([type, desc]) => `  ${type}: ${desc}`)
    .join("\n");

  const prompt = `You are a product specialist for QuickFnd, a free browser-based tools platform.
Generate ONE high-quality tool entry for this idea: "${idea}"

AVAILABLE ENGINE TYPES — pick the most appropriate one:
${engineList}

QUALITY REQUIREMENTS:
- name: Clear, specific, user-focused (e.g. "JWT Token Decoder" not "Token Helper")
- slug: Lowercase hyphenated, 3-5 words, matches name exactly
- description: 2 sentences. Sentence 1: what it does. Sentence 2: who benefits and why.
- engine_type: Must exactly match one from the list above — choose based on what the tool actually does
- engine_config: {} for most tools, or specific config if the engine needs it (e.g. unit-converter needs multiplier)
- related_slugs: 3 realistic related tool slugs that already exist or make sense

Return JSON only, no markdown:
{
  "name": "string",
  "slug": "string",
  "description": "string",
  "related_slugs": ["string", "string", "string"],
  "engine_type": "string",
  "engine_config": {}
}`.trim();

  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [{ role: "system", content: prompt }],
  });

  return parseGeneratedItem(response.output_text || "", category);
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Record<string, unknown>;

    const idea = String(body.idea || "").trim();
    const category = normalizeCategory(body.category);
    const requestId = body.requestId ? Number(body.requestId) : null;

    let item: GeneratedItem | null = null;

    const hasStructuredInput =
      String(body.name || "").trim() ||
      String(body.slug || "").trim() ||
      String(body.description || "").trim();

    if (hasStructuredInput) {
      item = normalizeGeneratedItem(body, category);
    } else if (idea) {
      item = await generateItemFromIdea(idea, category);
    }

    if (!item || !item.name || !item.slug || !item.description) {
      return NextResponse.json(
        { error: "Name and description are required, or provide a valid idea." },
        { status: 400 }
      );
    }

    // 🔥 QUALITY GUARD
    if (isWeakSlug(item.slug) || isWeakDescription(item.description)) {
      return NextResponse.json(
        {
          error:
            "Generated item is too weak (slug or description). Please refine the idea.",
        },
        { status: 400 }
      );
    }

    const suggestion = suggestAdminEngine(category, {
      name: item.name,
      slug: item.slug,
      description: item.description,
      engine_type: body.engine_type ?? item.engine_type,
      engine_config: body.engine_config ?? item.engine_config,
    });

    if (!suggestion.engine_type) {
      return NextResponse.json(
        { error: "No valid engine assigned. Cannot create item." },
        { status: 400 }
      );
    }

    if (category !== "ai-tool" && !suggestion.is_supported) {
      return NextResponse.json(
        {
          error:
            "This item does not match a real working engine. Avoid publishing fake tools.",
        },
        { status: 400 }
      );
    }

    const existing = await findExistingBySlug(category, item.slug);
    if (existing) {
      const path = buildPublicPath(category, item.slug);

      return NextResponse.json({
        success: true,
        alreadyExists: true,
        slug: item.slug,
        table: getTable(category),
        path,
        engine_type: suggestion.engine_type,
        engine_config: suggestion.engine_config,
        engine_reason: suggestion.reason,
      });
    }

    const uniqueSlug = await ensureUniqueSlug(category, item.slug);
    const table = getTable(category);

    const payload = {
      name: item.name,
      slug: uniqueSlug,
      description: item.description,
      related_slugs: item.related_slugs,
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
    };

    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin.from(table).insert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      created: true,
      slug: uniqueSlug,
      table,
      path: buildPublicPath(category, uniqueSlug),
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
      engine_reason: suggestion.reason,
      quality: {
        strong_match: suggestion.is_supported,
      },
    });
  } catch (error) {
    console.error("create-tool route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create tool.",
      },
      { status: 500 }
    );
  }
}