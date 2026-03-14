import type { MetadataRoute } from "next";
import { getAllContentForSitemap } from "@/lib/db";
import { getSiteUrl } from "@/lib/content-pages";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const { tools, calculators, aiTools } = await getAllContentForSitemap();
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/calculators`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/ai-tools`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const toolPages = tools.map((item) => ({
    url: `${siteUrl}/tools/${item.slug}`,
    lastModified: item.created_at ? new Date(item.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const calculatorPages = calculators.map((item) => ({
    url: `${siteUrl}/calculators/${item.slug}`,
    lastModified: item.created_at ? new Date(item.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const aiToolPages = aiTools.map((item) => ({
    url: `${siteUrl}/ai-tools/${item.slug}`,
    lastModified: item.created_at ? new Date(item.created_at) : now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...toolPages, ...calculatorPages, ...aiToolPages];
}