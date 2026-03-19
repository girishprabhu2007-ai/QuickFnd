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
  getRelatedContent,
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
import {
  isContentPubliclyVisible,
  filterVisibleContent,
} from "@/lib/public-content-visibility";
import {
  getRelatedVisibleTools,
  getToolTopicLinks,
  getRelatedTopics,
  getTopicByToolSlug,
} from "@/lib/internal-linking";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

function AIToolFallback({
  item,
  suggestions,
}: {
  item: PublicContentItem;
  suggestions: PublicContentItem[];
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
                href={`/ai-tools/${s.slug}`}
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

  if (!isContentPubliclyVisible(item)) {
    const all = await getAITools();
    const suggestions = filterVisibleContent(all)
      .filter((entry) => entry.slug !== item.slug)
      .slice(0, 6);

    return <AIToolFallback item={item} suggestions={suggestions} />;
  }

  const [allTools, calculators, aiTools, related] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
    getRelatedContent("ai_tools", item.related_slugs, item.slug),
  ]);

  const smartRelatedTools = getRelatedVisibleTools(
    item,
    allTools,
    calculators,
    aiTools,
    6
  );

  const topicLinks = getToolTopicLinks(item, allTools, calculators, aiTools);

  const primaryTopic = getTopicByToolSlug(item.slug, allTools, calculators, aiTools);
  const relatedTopics = primaryTopic
    ? getRelatedTopics(primaryTopic.key, allTools, calculators, aiTools, 3)
    : [];

  const secondaryContent = (
    <div className="space-y-8">
      <TopicLinksSection title="Explore This Topic" items={topicLinks} />
      <RelatedToolsSection title="Related AI Tools" items={smartRelatedTools} />
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
        relatedItems={filterVisibleContent(related)}
        primaryContent={<AIToolRenderer item={item} />}
        secondaryContent={secondaryContent}
        showRelatedItemsSection={false}
      />
    </>
  );
}