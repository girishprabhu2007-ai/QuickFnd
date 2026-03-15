import Link from "next/link";
import HomeSearch from "@/components/search/HomeSearch";
import { getAITools, getCalculators, getTools } from "@/lib/db";

export default async function HomePage() {
  const [tools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const featuredTools = tools.slice(0, 6);
  const featuredCalculators = calculators.slice(0, 6);
  const featuredAITools = aiTools.slice(0, 6);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
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
            <Link href="/tools" className="text-sm text-blue-500 hover:text-blue-400">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredTools.map((item) => (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {item.description}
                </p>
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
            <Link href="/calculators" className="text-sm text-blue-500 hover:text-blue-400">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCalculators.map((item) => (
              <Link
                key={item.slug}
                href={`/calculators/${item.slug}`}
                className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {item.description}
                </p>
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
            <Link href="/ai-tools" className="text-sm text-blue-500 hover:text-blue-400">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredAITools.map((item) => (
              <Link
                key={item.slug}
                href={`/ai-tools/${item.slug}`}
                className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}