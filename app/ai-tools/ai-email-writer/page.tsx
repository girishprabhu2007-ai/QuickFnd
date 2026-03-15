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
  const item = await getContentItem("ai_tools", "ai-email-writer");

  if (!item) {
    return {
      title: "AI Email Writer | QuickFnd",
      description: "Generate emails with AI on QuickFnd.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/ai-tools/${item.slug}`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent("Generate emails with AI on QuickFnd")}`;

  return {
    title: `${item.name} | QuickFnd`,
    description: "Generate polished emails instantly with OpenAI.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${item.name} | QuickFnd`,
      description: "Generate polished emails instantly with OpenAI.",
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} | QuickFnd`,
      description: "Generate polished emails instantly with OpenAI.",
      images: [ogImage],
    },
  };
}

export default async function AIEmailWriterPage() {
  const item = await getContentItem("ai_tools", "ai-email-writer");

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
        id="ai-email-writer-breadcrumb-schema"
        data={buildBreadcrumbSchema("ai_tools", item)}
      />
      <JsonLd
        id="ai-email-writer-faq-schema"
        data={buildFaqSchema("ai_tools", item)}
      />
      <JsonLd
        id="ai-email-writer-software-schema"
        data={buildSoftwareSchema("ai_tools", item)}
      />

      <PublicDetailPage
        table="ai_tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={
          <AIToolEngineClient
            toolSlug="ai-email-writer"
            toolName={item.name}
          />
        }
      />
    </>
  );
}