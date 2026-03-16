import { NextResponse } from "next/server";
import {
  getAllExistingSlugs,
  inferLiveEngine,
  normalizeCategory,
  safeSlug,
} from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";

type SuggestionItem = {
  name: string;
  category: "tool" | "calculator" | "ai-tool";
  reason: string;
  slug: string;
};

const FALLBACK_SUGGESTIONS: SuggestionItem[] = [
  {
    name: "Password Strength Checker",
    category: "tool",
    reason: "Users often search for quick password quality and security checks.",
    slug: "password-strength-checker",
  },
  {
    name: "URL Decoder",
    category: "tool",
    reason: "Developers frequently need to decode links and encoded strings quickly.",
    slug: "url-decoder",
  },
  {
    name: "Base64 Decoder",
    category: "tool",
    reason: "A common utility for debugging encoded data and API payloads.",
    slug: "base64-decoder",
  },
  {
    name: "GST Calculator",
    category: "calculator",
    reason: "Strong recurring demand for tax calculation in many markets.",
    slug: "gst-calculator",
  },
  {
    name: "BMI Calculator",
    category: "calculator",
    reason: "One of the most commonly searched health calculators.",
    slug: "bmi-calculator",
  },
  {
    name: "AI Meta Description Generator",
    category: "ai-tool",
    reason: "SEO publishers frequently need AI-generated metadata at scale.",
    slug: "ai-meta-description-generator",
  },
  {
    name: "AI Product Description Generator",
    category: "ai-tool",
    reason: "Ecommerce teams and founders need product copy generation often.",
    slug: "ai-product-description-generator",
  },
];

function normalizeSuggestions(input: unknown): SuggestionItem[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item) => {
      const record = (item ?? {}) as Record<string, unknown>;
      const name = String(record.name || "").trim();
      const category = normalizeCategory(record.category);
      const reason = String(record.reason || "").trim();
      const slug = safeSlug(String(record.slug || name));

      return { name, category, reason, slug };
    })
    .filter((item) => item.name && item.reason && item.slug)
    .filter((item) => {
      if (item.category === "ai-tool") return true;
      return inferLiveEngine(item.category, item.slug) !== "generic-directory";
    })
    .slice(0, 24);
}

function tryParseSuggestions(text: string): SuggestionItem[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  try {
    return normalizeSuggestions(JSON.parse(trimmed));
  } catch {
    const match = trimmed.match(/\[[\s\S]*\]/);
    if (!match) return [];
    try {
      return normalizeSuggestions(JSON.parse(match[0]));
    } catch {
      return [];
    }
  }
}

export async function GET() {
  try {
    const existingSlugs = await getAllExistingSlugs();
    const openai = getOpenAIClient();

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: `
Return valid JSON only.
Do not use markdown.
Do not use code fences.

Return exactly an array of objects in this shape:
[
  {
    "name": "string",
    "category": "tool | calculator | ai-tool",
    "reason": "string",
    "slug": "string"
  }
]

Task:
Generate 16 high-demand QuickFnd ideas.

Rules:
- tools and calculators must map to a realistic live reusable utility
- do not suggest ideas that require complex external APIs or custom engines not already available
- AI tools are allowed if they can work as an OpenAI text workflow
- keep names concise and product-ready
- keep reason to one sentence
          `.trim(),
        },
      ],
    });

    const raw = response.output_text || "";
    const parsed = tryParseSuggestions(raw);
    const source = parsed.length > 0 ? parsed : FALLBACK_SUGGESTIONS;

    const suggestions = source
      .filter((item) => !existingSlugs.has(item.slug))
      .slice(0, 16);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("tool-suggestions route error:", error);

    const existingSlugs = await getAllExistingSlugs().catch(() => new Set<string>());

    const suggestions = FALLBACK_SUGGESTIONS.filter(
      (item) => !existingSlugs.has(item.slug)
    ).slice(0, 16);

    return NextResponse.json({ suggestions });
  }
}