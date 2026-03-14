import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://quick-fnd-b5xf.vercel.app";

  const routes = [
    "",
    "/tools",
    "/tools/password-generator",
    "/tools/word-counter",
    "/tools/json-formatter",
    "/tools/base64-encoder-decoder",
    "/tools/uuid-generator",
    "/calculators",
    "/calculators/emi-calculator",
    "/calculators/age-calculator",
    "/calculators/percentage-calculator",
    "/ai-tools",
    "/ai-tools/chatgpt",
    "/ai-tools/midjourney",
    "/ai-tools/notion-ai",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }));
}