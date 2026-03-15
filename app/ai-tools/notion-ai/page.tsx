import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AIToolEngineClient from "@/components/ai-tools/AIToolEngineClient";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import { getContentItem, getRelatedContent } from "@/lib/db";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const item = await getContentItem("ai_tools", "notion-ai");

  if (!item) {
    return {
      title: "Notion AI | QuickFnd",
      description: "Generate Notion-ready content with AI on QuickFnd.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/ai-tools/${item.slug}`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent("Generate Notion-ready content with AI")}`;

  return {
    title: `${item.name} | QuickFnd`,
    description: "Generate Notion-ready notes, summaries, and structured content with OpenAI.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${item.name} | QuickFnd`,
      description: "Generate Notion-ready notes, summaries, and structured content with OpenAI.",
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} | QuickFnd`,
      description: "Generate Notion-ready notes, summaries, and structured content with OpenAI.",
      images: [ogImage],
    },
  };
}

export default async function NotionAIPage() {
  const item = await getContentItem("ai_tools", "notion-ai");

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "ai_tools",
    item.related_slugs,
    item.slug
  );

  return (
    <>
      <JsonLd
        id="notion-ai-breadcrumb-schema"
        data={buildBreadcrumbSchema("ai_tools", item)}
      />
      <JsonLd
        id="notion-ai-faq-schema"
        data={buildFaqSchema("ai_tools", item)}
      />
      <JsonLd
        id="notion-ai-software-schema"
        data={buildSoftwareSchema("ai_tools", item)}
      />

      <PublicDetailPage
        table="ai_tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={
          <AIToolEngineClient
            toolSlug="notion-ai"
            toolName={item.name}
          />
        }
      />
    </>
  );
}