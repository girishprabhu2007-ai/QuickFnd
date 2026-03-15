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
      card: "Explore the Currency Converter page on QuickFnd. This page is live today and ready for a dedicated converter-engine upgrade.",
      detail:
        "Currency Converter is currently published as a live QuickFnd page and can be upgraded with a dedicated real-time conversion engine in a future release.",
    },
    "debugging-tool": {
      card: "Explore the Debugging Tool page on QuickFnd. This page is live today and ready for a dedicated debugging-focused engine upgrade.",
      detail:
        "Debugging Tool is currently published as a live QuickFnd page and can be upgraded with a dedicated debugging engine in a future release.",
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