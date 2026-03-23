import type { PublicContentItem, PublicTable } from "@/lib/content-pages";

type DescriptionContext = "card" | "detail";

const DESCRIPTION_OVERRIDES: Partial<
  Record<
    PublicTable,
    Record<
      string,
      {
        card: string;
        detail?: string;
      }
    >
  >
> = {
  tools: {
    "currency-converter": {
      card: "Convert currencies in real time on QuickFnd using live ECB-backed exchange rates.",
      detail:
        "Currency Converter is a live QuickFnd tool for real-time currency conversion using ECB-backed exchange rates.",
    },
    "debugging-tool": {
      card: "Explore the Debugging Tool page on QuickFnd. This page is live today and ready for a dedicated debugging-focused engine upgrade.",
      detail:
        "Debugging Tool is currently published as a live QuickFnd page and can be upgraded with a dedicated debugging engine in a future release.",
    },
  },
  ai_tools: {
    "ai-email-writer": {
      card: "Generate polished emails instantly with AI on QuickFnd.",
      detail: "AI Email Writer helps you generate polished emails instantly with OpenAI on QuickFnd.",
    },
    "ai-prompt-generator": {
      card: "Create better prompts instantly with AI on QuickFnd.",
      detail: "AI Prompt Generator helps you create stronger prompts instantly with OpenAI on QuickFnd.",
    },
    "ai-blog-outline-generator": {
      card: "Generate structured blog outlines instantly with AI on QuickFnd.",
      detail:
        "AI Blog Outline Generator helps you create structured blog outlines instantly with OpenAI on QuickFnd.",
    },
    "notion-ai": {
      card: "Generate Notion-ready summaries, notes, and structured content with AI on QuickFnd.",
      detail:
        "Notion AI helps you generate Notion-ready summaries, notes, action items, and structured content with OpenAI on QuickFnd.",
    },
  },
};

export function getDisplayDescription(
  table: PublicTable,
  item: PublicContentItem,
  context: DescriptionContext = "card"
) {
  const override = DESCRIPTION_OVERRIDES[table]?.[item.slug];

  if (override) {
    return context === "detail" ? override.detail || override.card : override.card;
  }

  return item.description || "";
}