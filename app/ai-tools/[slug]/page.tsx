import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import { getContentItem, getRelatedContent, getAITools } from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import { getSiteUrl } from "@/lib/site-url";
import {
  isContentPubliclyVisible,
  filterVisibleContent,
} from "@/lib/public-content-visibility";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

function AIFallback({ item, suggestions }: any) {
  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-2xl border border-q-border bg-q-card p-8">
          <h1 className="text-2xl font-semibold">{item.name} is being upgraded</h1>
          <p className="mt-3 text-q-muted">
            This AI tool is not available yet.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {suggestions.map((s: any) => (
              <Link
                key={s.slug}
                href={`/ai-tools/${s.slug}`}
                className="rounded-xl border border-q-border bg-q-bg p-4"
              >
                {s.name}
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
      title: "AI Tool Not Found",
      description: "The requested AI tool could not be found.",
    };
  }

  if (!isContentPubliclyVisible(item)) {
    return {
      title: `${item.name} (Coming Soon)`,
      description: item.description,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: buildPageTitle(item, "ai_tools"),
    description: buildMetaDescription(item, "ai_tools"),
  };
}

export default async function AIToolPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("ai_tools", slug);

  if (!item) notFound();

  if (!isContentPubliclyVisible(item)) {
    const all = await getAITools();
    const suggestions = filterVisibleContent(all).slice(0, 6);
    return <AIFallback item={item} suggestions={suggestions} />;
  }

  const related = await getRelatedContent(
    "ai_tools",
    item.related_slugs,
    item.slug
  );

  return (
    <PublicDetailPage
      table="ai_tools"
      item={item}
      relatedItems={filterVisibleContent(related)}
      primaryContent={<div>AI tool UI</div>}
    />
  );
}