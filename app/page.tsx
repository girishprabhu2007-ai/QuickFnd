import type { Metadata } from "next";
import Link from "next/link";
import HomeSearch from "@/components/search/HomeSearch";
import SiteFooter from "@/components/site/SiteFooter";
import AdSlot from "@/components/ads/AdSlot";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import {
  filterVisibleTools,
  filterVisibleCalculators,
  filterVisibleAITools,
} from "@/lib/visibility";
import { getTopicCollections } from "@/lib/programmatic-seo";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "QuickFnd — Free Tools, Calculators & AI Utilities",
  description:
    "Free browser-based tools, calculators, and AI utilities for developers, writers, and productivity. JSON formatter, password generator, EMI calculator, AI email writer, and more.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description:
      "Free browser-based tools, calculators, and AI utilities. No install needed.",
  },
};

export default async function HomePage() {
  const [rawTools, rawCalculators, rawAITools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  // Unified visibility — all three filtered before any count or display
  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({ tools, calculators, aiTools });

  const topics = getTopicCollections({ tools, calculators, aiTools }).slice(0, 6);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl space-y-8">

        <HomeSearch />

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-q-border bg-q-card px-4 py-1.5 text-sm text-q-muted">
            {tools.length} Tools
          </span>
          <span className="rounded-full border border-q-border bg-q-card px-4 py-1.5 text-sm text-q-muted">
            {calculators.length} Calculators
          </span>
          <span className="rounded-full border border-q-border bg-q-card px-4 py-1.5 text-sm text-q-muted">
            {aiTools.length} AI Tools
          </span>
          <span className="rounded-full border border-q-border bg-q-card px-4 py-1.5 text-sm text-q-muted">
            {tools.length + calculators.length + aiTools.length} total
          </span>
        </div>

        {/* Topics section */}
        <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
                QuickFnd Topics
              </p>
              <h2 className="mt-3 text-3xl font-bold text-q-text">
                Explore topic clusters
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-q-muted md:text-base">
                Niche-focused pages grouping related tools, calculators, and AI
                utilities into focused discovery clusters.
              </p>
            </div>
            <Link
              href="/topics"
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
            >
              View all topics
            </Link>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <Link
                key={topic.key}
                href={`/topics/${topic.key}`}
                className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
              >
                <div className="text-xl font-semibold text-q-text">
                  {topic.label}
                </div>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {topic.metaDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text">
                    {topic.totalCount} items
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Homepage leaderboard ad */}
        <div className="flex justify-center">
          <AdSlot type="leaderboard" />
        </div>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">

            {/* Featured Tools */}
            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">
                  Featured Tools
                </h2>
                <Link
                  href="/tools"
                  className="text-sm font-medium text-blue-500 hover:text-blue-400"
                >
                  View all {tools.length} →
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">
                      {tool.name}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("tools", tool, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* In-feed ad between sections */}
            <div className="flex justify-center">
              <AdSlot type="in-article" />
            </div>

            {/* Featured Calculators */}
            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">
                  Featured Calculators
                </h2>
                <Link
                  href="/calculators"
                  className="text-sm font-medium text-blue-500 hover:text-blue-400"
                >
                  View all {calculators.length} →
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {calculators.slice(0, 6).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/calculators/${item.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">
                      {item.name}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("calculators", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* In-feed ad between sections */}
            <div className="flex justify-center">
              <AdSlot type="in-article" />
            </div>

            {/* Featured AI Tools */}
            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">
                  Featured AI Tools
                </h2>
                <Link
                  href="/ai-tools"
                  className="text-sm font-medium text-blue-500 hover:text-blue-400"
                >
                  View all {aiTools.length} →
                </Link>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {aiTools.slice(0, 6).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/ai-tools/${item.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">
                      {item.name}
                    </div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <div className="space-y-6">
              {/* Sidebar ad */}
              <div className="flex justify-center">
                <AdSlot type="rectangle" />
              </div>

              <section className="rounded-2xl border border-q-border bg-q-card p-6">
                <h2 className="text-xl font-semibold text-q-text">
                  Browse by niche
                </h2>
                <div className="mt-5 space-y-6">
                  <div>
                    <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-q-muted">
                      Tools
                    </div>
                    <div className="space-y-2">
                      {taxonomy.tools.map((group) => (
                        <Link
                          key={group.key}
                          href={`/tools?group=${group.key}`}
                          className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                        >
                          <span>{group.label}</span>
                          <span className="text-q-muted">{group.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-q-muted">
                      Calculators
                    </div>
                    <div className="space-y-2">
                      {taxonomy.calculators.map((group) => (
                        <Link
                          key={group.key}
                          href={`/calculators?group=${group.key}`}
                          className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                        >
                          <span>{group.label}</span>
                          <span className="text-q-muted">{group.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-q-muted">
                      AI Tools
                    </div>
                    <div className="space-y-2">
                      {taxonomy.aiTools.map((group) => (
                        <Link
                          key={group.key}
                          href={`/ai-tools?group=${group.key}`}
                          className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                        >
                          <span>{group.label}</span>
                          <span className="text-q-muted">{group.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}