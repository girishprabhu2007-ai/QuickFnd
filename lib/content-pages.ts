import type { EngineConfig, EngineType } from "@/lib/engine-metadata";

export type PublicTable = "tools" | "calculators" | "ai_tools";

export type PublicContentItem = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type?: EngineType | null;
  engine_config?: EngineConfig;
  created_at?: string | null;
  // Featured badge (ai_tools only)
  is_featured?: boolean | null;
  featured_until?: string | null;
};

const STATIC_TOOLS: PublicContentItem[] = [
  {
    name: "Password Generator",
    slug: "password-generator",
    description: "Create strong random passwords with customizable length and character settings.",
    related_slugs: ["json-formatter", "word-counter", "random-string-generator"],
    engine_type: "password-generator",
    engine_config: {},
  },
  {
    name: "JSON Formatter",
    slug: "json-formatter",
    description: "Format, validate, and minify JSON instantly in the browser.",
    related_slugs: ["word-counter", "password-generator", "base64-encoder"],
    engine_type: "json-formatter",
    engine_config: {},
  },
  {
    name: "Word Counter",
    slug: "word-counter",
    description: "Count words, characters, and reading time instantly.",
    related_slugs: ["json-formatter", "password-generator", "text-case-converter"],
    engine_type: "word-counter",
    engine_config: {},
  },
  {
    name: "UUID Generator",
    slug: "uuid-generator",
    description: "Generate UUID values instantly in the browser.",
    related_slugs: ["random-string-generator", "slug-generator", "password-generator"],
    engine_type: "uuid-generator",
    engine_config: {},
  },
  {
    name: "Slug Generator",
    slug: "slug-generator",
    description: "Convert text into clean URL-friendly slugs instantly.",
    related_slugs: ["text-case-converter", "url-encoder", "uuid-generator"],
    engine_type: "slug-generator",
    engine_config: {},
  },
  {
    name: "Random String Generator",
    slug: "random-string-generator",
    description: "Generate random strings with adjustable length and options.",
    related_slugs: ["uuid-generator", "password-generator", "base64-encoder"],
    engine_type: "random-string-generator",
    engine_config: {},
  },
  {
    name: "Base64 Encoder",
    slug: "base64-encoder",
    description: "Encode text into Base64 instantly in the browser.",
    related_slugs: ["base64-decoder", "url-encoder", "json-formatter"],
    engine_type: "base64-encoder",
    engine_config: {},
  },
  {
    name: "Base64 Decoder",
    slug: "base64-decoder",
    description: "Decode Base64 text instantly in the browser.",
    related_slugs: ["base64-encoder", "json-formatter", "url-decoder"],
    engine_type: "base64-decoder",
    engine_config: {},
  },
  {
    name: "URL Encoder",
    slug: "url-encoder",
    description: "Encode text for safe use in URLs and query strings.",
    related_slugs: ["url-decoder", "slug-generator", "base64-encoder"],
    engine_type: "url-encoder",
    engine_config: {},
  },
  {
    name: "URL Decoder",
    slug: "url-decoder",
    description: "Decode URL-encoded text instantly to readable form.",
    related_slugs: ["url-encoder", "base64-decoder", "json-formatter"],
    engine_type: "url-decoder",
    engine_config: {},
  },
  {
    name: "Text Case Converter",
    slug: "text-case-converter",
    description: "Convert text into lowercase, uppercase, title case, and slug case instantly.",
    related_slugs: ["slug-generator", "word-counter", "json-formatter"],
    engine_type: "text-case-converter",
    engine_config: {},
  },
  {
    name: "Text Transformer",
    slug: "text-transformer",
    description: "Transform text using config-driven modes like lowercase, uppercase, title case, and slug conversion.",
    related_slugs: ["text-case-converter", "word-counter", "slug-generator"],
    engine_type: "text-transformer",
    engine_config: {
      title: "Text Transformer",
      modes: ["lowercase", "uppercase", "titlecase", "slug"],
    },
  },
  {
    name: "Random Number Generator",
    slug: "random-number-generator",
    description: "Generate random numbers using a configurable minimum, maximum, and decimal setting.",
    related_slugs: ["uuid-generator", "random-string-generator"],
    engine_type: "number-generator",
    engine_config: {
      title: "Random Number Generator",
      min: 1,
      max: 100,
      allowDecimal: false,
    },
  },
  {
    name: "Meters to Feet Converter",
    slug: "meters-to-feet-converter",
    description: "Convert meters to feet instantly using a config-driven unit converter engine.",
    related_slugs: ["url-encoder", "slug-generator"],
    engine_type: "unit-converter",
    engine_config: {
      title: "Meters to Feet Converter",
      fromUnit: "meters",
      toUnit: "feet",
      multiplier: 3.28084,
    },
  },
];

const STATIC_CALCULATORS: PublicContentItem[] = [
  {
    name: "Loan Calculator",
    slug: "loan-calculator",
    description: "Estimate monthly loan payments based on principal, interest rate, and repayment period.",
    related_slugs: ["bmi-calculator", "age-calculator", "emi-calculator"],
    engine_type: "loan-calculator",
    engine_config: {},
  },
  {
    name: "BMI Calculator",
    slug: "bmi-calculator",
    description: "Calculate body mass index from your height and weight.",
    related_slugs: ["age-calculator", "loan-calculator", "percentage-calculator"],
    engine_type: "bmi-calculator",
    engine_config: {},
  },
  {
    name: "Age Calculator",
    slug: "age-calculator",
    description: "Calculate age from a birth date in years, months, and days.",
    related_slugs: ["bmi-calculator", "loan-calculator"],
    engine_type: "age-calculator",
    engine_config: {},
  },
  {
    name: "EMI Calculator",
    slug: "emi-calculator",
    description: "Calculate EMI, total payment, and total interest for a loan instantly.",
    related_slugs: ["loan-calculator", "percentage-calculator"],
    engine_type: "emi-calculator",
    engine_config: {},
  },
  {
    name: "Percentage Calculator",
    slug: "percentage-calculator",
    description: "Calculate percentages, reverse percentages, and percentage change instantly.",
    related_slugs: ["emi-calculator", "loan-calculator", "bmi-calculator"],
    engine_type: "percentage-calculator",
    engine_config: {},
  },
  {
    name: "Simple Interest Calculator",
    slug: "simple-interest-calculator",
    description: "Calculate simple interest and total payable amount instantly.",
    related_slugs: ["loan-calculator", "emi-calculator", "gst-calculator"],
    engine_type: "simple-interest-calculator",
    engine_config: {
      title: "Simple Interest Calculator",
    },
  },
  {
    name: "GST Calculator",
    slug: "gst-calculator",
    description: "Add or remove GST from an amount instantly using a config-driven calculator engine.",
    related_slugs: ["simple-interest-calculator", "percentage-calculator"],
    engine_type: "gst-calculator",
    engine_config: {
      title: "GST Calculator",
      defaultRate: 18,
    },
  },
];

const STATIC_AI_TOOLS: PublicContentItem[] = [
  {
    name: "AI Prompt Generator",
    slug: "ai-prompt-generator",
    description: "Generate better prompts for AI tools based on your goal and desired style.",
    related_slugs: ["ai-email-writer", "ai-blog-outline-generator"],
    engine_type: "ai-prompt-generator",
    engine_config: {
      task: "prompt-generator",
      tone: "clear",
      outputType: "prompt",
      title: "AI Prompt Generator",
    },
  },
  {
    name: "AI Email Writer",
    slug: "ai-email-writer",
    description: "Generate polished emails with AI using your purpose, recipient, and tone.",
    related_slugs: ["ai-prompt-generator", "ai-blog-outline-generator"],
    engine_type: "ai-email-writer",
    engine_config: {
      task: "email",
      tone: "professional",
      outputType: "email",
      title: "AI Email Writer",
      toneOptions: ["professional", "friendly", "persuasive"],
    },
  },
  {
    name: "AI Blog Outline Generator",
    slug: "ai-blog-outline-generator",
    description: "Create structured blog outlines with AI for a target audience and topic.",
    related_slugs: ["ai-email-writer", "ai-prompt-generator"],
    engine_type: "ai-blog-outline-generator",
    engine_config: {
      task: "outline",
      tone: "clear",
      outputType: "outline",
      title: "AI Blog Outline Generator",
    },
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
  // layout.tsx uses template "%s | QuickFnd" — so do NOT add QuickFnd here.
  // Keyword-first format for better CTR in search results.
  if (table === "tools") return `${item.name} — Free Online Tool`;
  if (table === "calculators") return `${item.name} — Free Online Calculator`;
  return `${item.name} — Free AI Tool`;
}

export function buildMetaDescription(item: PublicContentItem, table: PublicTable) {
  const typeLabel = getCategoryLabel(table).toLowerCase();
  const desc = item.description
    ? item.description.replace(/\.$/, "")
    : `Use ${item.name} free online`;
  return `${desc}. Free browser-based ${typeLabel} on QuickFnd. No install needed.`;
}