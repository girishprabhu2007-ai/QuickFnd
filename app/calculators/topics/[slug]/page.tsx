import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import ProgrammaticLandingPage from "@/components/seo/ProgrammaticLandingPage";
import { getContentItem, getContentItems, getRelatedContent } from "@/lib/db";
import {
  buildProgrammaticPages,
  getProgrammaticPageBySlug,
} from "@/lib/programmatic-pages";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const items = await getContentItems("calculators");
  return buildProgrammaticPages("calculators", items).map((page) => ({
    slug: page.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const items = await getContentItems("calculators");
  const page = getProgrammaticPageBySlug("calculators", items, slug);

  if (!page) {
    return {
      title: "Topic Not Found | QuickFnd",
      description: "The requested topic page could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const canonical = `${siteUrl}${page.href}`;

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: page.title,
      description: page.description,
      url: canonical,
      siteName: "QuickFnd",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: page.title,
      description: page.description,
    },
  };
}

export default async function CalculatorTopicPage({ params }: Props) {
  const { slug } = await params;
  const items = await getContentItems("calculators");
  const page = getProgrammaticPageBySlug("calculators", items, slug);

  if (!page) {
    notFound();
  }

  const item = await getContentItem("calculators", page.targetSlug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "calculators",
    item.related_slugs,
    item.slug
  );

  const siteUrl = getSiteUrl();

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${siteUrl}${crumb.href}`,
    })),
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: page.faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.heading,
    description: page.description,
    url: `${siteUrl}${page.href}`,
    about: item.name,
  };

  return (
    <>
      <JsonLd id="calculator-topic-breadcrumb-schema" data={breadcrumbSchema} />
      <JsonLd id="calculator-topic-faq-schema" data={faqSchema} />
      <JsonLd id="calculator-topic-webpage-schema" data={webPageSchema} />
      <ProgrammaticLandingPage
        table="calculators"
        page={page}
        item={item}
        relatedItems={relatedItems}
      />
    </>
  );
}