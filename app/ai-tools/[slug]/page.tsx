import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BuiltInAIToolClient from "@/components/ai-tools/BuiltInAIToolClient";
import JsonLd from "@/components/seo/JsonLd";
import PageSEOSections from "@/components/seo/PageSEOSections";
import { getContentItem, getRelatedContent } from "@/lib/db";
import {
  buildMetaDescription,
  buildPageTitle,
  getCategoryPath,
  getSiteUrl,
} from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";

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
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <JsonLd
        id="ai-tool-breadcrumb-schema"
        data={buildBreadcrumbSchema("ai_tools", item)}
      />
      <JsonLd id="ai-tool-faq-schema" data={buildFaqSchema("ai_tools", item)} />
      <JsonLd
        id="ai-tool-software-schema"
        data={buildSoftwareSchema("ai_tools", item)}
      />

      <section className="mx-auto max-w-6xl">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-q-muted">
          <Link href="/" className="hover:text-q-text">
            Home
          </Link>
          <span>/</span>
          <Link href="/ai-tools" className="hover:text-q-text">
            AI Tools
          </Link>
          <span>/</span>
          <span className="text-q-text">{item.name}</span>
        </nav>

        <div className="mb-10">
          <Link
            href="/ai-tools"
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            ← Back to AI tools
          </Link>

          <p className="mt-5 text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd AI Tool
          </p>

          <h1 className="mt-3 text-3xl font-bold md:text-4xl lg:text-5xl">
            {item.name}
          </h1>

          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {item.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
          <BuiltInAIToolClient item={item} />

          <aside className="space-y-6">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                About this AI tool
              </h2>
              <p className="mt-4 text-sm leading-7 text-q-muted">
                {item.name} is published as an indexable AI tool page on
                QuickFnd. Interactive AI utilities use engine-based rendering,
                while directory-style entries still work as searchable public
                pages.
              </p>
            </section>

            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">
                AI tool details
              </h2>
              <dl className="mt-4 grid gap-4 text-sm">
                <div>
                  <dt className="text-q-muted">Slug</dt>
                  <dd className="mt-1 text-q-text">{item.slug}</dd>
                </div>
                <div>
                  <dt className="text-q-muted">Category</dt>
                  <dd className="mt-1 text-q-text">AI Tool</dd>
                </div>
                <div>
                  <dt className="text-q-muted">Engine</dt>
                  <dd className="mt-1 text-q-text">
                    {item.engine_type || "auto"}
                  </dd>
                </div>
                <div>
                  <dt className="text-q-muted">URL</dt>
                  <dd className="mt-1 break-all text-q-text">
                    {getSiteUrl() +
                      getCategoryPath("ai_tools") +
                      "/" +
                      item.slug}
                  </dd>
                </div>
              </dl>
            </section>
          </aside>
        </div>

        <section className="mt-10">
          <PageSEOSections table="ai_tools" item={item} />
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-semibold text-q-text">
            Related AI tools
          </h2>

          {relatedItems.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
              No related AI tools available yet.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.slug}
                  href={`/ai-tools/${related.slug}`}
                  className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
                >
                  <h3 className="text-lg font-semibold text-q-text">
                    {related.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-q-muted">
                    {related.description}
                  </p>
                  <div className="mt-4 text-sm font-medium text-blue-500">
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