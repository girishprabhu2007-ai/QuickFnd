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
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-12 rounded-3xl border border-gray-800 bg-gray-900 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
            QuickFnd
          </p>
          <h1 className="mt-4 text-4xl font-bold md:text-6xl">
            Discover useful tools, calculators, and AI utilities
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-gray-400">
            QuickFnd is a searchable platform for utility tools, practical
            calculators, and AI-powered helpers. Explore public pages instantly
            and use built-in utilities directly in your browser.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/tools"
              className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700"
            >
              Explore Tools
            </Link>
            <Link
              href="/calculators"
              className="rounded-xl border border-gray-700 bg-gray-950 px-5 py-3 font-medium text-white hover:bg-gray-900"
            >
              Browse Calculators
            </Link>
            <Link
              href="/ai-tools"
              className="rounded-xl border border-gray-700 bg-gray-950 px-5 py-3 font-medium text-white hover:bg-gray-900"
            >
              Discover AI Tools
            </Link>
          </div>
        </div>

        <HomeSearch />

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured Tools</h2>
              <p className="mt-2 text-sm text-gray-400">
                Popular utility pages from the tools directory.
              </p>
            </div>
            <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredTools.map((item) => (
              <Link
                key={item.slug}
                href={`/tools/${item.slug}`}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured Calculators</h2>
              <p className="mt-2 text-sm text-gray-400">
                Practical calculators for everyday use.
              </p>
            </div>
            <Link
              href="/calculators"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredCalculators.map((item) => (
              <Link
                key={item.slug}
                href={`/calculators/${item.slug}`}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Featured AI Tools</h2>
              <p className="mt-2 text-sm text-gray-400">
                AI-powered utilities and discoverable AI listings.
              </p>
            </div>
            <Link
              href="/ai-tools"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featuredAITools.map((item) => (
              <Link
                key={item.slug}
                href={`/ai-tools/${item.slug}`}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
              >
                <h3 className="text-xl font-semibold">{item.name}</h3>
                <p className="mt-3 text-sm leading-6 text-gray-400">
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