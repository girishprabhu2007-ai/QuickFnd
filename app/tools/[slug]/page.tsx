import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import BuiltInToolClient from "@/components/tools/BuiltInToolClient";
import CurrencyConverterClient from "@/components/tools/CurrencyConverterClient";
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
  const item = await getContentItem("tools", slug);

  if (!item) {
    return {
      title: "Tool Not Found | QuickFnd",
      description: "The requested tool could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/tools/${item.slug}`;
  const title = buildPageTitle(item, "tools");
  const description = buildMetaDescription(item, "tools");
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

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("tools", slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "tools",
    item.related_slugs,
    item.slug
  );

  const engine = item.engine_type || inferEngineType("tool", item.slug);

  const primaryContent =
    engine === "currency-converter" ? (
      <CurrencyConverterClient />
    ) : (
      <BuiltInToolClient item={item} />
    );

  return (
    <>
      <JsonLd
        id="tool-breadcrumb-schema"
        data={buildBreadcrumbSchema("tools", item)}
      />
      <JsonLd id="tool-faq-schema" data={buildFaqSchema("tools", item)} />
      <JsonLd
        id="tool-software-schema"
        data={buildSoftwareSchema("tools", item)}
      />

      <PublicDetailPage
        table="tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={primaryContent}
      />
    </>
  );
}