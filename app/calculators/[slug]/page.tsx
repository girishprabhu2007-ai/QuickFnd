import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BuiltInCalculatorClient from "@/components/calculators/BuiltInCalculatorClient";
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

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) {
    return {
      title: "Calculator Not Found | QuickFnd",
      description: "The requested calculator could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/calculators/${item.slug}`;
  const title = buildPageTitle(item, "calculators");
  const description = buildMetaDescription(item, "calculators");
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

export default async function CalculatorDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "calculators",
    item.related_slugs,
    item.slug
  );

  return (
    <>
      <JsonLd
        id="calculator-breadcrumb-schema"
        data={buildBreadcrumbSchema("calculators", item)}
      />
      <JsonLd
        id="calculator-faq-schema"
        data={buildFaqSchema("calculators", item)}
      />
      <JsonLd
        id="calculator-software-schema"
        data={buildSoftwareSchema("calculators", item)}
      />

      <PublicDetailPage
        table="calculators"
        item={item}
        relatedItems={relatedItems}
        primaryContent={<BuiltInCalculatorClient item={item} />}
      />
    </>
  );
}