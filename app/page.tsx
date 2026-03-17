import Link from "next/link";
import HomeSearch from "@/components/search/HomeSearch";
import SiteFooter from "@/components/site/SiteFooter";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { filterVisibleTools } from "@/lib/public-tool-visibility";
import { getTopicCollections } from "@/lib/programmatic-seo";

export const revalidate = 300;

export default async function HomePage() {
  const [allTools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const tools = filterVisibleTools(allTools);

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators,
    aiTools,
  });

  const topics = getTopicCollections({
    tools,
    calculators,
    aiTools,
  }).slice(0, 6);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl space-y-8">
        <HomeSearch />

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
                Browse niche-focused topic pages that group related QuickFnd tools,
                calculators, and AI tools into stronger discovery clusters.
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
                <div className="text-xl font-semibold text-q-text">{topic.label}</div>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {topic.metaDescription}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text">
                    Total {topic.totalCount}
                  </span>
                  <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text">
                    Tools {topic.tools.length}
                  </span>
                  <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text">
                    Calculators {topic.calculators.length}
                  </span>
                  <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text">
                    AI {topic.aiTools.length}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-8">
            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">Featured Tools</h2>
                <Link href="/tools" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  View all tools
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tools.slice(0, 6).map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">{tool.name}</div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("tools", tool, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">Featured Calculators</h2>
                <Link href="/calculators" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  View all calculators
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {calculators.slice(0, 6).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/calculators/${item.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">{item.name}</div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("calculators", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold text-q-text">Featured AI Tools</h2>
                <Link href="/ai-tools" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  View all AI tools
                </Link>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {aiTools.slice(0, 6).map((item) => (
                  <Link
                    key={item.slug}
                    href={`/ai-tools/${item.slug}`}
                    className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
                  >
                    <div className="text-lg font-semibold text-q-text">{item.name}</div>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">Browse by niche</h2>

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
          </aside>
        </section>
      </section>

      <SiteFooter />
    </main>
  );
}