import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getOpenAIClient } from "@/lib/openai-server";
import { isContentUnique } from "@/lib/content-engine";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import {
  filterSupportedBulkTools,
  insertBulkTools,
  parseBulkGeneratedTools,
} from "@/lib/tool-bulk-generator";

type RequestBody = {
  theme?: string;
  count?: number;
};

// Maps each engine type to a clear human-readable description
// so the AI understands WHAT each engine does and picks appropriately
const ENGINE_CAPABILITY_MAP: Record<string, string> = {
  "password-generator": "Generates random secure passwords — good for any tool that produces random secure strings",
  "password-strength-checker": "Evaluates how strong a password is — good for security analysis tools",
  "json-formatter": "Formats, prettifies, or minifies JSON data — good for any JSON manipulation tool",
  "word-counter": "Counts words, characters, sentences, reading time in text — good for text analysis",
  "uuid-generator": "Generates unique IDs (UUIDs) — good for ID generation, token creation tools",
  "slug-generator": "Converts text to URL-safe slugs — good for URL, permalink, filename generation",
  "random-string-generator": "Generates random strings with configurable length and character sets",
  "base64-encoder": "Encodes text to Base64 — good for encoding, data URI, credential tools",
  "base64-decoder": "Decodes Base64 back to text — good for decoding, inspection tools",
  "url-encoder": "Encodes text for safe use in URLs — good for URL building, link tools",
  "url-decoder": "Decodes percent-encoded URLs back to readable text",
  "text-case-converter": "Converts text between UPPER, lower, Title, sentence, slug, camelCase formats",
  "text-transformer": "Applies text transformations like trim, reverse, remove spaces",
  "code-formatter": "Formats or minifies code blocks and JSON",
  "code-snippet-manager": "Saves and retrieves reusable code snippets in the browser",
  "number-generator": "Generates random numbers within a configurable range",
  "unit-converter": "Converts between units with a configurable multiplier (e.g. km to miles)",
  "currency-converter": "Converts between currency pairs using live exchange rates",
  "regex-tester": "Tests a regex pattern against text and shows matches",
  "regex-extractor": "Extracts all regex matches from text as a list",
  "sha256-generator": "Generates SHA-256 cryptographic hash of input text",
  "md5-generator": "Generates MD5 hash of input text",
  "timestamp-converter": "Converts between Unix timestamps and human-readable dates",
  "hex-to-rgb": "Converts hexadecimal color codes to RGB values",
  "rgb-to-hex": "Converts RGB color values to hexadecimal codes",
  "text-to-binary": "Converts text to binary (0s and 1s) representation",
  "binary-to-text": "Converts binary (0s and 1s) back to readable text",
  "json-escape": "Escapes special characters in text for safe use inside JSON strings",
  "json-unescape": "Unescapes JSON-encoded string content back to plain text",
  "qr-generator": "Generates QR codes from any text, URL, or data",
  "color-picker": "Visual color picker that outputs HEX, RGB, HSL values",
  "markdown-editor": "Markdown editor with real-time HTML preview",
  "csv-to-json": "Converts CSV data to JSON format with configurable delimiter",
  "ip-lookup": "Looks up location, ISP, timezone for any IP address",
};

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const theme = String(body.theme || "").trim();
    const count = Math.max(2, Math.min(20, Number(body.count) || 8));

    if (!theme) {
      return NextResponse.json({ error: "Theme is required." }, { status: 400 });
    }

    // Fetch existing slugs so AI never generates duplicates
    const supabase = getSupabaseAdmin();
    const { data: existingTools } = await supabase
      .from("tools")
      .select("slug, name");

    const existingSlugs = (existingTools || []).map((t) => t.slug);
    const existingNames = (existingTools || []).map((t) => t.name.toLowerCase());

    // Build a rich capability description for each engine
    const engineList = Object.entries(ENGINE_CAPABILITY_MAP)
      .map(([type, desc]) => `  • ${type}: ${desc}`)
      .join("\n");

    const openai = getOpenAIClient();

    const systemPrompt = `You are a product strategist for QuickFnd — a free browser-based tools platform.
Your job is to generate genuinely useful, distinct tool ideas that real users will search for and use.

EXISTING TOOLS TO AVOID (never generate these or close variants):
${existingSlugs.slice(0, 80).join(", ")}

AVAILABLE ENGINE TYPES (you MUST pick from exactly these):
${engineList}

OUTPUT FORMAT (JSON only, no markdown):
{
  "items": [
    {
      "name": "Tool Name",
      "slug": "tool-name",
      "description": "Two sentences. First: what it does. Second: who it helps and why.",
      "related_slugs": ["slug-1", "slug-2", "slug-3"],
      "engine_type": "exact-engine-type-from-list",
      "engine_config": {}
    }
  ]
}

QUALITY RULES — every tool must pass ALL of these:
1. USEFUL: Solves a real, specific problem a developer / writer / marketer / student actually has
2. DISTINCT: Must be functionally different from every other tool in the batch AND from existing tools
3. SEARCHABLE: Someone must realistically Google this — it must have real search intent
4. ENGINE MATCH: The engine_type must genuinely match what the tool does — wrong engine = rejected
5. NO DUPLICATES: Never two tools with the same engine_type in one batch unless they solve truly different problems
6. HONEST NAMES: Name must clearly describe what the tool does — no vague names like "Smart Text Helper"
7. CORRECT SLUG: Lowercase, hyphen-separated, 3-6 words, matches the name

BANNED (will be rejected):
- Any variant of an existing tool (e.g. "Instagram Word Counter" if "Word Counter" exists)
- Generic names that don't describe specific function
- engine_type: "generic-directory" (never use this)
- Duplicate engine_types in the same batch unless genuinely different tools`;

    const userPrompt = `Generate ${count} distinct, high-quality tools for this theme: "${theme}"

Think about what users searching for "${theme} tools" would actually want to accomplish. 
Each tool should solve a different specific task within this theme.
Spread the engine types — use as many different engines as possible.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "";
    const parsedItems = parseBulkGeneratedTools(raw);

    // Post-generation dedup — remove any that clash with existing tools
    const existingDescriptions = parsedItems
      .filter(i => existingSlugs.includes(i.slug))
      .map(i => i.description || "");

    const deduped = parsedItems.filter((item) => {
      if (existingSlugs.includes(item.slug)) return false;
      // Uniqueness check via content engine fingerprinting
      if (item.description) {
        const { unique } = isContentUnique(item.description, existingDescriptions);
        if (!unique) return false;
      }
      if (existingNames.includes(item.name.toLowerCase())) return false;
      return true;
    });

    const supportedItems = filterSupportedBulkTools(deduped);

    if (supportedItems.length === 0) {
      return NextResponse.json(
        { error: "AI did not return any valid tool ideas. Try a different theme or be more specific." },
        { status: 400 }
      );
    }

    const result = await insertBulkTools(supportedItems);

    return NextResponse.json({
      success: true,
      theme,
      requestedCount: count,
      generatedCount: parsedItems.length,
      dedupedCount: deduped.length,
      supportedCount: supportedItems.length,
      createdCount: result.created.length,
      skippedCount: result.skipped.length,
      created: result.created,
      skipped: result.skipped,
    });
  } catch (error) {
    console.error("bulk-create-tools error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to bulk create tools." },
      { status: 500 }
    );
  }
}