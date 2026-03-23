export type ToolItem = {
  slug: string;
  name: string;
  description: string;
  relatedSlugs: string[];
};

export const tools: ToolItem[] = [
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong and secure passwords instantly.",
    relatedSlugs: ["uuid-generator", "base64-encoder-decoder", "word-counter"],
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs instantly.",
    relatedSlugs: ["json-formatter", "base64-encoder-decoder", "password-generator"],
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON easily.",
    relatedSlugs: ["base64-encoder-decoder", "word-counter", "uuid-generator"],
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    description: "Encode plain text to Base64 or decode Base64 back to text.",
    relatedSlugs: ["json-formatter", "uuid-generator", "word-counter"],
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate random UUIDs instantly for apps and databases.",
    relatedSlugs: ["password-generator", "json-formatter", "base64-encoder-decoder"],
  },
];

export function getToolBySlug(slug: string) {
  return tools.find((tool) => tool.slug === slug);
}

export function getRelatedTools(slug: string) {
  const currentTool = getToolBySlug(slug);
  if (!currentTool) return [];

  return currentTool.relatedSlugs
    .map((relatedSlug) => getToolBySlug(relatedSlug))
    .filter((tool): tool is ToolItem => Boolean(tool));
}