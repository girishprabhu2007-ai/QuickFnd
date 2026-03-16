import Link from "next/link";
import HomeSearch from "@/components/search/HomeSearch";
import SiteFooter from "@/components/site/SiteFooter";
import { getAITools, getCalculators, getTools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";

export const revalidate = 300;

export default async function HomePage() {
  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const featuredTools = tools.slice(0, 6);
  const featuredCalculators = calculators.slice(0, 6);
  const featuredAITools = aiTools.slice(0, 6);

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators,
    aiTools,
  });

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
              <p className="text-sm uppercase tracking-[0.25em] text-blue-500">
                QuickFnd
              </p>
              <h1 className="mt-4 text-3xl font-bold md:text-5xl lg:text-6xl">
                Discover useful tools, calculators, and AI utilities
              </h1>
              <p className="mt-5 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
                QuickFnd is a searchable platform for utility tools, practical
                calculators, and AI-powered helpers. Explore public pages instantly
                and use built-in utilities directly in your browser.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/tools"
                  className="rounded-xl bg-q-primary px-5 py-3 font-medium text-white hover:bg-q-primary-hover"
                >
                  Explore Tools
                </Link>
                <Link
                  href="/calculators"
                  className="rounded-xl border border-q-border bg-q-bg px-5 py-3 font-medium text-q-text hover:bg-q-card-hover"
                >
                  Browse Calculators
                </Link>
                <Link
                  href="/ai-tools"
                  className="rounded-xl border border-q-border bg-q-bg px-5 py-3 font-medium text-q-text hover:bg-q-card-hover"
                >
                  Discover AI Tools
                </Link>
                <Link
                  href="/request-tool"
                  className="rounded-xl border border-q-border bg-q-bg px-5 py-3 font-medium text-q-text hover:bg-q-card-hover"
                >
                  Request a Tool
                </Link>
              </div>
            </div>

            <HomeSearch />

            <section className="mt-12">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Featured Tools</h2>
                  <p className="mt-2 text-sm text-q-muted">
                    Popular utility pages from the tools directory.
                  </p>
                </div>
                <Link
                  href="/tools"
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredTools.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/tools/${item.slug}`}
                    className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                  >
                    <h3 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("tools", item, "card")}
                    </p>
                    <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                      Open tool →
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Featured Calculators</h2>
                  <p className="mt-2 text-sm text-q-muted">
                    Practical calculators for everyday use.
                  </p>
                </div>
                <Link
                  href="/calculators"
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredCalculators.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/calculators/${item.slug}`}
                    className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                  >
                    <h3 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("calculators", item, "card")}
                    </p>
                    <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                      Open calculator →
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-12">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Featured AI Tools</h2>
                  <p className="mt-2 text-sm text-q-muted">
                    AI-powered utilities and discoverable AI listings.
                  </p>
                </div>
                <Link
                  href="/ai-tools"
                  className="text-sm text-blue-500 hover:text-blue-400"
                >
                  View all →
                </Link>
              </div>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {featuredAITools.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/ai-tools/${item.slug}`}
                    className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
                  >
                    <h3 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-q-muted">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                    <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                      Open AI tool →
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          <aside className="self-start xl:sticky xl:top-24 xl:max-h-[calc(100vh-7rem)] xl:overflow-y-auto">
            <section className="rounded-2xl border border-q-border bg-q-card p-6">
              <h2 className="text-xl font-semibold text-q-text">Browse by niche</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-q-muted">
                    Tools
                  </h3>
                  <div className="mt-3 space-y-2">
                    {taxonomy.tools.map((group) => (
                      <Link
                        key={`tool-${group.key}`}
                        href={`/tools?group=${group.key}`}
                        className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                      >
                        <span>{group.label}</span>
                        <span className="text-q-muted">{group.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-q-muted">
                    Calculators
                  </h3>
                  <div className="mt-3 space-y-2">
                    {taxonomy.calculators.map((group) => (
                      <Link
                        key={`calculator-${group.key}`}
                        href={`/calculators?group=${group.key}`}
                        className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
                      >
                        <span>{group.label}</span>
                        <span className="text-q-muted">{group.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-q-muted">
                    AI Tools
                  </h3>
                  <div className="mt-3 space-y-2">
                    {taxonomy.aiTools.map((group) => (
                      <Link
                        key={`ai-${group.key}`}
                        href={`/ai-tools?group=${group.key}`}
                        className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
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
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}