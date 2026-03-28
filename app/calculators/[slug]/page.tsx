import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import BuiltInCalculatorClient from "@/components/calculators/BuiltInCalculatorClient";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import {
  RelatedToolsSection,
  TopicLinksSection,
} from "@/components/seo/InternalLinkSections";
import {
  getContentItem,
  getCalculators,
  getTools,
  getAITools,
} from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";
import { isContentPubliclyVisible } from "@/lib/public-content-visibility";
import {
  getRelatedVisibleCalculators,
  getCalculatorTopicLinks,
  getRelatedTopics,
  getTopicBySlug,
  dedupeTopicLinkItems,
} from "@/lib/internal-linking";
import type { PublicContentItem } from "@/lib/content-pages";
import { getPostsByToolSlug, getPostsByKeyword } from "@/lib/blog";
import ToolArticlesSection from "@/components/blog/ToolArticlesSection";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

function CalculatorFallback({
  item,
  suggestions,
}: {
  item: PublicContentItem;
  suggestions: {
    name: string;
    slug: string;
    href: string;
    description: string;
  }[];
}) {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-q-border bg-q-card p-8">
          <h1 className="text-2xl font-semibold">{item.name} is being upgraded</h1>
          <p className="mt-3 text-q-muted">
            This calculator is not available yet. Try similar working calculators below.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {suggestions.map((s) => (
              <Link
                key={s.slug}
                href={s.href}
                className="rounded-xl border border-q-border bg-q-bg p-4 transition hover:bg-q-card-hover"
              >
                <div className="font-medium text-q-text">{s.name}</div>
                <div className="mt-1 text-sm text-q-muted">/{s.slug}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}

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

  if (!isContentPubliclyVisible(item)) {
    return {
      title: `${item.name} (Coming Soon) | QuickFnd`,
      description: item.description,
      alternates: { canonical: url },
      robots: { index: false, follow: true },
    };
  }

  const title = buildPageTitle(item, "calculators");
  const description = buildMetaDescription(item, "calculators");
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}&type=calculators&likes=${item.likes || 0}`;

  return {
    title,
    description,
    alternates: { canonical: url },
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

export default async function CalculatorPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("calculators", slug);

  if (!item) notFound();

  const [allCalculators, allTools, aiTools] = await Promise.all([
    getCalculators(),
    getTools(),
    getAITools(),
  ]);

  if (!isContentPubliclyVisible(item)) {
    const suggestions = getRelatedVisibleCalculators(
      item,
      allCalculators,
      allTools,
      aiTools,
      6
    );

    return <CalculatorFallback item={item} suggestions={suggestions} />;
  }

  const relatedCalculators = getRelatedVisibleCalculators(
    item,
    allCalculators,
    allTools,
    aiTools,
    6
  );

  const topicLinks = getCalculatorTopicLinks(item, allTools, allCalculators, aiTools);
  const primaryTopic = getTopicBySlug(item.slug, allTools, allCalculators, aiTools);
  const nearbyTopics = primaryTopic
    ? getRelatedTopics(primaryTopic.key, allTools, allCalculators, aiTools, 3)
    : [];

  const topicLinkKeys = new Set(topicLinks.map((topic) => topic.key));
  const relatedTopics = dedupeTopicLinkItems(
    nearbyTopics.filter((topic) => !topicLinkKeys.has(topic.key))
  );

  // Fetch related blog articles
  let relatedArticles = await getPostsByToolSlug(item.slug, 4);
  if (relatedArticles.length < 2) {
    const kwPosts = await getPostsByKeyword(
      item.name.toLowerCase().split(" ").slice(0, 2).join(" "), 4
    );
    const existingSlugs = new Set(relatedArticles.map((p: {slug: string}) => p.slug));
    relatedArticles = [...relatedArticles, ...kwPosts.filter(p => !existingSlugs.has((p as {slug: string}).slug))].slice(0, 4);
  }

  const secondaryContent = (
    <div className="space-y-8">
      <TopicLinksSection title="Explore This Topic" items={topicLinks} />
      <RelatedToolsSection title="Related Calculators" items={relatedCalculators} />
      <TopicLinksSection title="Nearby Topics" items={relatedTopics} />
    </div>
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
        relatedItems={[]}
        primaryContent={<BuiltInCalculatorClient item={item} />}
        secondaryContent={secondaryContent}
        showRelatedItemsSection={false}
      />
    </>
  );
}