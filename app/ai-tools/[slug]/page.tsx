import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BuiltInAIToolClient from "@/components/ai-tools/BuiltInAIToolClient";
import OpenAITextToolClient from "@/components/ai-tools/OpenAITextToolClient";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import { getContentItem, getRelatedContent } from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";
import { inferEngineType } from "@/lib/engine-metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("ai_tools", slug);

  if (!item) {
    return {
      title: "AI Tool Not Found | QuickFnd",
      description: "The requested AI tool could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/ai-tools/${item.slug}`;
  const title = buildPageTitle(item, "ai_tools");
  const description = buildMetaDescription(item, "ai_tools");
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function AIToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("ai_tools", slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "ai_tools",
    item.related_slugs,
    item.slug
  );

  const engine = item.engine_type || inferEngineType("ai-tool", item.slug);

  const primaryContent =
    engine === "openai-text-tool" ? (
      <OpenAITextToolClient item={item} />
    ) : (
      <BuiltInAIToolClient item={item} />
    );

  return (
    <>
      <JsonLd
        id="ai-tool-breadcrumb-schema"
        data={buildBreadcrumbSchema("ai_tools", item)}
      />
      <JsonLd id="ai-tool-faq-schema" data={buildFaqSchema("ai_tools", item)} />
      <JsonLd
        id="ai-tool-software-schema"
        data={buildSoftwareSchema("ai_tools", item)}
      />

      <PublicDetailPage
        table="ai_tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={primaryContent}
      />
    </>
  );
}