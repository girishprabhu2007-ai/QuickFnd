import type { MetadataRoute } from "next";
import { getAllContentForSitemap } from "@/lib/db";
import { buildProgrammaticPages } from "@/lib/programmatic-pages";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { tools, calculators, aiTools } = await getAllContentForSitemap();

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/calculators`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ai-tools`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((item) => ({
    url: `${siteUrl}/tools/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const calculatorPages: MetadataRoute.Sitemap = calculators.map((item) => ({
    url: `${siteUrl}/calculators/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const aiToolPages: MetadataRoute.Sitemap = aiTools.map((item) => ({
    url: `${siteUrl}/ai-tools/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const toolTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "tools",
    tools
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const calculatorTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "calculators",
    calculators
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const aiTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "ai_tools",
    aiTools
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    ...mainPages,
    ...toolPages,
    ...calculatorPages,
    ...aiToolPages,
    ...toolTopicPages,
    ...calculatorTopicPages,
    ...aiTopicPages,
  ];
}