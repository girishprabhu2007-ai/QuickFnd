import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import TopicLandingPage from "@/components/seo/TopicLandingPage";
import { TopicLinksSection } from "@/components/seo/InternalLinkSections";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { getTopicBySlug, getTopicCollections } from "@/lib/programmatic-seo";
import { getRelatedTopics } from "@/lib/internal-linking";
import { getSiteUrl } from "@/lib/site-url";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateStaticParams() {
  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const topics = getTopicCollections({ tools, calculators, aiTools });

  return topics.map((topic) => ({
    slug: topic.key,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const topic = getTopicBySlug(slug, { tools, calculators, aiTools });

  if (!topic) {
    return {
      title: "Topic Not Found | QuickFnd",
      description: "The requested topic page could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/topics/${topic.key}`;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    topic.label
  )}&subtitle=${encodeURIComponent(topic.metaDescription)}`;

  return {
    title: topic.metaTitle,
    description: topic.metaDescription,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: topic.metaTitle,
      description: topic.metaDescription,
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: topic.metaTitle,
      description: topic.metaDescription,
      images: [ogImage],
    },
  };
}

function buildBreadcrumbSchema(topic: {
  key: string;
  label: string;
}) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Topics",
        item: `${siteUrl}/topics`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: topic.label,
        item: `${siteUrl}/topics/${topic.key}`,
      },
    ],
  };
}

function buildCollectionSchema(topic: {
  key: string;
  label: string;
  metaDescription: string;
  totalCount: number;
}) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.label,
    description: topic.metaDescription,
    url: `${siteUrl}/topics/${topic.key}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: topic.totalCount,
    },
  };
}

function buildFaqSchema(topic: { label: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is included in ${topic.label}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `This topic page groups related QuickFnd tools, calculators, and AI tools for ${topic.label}.`,
        },
      },
      {
        "@type": "Question",
        name: `Why does QuickFnd use topic pages?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "Topic pages improve discovery, internal linking, and programmatic SEO across related tool clusters.",
        },
      },
    ],
  };
}

export default async function TopicPage({ params }: Props) {
  const { slug } = await params;

  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const topic = getTopicBySlug(slug, { tools, calculators, aiTools });

  if (!topic) {
    notFound();
  }

  const relatedTopics = getRelatedTopics(slug, tools, calculators, aiTools, 4);

  return (
    <>
      <JsonLd id="topic-breadcrumb-schema" data={buildBreadcrumbSchema(topic)} />
      <JsonLd id="topic-collection-schema" data={buildCollectionSchema(topic)} />
      <JsonLd id="topic-faq-schema" data={buildFaqSchema(topic)} />
      <TopicLandingPage topic={topic} />
      <main className="bg-q-bg px-4 pb-12 text-q-text sm:px-6 lg:px-8">
        <section className="mx-auto max-w-7xl space-y-8">
          <TopicLinksSection title="Related Topics" items={relatedTopics} />
        </section>
      </main>
    </>
  );
}