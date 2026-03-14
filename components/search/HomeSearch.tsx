"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type SearchItem = {
  name: string;
  slug: string;
  description: string;
  type: "tool" | "calculator" | "ai-tool";
  href: string;
};

type SearchResponse = {
  query: string;
  tools: SearchItem[];
  calculators: SearchItem[];
  aiTools: SearchItem[];
  error?: string;
};

function ResultGroup({
  title,
  items,
}: {
  title: string;
  items: SearchItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={item.href}
            className="block rounded-xl border border-gray-800 bg-gray-950 p-4 transition hover:border-gray-700 hover:bg-gray-900"
          >
            <div className="flex items-center justify-between gap-3">
              <h4 className="font-medium text-white">{item.name}</h4>
              <span className="rounded-full border border-gray-700 px-2 py-1 text-xs text-gray-400">
                {item.type}
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              {item.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResponse>({
    query: "",
    tools: [],
    calculators: [],
    aiTools: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalResults = useMemo(() => {
    return (
      results.tools.length +
      results.calculators.length +
      results.aiTools.length
    );
  }, [results]);

  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed) {
      setResults({
        query: "",
        tools: [],
        calculators: [],
        aiTools: [],
      });
      setError("");
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(trimmed)}`,
          { signal: controller.signal }
        );

        const data: SearchResponse = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Search failed.");
        }

        setResults(data);
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Search failed.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <section className="rounded-3xl border border-gray-800 bg-gray-900 p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-400">
          QuickFnd Search
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">
          Find tools, calculators, and AI tools fast
        </h2>
        <p className="mt-4 text-base leading-7 text-gray-400">
          Search the full QuickFnd directory from one place. Results update as
          you type.
        </p>
      </div>

      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, calculators, AI tools..."
          className="w-full rounded-2xl border border-gray-700 bg-gray-950 px-5 py-4 text-white outline-none placeholder:text-gray-500"
        />
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-gray-800 bg-gray-950 p-4 text-sm text-gray-400">
          Searching...
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {query.trim() && !loading && !error ? (
        <div className="mt-6">
          <div className="mb-4 text-sm text-gray-400">
            {totalResults > 0
              ? `${totalResults} result${totalResults === 1 ? "" : "s"} found`
              : "No matches found."}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ResultGroup title="Tools" items={results.tools} />
            <ResultGroup title="Calculators" items={results.calculators} />
            <ResultGroup title="AI Tools" items={results.aiTools} />
          </div>
        </div>
      ) : null}
    </section>
  );
}