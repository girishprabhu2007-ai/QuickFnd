"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { tools } from "@/lib/data/tools";
import { calculators } from "@/lib/data/calculators";
import { aiTools } from "@/lib/data/ai-tools";

const searchableItems = [
  ...tools.map((tool) => ({
    type: "Tool",
    slug: `/tools/${tool.slug}`,
    name: tool.name,
    description: tool.description,
  })),
  ...calculators.map((calculator) => ({
    type: "Calculator",
    slug: `/calculators/${calculator.slug}`,
    name: calculator.name,
    description: calculator.description,
  })),
  ...aiTools.map((tool) => ({
    type: "AI Tool",
    slug: `/ai-tools/${tool.slug}`,
    name: tool.name,
    description: tool.description,
  })),
];

const featuredTools = tools.slice(0, 3).map((tool) => ({
  slug: `/tools/${tool.slug}`,
  name: tool.name,
  description: tool.description,
}));

const featuredCalculators = calculators.slice(0, 3).map((calculator) => ({
  slug: `/calculators/${calculator.slug}`,
  name: calculator.name,
  description: calculator.description,
}));

const featuredAITools = aiTools.slice(0, 3).map((tool) => ({
  slug: `/ai-tools/${tool.slug}`,
  name: tool.name,
  description: tool.description,
}));

export default function Home() {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];

    return searchableItems.filter((item) => {
      return (
        item.name.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value) ||
        item.type.toLowerCase().includes(value)
      );
    });
  }, [query]);

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Find powerful tools, calculators, and AI resources instantly
        </h1>

        <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-400">
          QuickFnd is your all-in-one platform for online utilities, useful calculators,
          and AI tools — built to save time and scale into a fully automated resource hub.
        </p>

        <div className="mx-auto mb-4 max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-3 shadow-lg">
          <input
            type="text"
            placeholder="Search tools, calculators, or AI resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl bg-gray-950 px-4 py-4 text-white outline-none placeholder:text-gray-500"
          />
        </div>

        {query && (
          <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-4 text-left">
            <p className="mb-3 text-sm text-gray-400">
              {results.length > 0 ? `Found ${results.length} result(s)` : "No results found"}
            </p>

            <div className="space-y-3">
              {results.map((item) => (
                <Link
                  key={item.slug}
                  href={item.slug}
                  className="block rounded-xl bg-gray-800 p-4 transition hover:bg-gray-700"
                >
                  <div className="mb-1 text-xs uppercase tracking-wide text-blue-400">
                    {item.type}
                  </div>
                  <div className="font-semibold">{item.name}</div>
                  <div className="mt-1 text-sm text-gray-400">{item.description}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mx-auto mb-14 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Tools</h2>
          <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">
            View all tools
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.slug}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Calculators</h2>
          <Link href="/calculators" className="text-sm text-blue-400 hover:text-blue-300">
            View all calculators
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCalculators.map((calculator) => (
            <Link
              key={calculator.slug}
              href={calculator.slug}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{calculator.name}</h3>
              <p className="mt-2 text-gray-400">{calculator.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured AI Tools</h2>
          <Link href="/ai-tools" className="text-sm text-blue-400 hover:text-blue-300">
            View all AI tools
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAITools.map((tool) => (
            <Link
              key={tool.slug}
              href={tool.slug}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}