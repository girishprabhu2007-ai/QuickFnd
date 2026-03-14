export type AIToolItem = {
  slug: string;
  name: string;
  description: string;
  relatedSlugs: string[];
};

export const aiTools: AIToolItem[] = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description:
      "ChatGPT is an AI chatbot designed for writing, coding, brainstorming, and answering questions.",
    relatedSlugs: ["notion-ai", "midjourney"],
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    description:
      "Midjourney is an AI tool that generates stunning images from text prompts.",
    relatedSlugs: ["chatgpt", "notion-ai"],
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    description:
      "Notion AI helps automate writing, summarizing, and productivity tasks inside Notion.",
    relatedSlugs: ["chatgpt", "midjourney"],
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