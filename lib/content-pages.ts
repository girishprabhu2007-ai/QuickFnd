export type PublicTable = "tools" | "calculators" | "ai_tools";

export type PublicContentItem = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  created_at?: string | null;
};

const STATIC_TOOLS: PublicContentItem[] = [
  {
    name: "Password Generator",
    slug: "password-generator",
    description:
      "Create strong random passwords with customizable length and character settings. Useful for account security, development work, and quick password generation.",
    related_slugs: ["json-formatter", "word-counter", "random-string-generator"],
  },
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    description:
      "Format, validate, and minify JSON instantly in the browser. Useful for debugging APIs, cleaning payloads, and improving readability.",
    related_slugs: ["word-counter", "password-generator", "base64-encoder"],
  },
  {
    name: "Word Counter",
    slug: "word-counter",
    description:
      "Count words, characters, and reading time instantly. Useful for content writing, editing, blog drafts, and quick text analysis.",
    related_slugs: ["json-formatter", "password-generator", "text-case-converter"],
  },
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    description:
      "Generate UUID values instantly in the browser for development, identifiers, database entries, and testing workflows.",
    related_slugs: ["random-string-generator", "slug-generator", "password-generator"],
  },
  {
    name: "Slug Generator",
    slug: "slug-generator",
    description:
      "Convert text into clean URL-friendly slugs instantly. Useful for SEO, CMS publishing, content systems, and developer workflows.",
    related_slugs: ["text-case-converter", "url-encoder", "uuid-generator"],
  },
  {
    name: "Random String Generator",
    slug: "random-string-generator",
    description:
      "Generate random strings with adjustable length and character options for testing, tokens, placeholders, and development workflows.",
    related_slugs: ["uuid-generator", "password-generator", "base64-encoder"],
  },
  {
    name: "Base64 Encoder",
    slug: "base64-encoder",
    description:
      "Encode text into Base64 instantly in the browser. Useful for data transformation, development, APIs, and quick encoding tasks.",
    related_slugs: ["base64-decoder", "url-encoder", "json-formatter"],
  },
  {
    name: "Base64 Decoder",
    slug: "base64-decoder",
    description:
      "Decode Base64 text instantly in the browser. Useful for debugging payloads, inspecting encoded data, and development workflows.",
    related_slugs: ["base64-encoder", "json-formatter", "url-decoder"],
  },
  {
    name: "URL Encoder",
    slug: "url-encoder",
    description:
      "Encode text for safe use in URLs and query strings. Useful for developers, marketers, and quick web utility tasks.",
    related_slugs: ["url-decoder", "slug-generator", "base64-encoder"],
  },
  {
    name: "URL Decoder",
    slug: "url-decoder",
    description:
      "Decode URL-encoded text instantly to readable form. Useful for debugging links, query strings, and encoded parameters.",
    related_slugs: ["url-encoder", "base64-decoder", "json-formatter"],
  },
  {
    name: "Text Case Converter",
    slug: "text-case-converter",
    description:
      "Convert text into lowercase, uppercase, title case, and slug case instantly. Useful for writing, formatting, and content workflows.",
    related_slugs: ["slug-generator", "word-counter", "json-formatter"],
  },
];

const STATIC_CALCULATORS: PublicContentItem[] = [
  {
    name: "Loan Calculator",
    slug: "loan-calculator",
    description:
      "Estimate monthly loan payments based on principal, interest rate, and repayment period. Helpful for planning loans and comparing scenarios.",
    related_slugs: ["bmi-calculator", "age-calculator"],
  },
  {
    name: "BMI Calculator",
    slug: "bmi-calculator",
    description:
      "Calculate body mass index from your height and weight. Useful for a quick health category estimate using standard BMI ranges.",
    related_slugs: ["age-calculator", "loan-calculator"],
  },
  {
    name: "Age Calculator",
    slug: "age-calculator",
    description:
      "Calculate age from a birth date in years, months, and days. Useful for forms, planning, and quick date-based calculations.",
    related_slugs: ["bmi-calculator", "loan-calculator"],
  },
];

const STATIC_AI_TOOLS: PublicContentItem[] = [
  {
    name: "AI Prompt Generator",
    slug: "ai-prompt-generator",
    description:
      "Generate better prompts for AI tools based on your goal and desired style. Useful for improving outputs across writing, coding, and research tasks.",
    related_slugs: ["ai-email-writer", "ai-blog-outline-generator"],
  },
  {
    name: "AI Email Writer",
    slug: "ai-email-writer",
    description:
      "Generate polished emails with AI using your purpose, recipient, and tone. Useful for business communication, outreach, and everyday writing.",
    related_slugs: ["ai-prompt-generator", "ai-blog-outline-generator"],
  },
  {
    name: "AI Blog Outline Generator",
    slug: "ai-blog-outline-generator",
    description:
      "Create structured blog outlines with AI for a target audience and topic. Useful for content planning, SEO writing, and draft preparation.",
    related_slugs: ["ai-email-writer", "ai-prompt-generator"],
  },
  {
    name: "ChatGPT",
    slug: "chatgpt",
    description:
      "ChatGPT is a conversational AI assistant used for writing, research, coding, and productivity. This page serves as a directory listing within QuickFnd.",
    related_slugs: ["claude", "perplexity", "notion-ai"],
  },
  {
    name: "Claude",
    slug: "claude",
    description:
      "Claude is an AI assistant used for writing, reasoning, and document work. This page serves as a directory listing within QuickFnd.",
    related_slugs: ["chatgpt", "perplexity", "notion-ai"],
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    description:
      "Perplexity is an AI-powered answer and research tool. This page serves as a directory listing within QuickFnd.",
    related_slugs: ["chatgpt", "claude", "notion-ai"],
  },
  {
    name: "Notion AI",
    slug: "notion-ai",
    description:
      "Notion AI adds writing and productivity assistance inside Notion workflows. This page serves as a directory listing within QuickFnd.",
    related_slugs: ["chatgpt", "claude", "perplexity"],
  },
  {
    name: "Midjourney",
    slug: "midjourney",
    description:
      "Midjourney is an image-generation platform for creative visual outputs. This page serves as a directory listing within QuickFnd.",
    related_slugs: ["chatgpt", "claude", "perplexity"],
  },
];

export function getStaticItems(table: PublicTable): PublicContentItem[] {
  if (table === "tools") return STATIC_TOOLS;
  if (table === "calculators") return STATIC_CALCULATORS;
  return STATIC_AI_TOOLS;
}

export function getStaticItem(
  table: PublicTable,
  slug: string
): PublicContentItem | null {
  return getStaticItems(table).find((item) => item.slug === slug) || null;
}

export function getCategoryLabel(table: PublicTable) {
  if (table === "tools") return "Tool";
  if (table === "calculators") return "Calculator";
  return "AI Tool";
}

export function getCategoryPath(table: PublicTable) {
  if (table === "tools") return "/tools";
  if (table === "calculators") return "/calculators";
  return "/ai-tools";
}

export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  return envUrl || "http://localhost:3000";
}

export function buildPageTitle(item: PublicContentItem, table: PublicTable) {
  const typeLabel = getCategoryLabel(table);
  return `${item.name} | QuickFnd ${typeLabel}`;
}

export function buildMetaDescription(item: PublicContentItem, table: PublicTable) {
  const typeLabel = getCategoryLabel(table).toLowerCase();
  return `${item.description} Explore this ${typeLabel} on QuickFnd.`;
}