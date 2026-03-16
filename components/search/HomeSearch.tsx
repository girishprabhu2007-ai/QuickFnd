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

type CombinedItem = SearchItem & {
  relevanceScore: number;
};

function typeLabel(type: SearchItem["type"]) {
  if (type === "tool") return "Tool";
  if (type === "calculator") return "Calculator";
  return "AI Tool";
}

function scoreItem(item: SearchItem, query: string) {
  const q = query.toLowerCase().trim();
  const name = item.name.toLowerCase();
  const slug = item.slug.toLowerCase();
  const description = item.description.toLowerCase();

  let score = 0;

  if (name === q) score += 100;
  if (slug === q) score += 95;
  if (name.startsWith(q)) score += 60;
  if (slug.startsWith(q)) score += 50;
  if (name.includes(q)) score += 35;
  if (slug.includes(q)) score += 30;
  if (description.includes(q)) score += 10;

  const words = q.split(/\s+/).filter(Boolean);
  for (const word of words) {
    if (name.includes(word)) score += 8;
    if (slug.includes(word)) score += 6;
    if (description.includes(word)) score += 3;
  }

  if (item.type === "tool") score += 2;

  return score;
}

function SearchResultCard({ item }: { item: CombinedItem }) {
  return (
    <Link
      href={item.href}
      className="block rounded-2xl border border-q-border bg-q-card p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-[0_10px_24px_rgba(59,130,246,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold leading-7 text-q-text">{item.name}</h3>
        <span className="shrink-0 rounded-full border border-q-border bg-q-bg px-2.5 py-1 text-xs text-q-muted">
          {typeLabel(item.type)}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-q-muted">{item.description}</p>

      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-sm text-q-muted">/{item.slug}</span>
        <span className="text-sm font-medium text-blue-500">Open →</span>
      </div>
    </Link>
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

  const combinedResults = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const merged = [
      ...results.tools,
      ...results.calculators,
      ...results.aiTools,
    ].map((item) => ({
      ...item,
      relevanceScore: scoreItem(item, trimmed),
    }));

    return merged.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }, [results, query]);

  const counts = useMemo(() => {
    return {
      tools: results.tools.length,
      calculators: results.calculators.length,
      aiTools: results.aiTools.length,
      total:
        results.tools.length +
        results.calculators.length +
        results.aiTools.length,
    };
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
    <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
      <div className="max-w-3xl">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
          QuickFnd Search
        </p>
        <h2 className="mt-3 text-3xl font-bold text-q-text md:text-4xl">
          Find tools, calculators, and AI tools fast
        </h2>
        <p className="mt-4 text-base leading-7 text-q-muted">
          Search the full QuickFnd directory from one place. Results update as you type.
        </p>
      </div>

      <div className="mt-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tools, calculators, AI tools..."
          className="w-full rounded-2xl border border-q-border bg-q-bg px-5 py-4 text-q-text outline-none placeholder:text-q-muted"
        />
      </div>

      {loading ? (
        <div className="mt-4 rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
          Searching...
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-xl border border-q-danger bg-q-danger-soft p-4 text-sm text-q-danger">
          {error}
        </div>
      ) : null}

      {query.trim() && !loading && !error ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div>
            <div className="mb-4 text-sm text-q-muted">
              {counts.total > 0
                ? `${counts.total} result${counts.total === 1 ? "" : "s"} found`
                : "No matches found."}
            </div>

            {combinedResults.length === 0 ? (
              <div className="rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
                Try a broader keyword, niche, or tool name.
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {combinedResults.map((item) => (
                  <SearchResultCard
                    key={`${item.type}-${item.slug}`}
                    item={item}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="self-start rounded-2xl border border-q-border bg-q-bg p-5">
            <h3 className="text-lg font-semibold text-q-text">Search summary</h3>

            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-q-border bg-q-card px-3 py-3 text-sm">
                <span className="text-q-text">Tools</span>
                <span className="text-q-muted">{counts.tools}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-q-border bg-q-card px-3 py-3 text-sm">
                <span className="text-q-text">Calculators</span>
                <span className="text-q-muted">{counts.calculators}</span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-q-border bg-q-card px-3 py-3 text-sm">
                <span className="text-q-text">AI Tools</span>
                <span className="text-q-muted">{counts.aiTools}</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-q-border bg-q-card p-4 text-sm text-q-muted">
              Results are ranked together so niche-heavy searches like
              <span className="mx-1 font-medium text-q-text">YouTube</span>
              show in one stronger list instead of split across mostly empty columns.
            </div>
          </aside>
        </div>
      ) : null}
    </section>
  );
}