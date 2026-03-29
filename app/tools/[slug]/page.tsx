import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import BuiltInToolClient from "@/components/tools/BuiltInToolClient";
import {
  RelatedToolsSection,
  TopicLinksSection,
} from "@/components/seo/InternalLinkSections";
import {
  getContentItem,
  getTools,
  getCalculators,
  getAITools,
} from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";
import { isToolPubliclyVisible } from "@/lib/public-tool-visibility";
import { getPostsByToolSlug, getPostsByKeyword } from "@/lib/blog";
import ToolArticlesSection from "@/components/blog/ToolArticlesSection";
import {
  getRelatedVisibleTools,
  getToolTopicLinks,
  getRelatedTopics,
  getTopicByToolSlug,
  dedupeTopicLinkItems,
} from "@/lib/internal-linking";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 60;

function ToolUpgradeFallback({
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
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
          <div className="inline-flex rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-q-muted">
            Tool Upgrade In Progress
          </div>

          <h2 className="mt-4 text-2xl font-semibold text-q-text md:text-3xl">
            {item.name} is being upgraded
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-q-muted md:text-base">
            This tool page exists in QuickFnd, but the live engine is not publicly available yet.
            Here are similar working tools you can use right now.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white transition hover:bg-q-primary-hover"
            >
              Browse All Tools
            </Link>

            <Link
              href="/"
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 font-medium text-q-text transition hover:bg-q-card-hover"
            >
              Back To Homepage
            </Link>
          </div>

          {suggestions.length > 0 ? (
            <div className="mt-8">
              <h3 className="text-xl font-semibold text-q-text">Similar working tools</h3>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {suggestions.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={tool.href}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">{tool.name}</div>
                    <div className="mt-2 text-sm text-q-muted">/{tool.slug}</div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {tool.description || "Open this working tool now."}
                    </p>
                    <div className="mt-4 text-sm font-medium text-blue-500">
                      Open tool →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
              No close matches were found yet. Explore the full tools directory to find related working tools.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

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

  if (!isToolPubliclyVisible(item)) {
    return {
      title: `${item.name} Is Being Upgraded | QuickFnd`,
      description:
        item.description ||
        "This tool is being upgraded. Explore similar working tools on QuickFnd.",
      alternates: {
        canonical: url,
      },
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = buildPageTitle(item, "tools");
  const description = buildMetaDescription(item, "tools");
  const likesCount = (item as Record<string, unknown>).likes ?? 0;
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}&type=tools&likes=${likesCount}`;

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
    return notFoundPage();
  }

  const [allTools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  if (!isToolPubliclyVisible(item)) {
    const suggestions = getRelatedVisibleTools(item, allTools, calculators, aiTools, 6);
    return <ToolUpgradeFallback item={item} suggestions={suggestions} />;
  }

  const smartRelatedTools = getRelatedVisibleTools(
    item,
    allTools,
    calculators,
    aiTools,
    6
  );

  const topicLinks = getToolTopicLinks(item, allTools, calculators, aiTools);
  const primaryTopic = getTopicByToolSlug(item.slug, allTools, calculators, aiTools);
  const nearbyTopics = primaryTopic
    ? getRelatedTopics(primaryTopic.key, allTools, calculators, aiTools, 3)
    : [];

  const topicLinkKeys = new Set(topicLinks.map((topic) => topic.key));
  const relatedTopics = dedupeTopicLinkItems(
    nearbyTopics.filter((topic) => !topicLinkKeys.has(topic.key))
  );

  // Fetch related blog articles — by tool_slug first, then by name keyword
  let relatedArticles = await getPostsByToolSlug(item.slug, 4);
  if (relatedArticles.length < 2) {
    const kwPosts = await getPostsByKeyword(
      item.name.toLowerCase().split(" ").slice(0, 2).join(" "),
      4
    );
    const existingSlugs = new Set(relatedArticles.map(p => p.slug));
    relatedArticles = [
      ...relatedArticles,
      ...kwPosts.filter(p => !existingSlugs.has(p.slug)),
    ].slice(0, 4);
  }

  const secondaryContent = (
    <div className="space-y-8">
      <TopicLinksSection title="Explore This Topic" items={topicLinks} />
      <RelatedToolsSection title="Related Tools" items={smartRelatedTools} />
      {relatedArticles.length > 0 && (
        <ToolArticlesSection posts={relatedArticles} toolName={item.name} />
      )}
      <TopicLinksSection title="Nearby Topics" items={relatedTopics} />
    </div>
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
        relatedItems={[]}
        primaryContent={<BuiltInToolClient item={item} />}
        secondaryContent={secondaryContent}
        showRelatedItemsSection={false}
        categoryLabel={primaryTopic ? primaryTopic.label : null}
        categoryHref={primaryTopic ? `/topics/${primaryTopic.key}` : null}
      />
    </>
  );
}

function notFoundPage() {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-4xl rounded-2xl border border-q-border bg-q-card p-8">
        <h1 className="text-3xl font-bold text-q-text">Tool not found</h1>
        <p className="mt-4 text-q-muted">
          The tool you requested could not be found. Please browse the tools directory instead.
        </p>
        <Link
          href="/tools"
          className="mt-6 inline-flex rounded-xl bg-q-primary px-4 py-2 font-medium text-white transition hover:bg-q-primary-hover"
        >
          Browse Tools
        </Link>
      </section>
    </main>
  );
}