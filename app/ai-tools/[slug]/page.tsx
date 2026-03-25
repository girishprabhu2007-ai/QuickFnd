import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import AIToolRenderer from "@/components/ai/AIToolRenderer";
import {
  RelatedToolsSection,
  TopicLinksSection,
} from "@/components/seo/InternalLinkSections";
import {
  getContentItem,
  getAITools,
  getTools,
  getCalculators,
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
  getRelatedVisibleAITools,
  getAIToolTopicLinks,
  getRelatedTopics,
  getTopicBySlug,
  dedupeTopicLinkItems,
} from "@/lib/internal-linking";
import type { PublicContentItem } from "@/lib/content-pages";
import AffiliateCard from "@/components/monetisation/AffiliateCard";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

function AIToolFallback({
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
            This AI tool is not available yet. Try similar working AI tools below.
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
  const item = await getContentItem("ai_tools", slug);

  if (!item) {
    return {
      title: "AI Tool Not Found | QuickFnd",
      description: "The requested AI tool could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/ai-tools/${item.slug}`;

  if (!isContentPubliclyVisible(item)) {
    return {
      title: `${item.name} (Coming Soon) | QuickFnd`,
      description: item.description,
      alternates: { canonical: url },
      robots: { index: false, follow: true },
    };
  }

  const title = buildPageTitle(item, "ai_tools");
  const description = buildMetaDescription(item, "ai_tools");
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}`;

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

export default async function AIToolPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("ai_tools", slug);

  if (!item) {
    notFound();
  }

  const [allAITools, allTools, calculators] = await Promise.all([
    getAITools(),
    getTools(),
    getCalculators(),
  ]);

  if (!isContentPubliclyVisible(item)) {
    const suggestions = getRelatedVisibleAITools(
      item,
      allAITools,
      allTools,
      calculators,
      6
    );

    return <AIToolFallback item={item} suggestions={suggestions} />;
  }

  const relatedAITools = getRelatedVisibleAITools(
    item,
    allAITools,
    allTools,
    calculators,
    6
  );

  const topicLinks = getAIToolTopicLinks(item, allTools, calculators, allAITools);
  const primaryTopic = getTopicBySlug(item.slug, allTools, calculators, allAITools);
  const nearbyTopics = primaryTopic
    ? getRelatedTopics(primaryTopic.key, allTools, calculators, allAITools, 3)
    : [];

  const topicLinkKeys = new Set(topicLinks.map((topic) => topic.key));
  const relatedTopics = dedupeTopicLinkItems(
    nearbyTopics.filter((topic) => !topicLinkKeys.has(topic.key))
  );

  const secondaryContent = (
    <div className="space-y-8">
      <AffiliateCard slug={item.slug} />
      <TopicLinksSection title="Explore This Topic" items={topicLinks} />
      <RelatedToolsSection title="Related AI Tools" items={relatedAITools} />
      <TopicLinksSection title="Nearby Topics" items={relatedTopics} />
    </div>
  );

  return (
    <>
      <JsonLd
        id="ai-tool-breadcrumb-schema"
        data={buildBreadcrumbSchema("ai_tools", item)}
      />
      <JsonLd
        id="ai-tool-faq-schema"
        data={buildFaqSchema("ai_tools", item)}
      />
      <JsonLd
        id="ai-tool-software-schema"
        data={buildSoftwareSchema("ai_tools", item)}
      />

      <PublicDetailPage
        table="ai_tools"
        item={item}
        relatedItems={[]}
        primaryContent={<AIToolRenderer item={item} />}
        secondaryContent={secondaryContent}
        showRelatedItemsSection={false}
      />
    </>
  );
}