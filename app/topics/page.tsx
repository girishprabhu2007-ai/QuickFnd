import type { Metadata } from "next";
import Link from "next/link";
import SiteFooter from "@/components/site/SiteFooter";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { getTopicCollections } from "@/lib/programmatic-seo";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Topics | QuickFnd",
  description:
    "Explore QuickFnd topic pages for YouTube, SEO, developer tools, converters, text tools, and other niche clusters.",
};

export default async function TopicsIndexPage() {
  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const topics = getTopicCollections({ tools, calculators, aiTools });

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Topics
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            Programmatic SEO Topic Pages
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Explore niche-focused category pages that group related QuickFnd tools,
            calculators, and AI utilities into stronger topical clusters.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link
              key={topic.key}
              href={`/topics/${topic.key}`}
              className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:-translate-y-0.5 hover:border-blue-400/50"
            >
              <h2 className="text-2xl font-semibold text-q-text">{topic.label}</h2>
              <p className="mt-3 text-sm leading-6 text-q-muted">
                {topic.metaDescription}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-text">
                  Total {topic.totalCount}
                </span>
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-text">
                  Tools {topic.tools.length}
                </span>
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-text">
                  Calculators {topic.calculators.length}
                </span>
                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs text-q-text">
                  AI {topic.aiTools.length}
                </span>
              </div>

              <div className="mt-5 text-sm font-medium text-blue-500">
                Open topic →
              </div>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}