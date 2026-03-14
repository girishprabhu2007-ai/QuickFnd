export type AIToolItem = {
  slug: string;
  name: string;
  description: string;
  relatedSlugs: string[];
};

export const aiTools: AIToolItem[] = [
  {
    slug: "ai-prompt-generator",
    name: "AI Prompt Generator",
    description:
      "Generate better prompts for writing, coding, marketing, and productivity tasks.",
    relatedSlugs: ["ai-email-writer", "ai-blog-outline-generator", "chatgpt"],
  },
  {
    slug: "ai-email-writer",
    name: "AI Email Writer",
    description:
      "Draft professional emails quickly for business, support, sales, and follow-ups.",
    relatedSlugs: ["ai-prompt-generator", "ai-blog-outline-generator", "chatgpt"],
  },
  {
    slug: "ai-blog-outline-generator",
    name: "AI Blog Outline Generator",
    description:
      "Generate structured blog outlines for SEO articles, guides, and content planning.",
    relatedSlugs: ["ai-prompt-generator", "ai-email-writer", "chatgpt"],
  },
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description:
      "ChatGPT is an AI chatbot designed for writing, coding, brainstorming, and answering questions.",
    relatedSlugs: ["ai-prompt-generator", "ai-email-writer", "notion-ai"],
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    description:
      "Midjourney is an AI tool that generates stunning images from text prompts.",
    relatedSlugs: ["chatgpt", "notion-ai", "ai-blog-outline-generator"],
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    description:
      "Notion AI helps automate writing, summarizing, and productivity tasks inside Notion.",
    relatedSlugs: ["chatgpt", "ai-email-writer", "ai-prompt-generator"],
  },
];

export function getAIToolBySlug(slug: string) {
  return aiTools.find((tool) => tool.slug === slug);
}

export function getRelatedAITools(slug: string) {
  const currentTool = getAIToolBySlug(slug);
  if (!currentTool) return [];

  return currentTool.relatedSlugs
    .map((relatedSlug) => getAIToolBySlug(relatedSlug))
    .filter((tool): tool is AIToolItem => Boolean(tool));
}