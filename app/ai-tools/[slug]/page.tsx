import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuiltInAIToolClient from "@/components/ai-tools/BuiltInAIToolClient";
import { getContentItem, getRelatedContent } from "@/lib/db";
import {
  buildMetaDescription,
  buildPageTitle,
  getCategoryPath,
  getSiteUrl,
} from "@/lib/content-pages";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

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
  const title = buildPageTitle(item, "ai_tools");
  const description = buildMetaDescription(item, "ai_tools");

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function AIToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("ai_tools", slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent(
    "ai_tools",
    item.related_slugs,
    item.slug
  );

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <Link
            href="/ai-tools"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to AI tools
          </Link>
          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-blue-400">
            QuickFnd AI Tool
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">{item.name}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-gray-400">
            {item.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <BuiltInAIToolClient slug={item.slug} />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-xl font-semibold">About this AI tool</h2>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                {item.name} is published as an indexable AI tool page on
                QuickFnd. Interactive AI utilities continue to use your existing
                `/api/ai/generate` route, while directory-style entries render as
                content pages automatically.
              </p>
            </section>

            <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
              <h2 className="text-xl font-semibold">AI tool details</h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-gray-500">Slug</dt>
                  <dd className="mt-1 text-gray-200">{item.slug}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Category</dt>
                  <dd className="mt-1 text-gray-200">AI Tool</dd>
                </div>
                <div>
                  <dt className="text-gray-500">URL</dt>
                  <dd className="mt-1 break-all text-gray-200">
                    {getSiteUrl() + getCategoryPath("ai_tools") + "/" + item.slug}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="mt-10 rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="text-2xl font-semibold">What this page supports</h2>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-gray-400 md:grid-cols-3">
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              1. Interactive AI utilities for built-in QuickFnd AI tools.
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              2. Searchable, SEO-friendly directory pages for AI listings.
            </div>
            <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
              3. Internal linking between related AI tool pages.
            </div>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Related AI tools</h2>
          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 text-gray-400">
              No related AI tools available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ai-tools/${related.slug}`}
                  className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
                >
                  <h3 className="text-lg font-semibold">{related.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-gray-400">
                    {related.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-400">
                    Open AI tool →
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}