import type { MetadataRoute } from "next";
import { getAllContentForSitemap } from "@/lib/db";
import { buildProgrammaticPages } from "@/lib/programmatic-pages";
import { getSiteUrl } from "@/lib/site-url";
import {
  filterVisibleTools,
  filterVisibleCalculators,
  filterVisibleAITools,
} from "@/lib/visibility";

export const revalidate = 3600; // regenerate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const raw = await getAllContentForSitemap();

  // Apply visibility filters — sitemap only includes live, non-placeholder pages
  const tools = filterVisibleTools(raw.tools);
  const calculators = filterVisibleCalculators(raw.calculators);
  const aiTools = filterVisibleAITools(raw.aiTools);

  const now = new Date();

  const mainPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      changeFrequency: "daily",
      priority: 1,
      lastModified: now,
    },
    {
      url: `${siteUrl}/tools`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: now,
    },
    {
      url: `${siteUrl}/calculators`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: now,
    },
    {
      url: `${siteUrl}/ai-tools`,
      changeFrequency: "daily",
      priority: 0.9,
      lastModified: now,
    },
    {
      url: `${siteUrl}/topics`,
      changeFrequency: "weekly",
      priority: 0.7,
      lastModified: now,
    },
    {
      url: `${siteUrl}/request-tool`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/privacy`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terms`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/contact`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const toolPages: MetadataRoute.Sitemap = tools.map((item) => ({
    url: `${siteUrl}/tools/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: item.created_at ? new Date(item.created_at) : now,
  }));

  const calculatorPages: MetadataRoute.Sitemap = calculators.map((item) => ({
    url: `${siteUrl}/calculators/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: item.created_at ? new Date(item.created_at) : now,
  }));

  const aiToolPages: MetadataRoute.Sitemap = aiTools.map((item) => ({
    url: `${siteUrl}/ai-tools/${item.slug}`,
    changeFrequency: "weekly",
    priority: 0.8,
    lastModified: item.created_at ? new Date(item.created_at) : now,
  }));

  const toolTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "tools",
    tools
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: now,
  }));

  const calculatorTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "calculators",
    calculators
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: now,
  }));

  const aiTopicPages: MetadataRoute.Sitemap = buildProgrammaticPages(
    "ai_tools",
    aiTools
  ).map((page) => ({
    url: `${siteUrl}${page.href}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: now,
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