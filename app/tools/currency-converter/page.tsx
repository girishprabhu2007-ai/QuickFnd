import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CurrencyConverterClient from "@/components/tools/CurrencyConverterClient";
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
  const item = await getContentItem("tools", "currency-converter");

  if (!item) {
    return {
      title: "Currency Converter | QuickFnd",
      description: "Convert currencies in real time on QuickFnd.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/tools/${item.slug}`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent("Real-time currency conversion on QuickFnd")}`;

  return {
    title: `${item.name} | QuickFnd`,
    description: "Convert currencies in real time using live exchange rates.",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${item.name} | QuickFnd`,
      description: "Convert currencies in real time using live exchange rates.",
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${item.name} | QuickFnd`,
      description: "Convert currencies in real time using live exchange rates.",
      images: [ogImage],
    },
  };
}

export default async function CurrencyConverterPage() {
  const item = await getContentItem("tools", "currency-converter");

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "tools",
    item.related_slugs,
    item.slug
  );

  return (
    <>
      <JsonLd
        id="currency-converter-breadcrumb-schema"
        data={buildBreadcrumbSchema("tools", item)}
      />
      <JsonLd
        id="currency-converter-faq-schema"
        data={buildFaqSchema("tools", item)}
      />
      <JsonLd
        id="currency-converter-software-schema"
        data={buildSoftwareSchema("tools", item)}
      />

      <PublicDetailPage
        table="tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={<CurrencyConverterClient />}
      />
    </>
  );
}