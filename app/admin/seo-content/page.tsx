"use client";

import { useState, useEffect, useCallback } from "react";

type ContentItem = {
  slug: string;
  name: string;
  table_name: "tools" | "calculators" | "ai_tools";
  intro: string;
  benefits: string[];
  steps: string[];
  use_cases: string[];
  faqs: { question: string; answer: string }[];
  generated_at: string;
  source: string;
};

type RawItem = {
  slug: string;
  name: string;
  description: string;
  engine_type: string | null;
};

const TABLE_LABELS = {
  tools: "Tools",
  calculators: "Calculators",
  ai_tools: "AI Tools",
};

export default function AdminSEOContentPage() {
  const [table, setTable] = useState<"tools" | "calculators" | "ai_tools">("tools");
  const [items, setItems] = useState<RawItem[]>([]);
  const [generated, setGenerated] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<Set<string>>(new Set());
  const [bulkRunning, setBulkRunning] = useState(false);
  const [results, setResults] = useState<{ slug: string; status: string }[]>([]);
  const [preview, setPreview] = useState<ContentItem | null>(null);
  const [filter, setFilter] = useState<"all" | "missing" | "done">("missing");
  const [search, setSearch] = useState("");

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/seo-content-list?table=${table}`);
      const data = await res.json();
      setItems(data.items || []);
      setGenerated(new Set(data.generated || []));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [table]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function generateOne(item: RawItem, overwrite = false) {
    setGenerating(prev => new Set(prev).add(item.slug));
    try {
      const res = await fetch("/api/admin/generate-seo-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: item.slug,
          name: item.name,
          description: item.description,
          table,
          overwrite,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGenerated(prev => new Set(prev).add(item.slug));
        setResults(prev => [{ slug: item.slug, status: "✓ Generated" }, ...prev]);
      } else {
        setResults(prev => [{ slug: item.slug, status: data.reason || data.error || "Skipped" }, ...prev]);
      }
    } catch {
      setResults(prev => [{ slug: item.slug, status: "Error" }, ...prev]);
    } finally {
      setGenerating(prev => { const n = new Set(prev); n.delete(item.slug); return n; });
    }
  }

  async function previewContent(slug: string) {
    const res = await fetch(`/api/admin/generate-seo-content?slug=${slug}&table=${table}`);
    const data = await res.json();
    if (data.content) setPreview(data.content);
  }

  async function bulkGenerate() {
    const missing = visibleItems.filter(i => !generated.has(i.slug));
    if (missing.length === 0) return;

    setBulkRunning(true);
    setResults([]);

    for (const item of missing) {
      await generateOne(item);
      await new Promise(r => setTimeout(r, 800)); // Rate limit
    }
    setBulkRunning(false);
  }

  const visibleItems = items.filter(item => {
    const matchesFilter =
      filter === "all" ? true :
      filter === "missing" ? !generated.has(item.slug) :
      generated.has(item.slug);
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase()) || item.slug.includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const doneCount = items.filter(i => generated.has(i.slug)).length;
  const missingCount = items.length - doneCount;

  return (
    <div className="grid gap-6">

      {/* Header */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-bold text-q-text">SEO Content Manager</h2>
        <p className="mt-2 text-sm text-q-muted">
          Generate unique AI-powered SEO content for every tool. Content is saved to the database and served dynamically — no code changes needed.
        </p>

        {/* Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-q-text">{items.length}</div>
            <div className="text-xs text-q-muted">Total {TABLE_LABELS[table]}</div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{doneCount}</div>
            <div className="text-xs text-emerald-600">Have unique content</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center">
            <div className="text-2xl font-bold text-amber-700">{missingCount}</div>
            <div className="text-xs text-amber-600">Need content</div>
          </div>
          <div className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-center">
            <div className="text-2xl font-bold text-q-text">{Math.round((doneCount / Math.max(items.length, 1)) * 100)}%</div>
            <div className="text-xs text-q-muted">Coverage</div>
          </div>
        </div>
      </section>

      {/* Controls */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        <div className="flex flex-wrap gap-3">
          {/* Table selector */}
          {(["tools", "calculators", "ai_tools"] as const).map(t => (
            <button key={t} onClick={() => setTable(t)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${table === t ? "bg-blue-600 text-white" : "border border-q-border bg-q-bg text-q-muted hover:bg-q-card-hover"}`}>
              {TABLE_LABELS[t]}
            </button>
          ))}

          <div className="ml-auto flex flex-wrap gap-3">
            {/* Filter */}
            <select value={filter} onChange={e => setFilter(e.target.value as "all" | "missing" | "done")}
              className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
              <option value="missing">Missing content ({missingCount})</option>
              <option value="done">Has content ({doneCount})</option>
              <option value="all">All ({items.length})</option>
            </select>

            {/* Search */}
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search tools..."
              className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text placeholder:text-q-muted" />

            {/* Bulk generate */}
            <button onClick={bulkGenerate} disabled={bulkRunning || missingCount === 0}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">
              {bulkRunning ? `Generating... (${results.length}/${missingCount})` : `Generate All Missing (${missingCount})`}
            </button>
          </div>
        </div>
      </section>

      {/* Items list */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        {loading ? (
          <div className="py-10 text-center text-q-muted">Loading...</div>
        ) : (
          <div className="grid gap-3">
            {visibleItems.map(item => {
              const isDone = generated.has(item.slug);
              const isGenerating = generating.has(item.slug);
              return (
                <div key={item.slug}
                  className="flex items-center justify-between gap-3 rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${isDone ? "bg-emerald-500" : "bg-amber-400"}`} />
                      <span className="font-medium text-q-text">{item.name}</span>
                      <span className="text-xs text-q-muted">/{item.slug}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-q-muted truncate">{item.description}</div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    {isDone && (
                      <button onClick={() => previewContent(item.slug)}
                        className="rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs text-q-muted hover:bg-q-card-hover">
                        Preview
                      </button>
                    )}
                    <button
                      onClick={() => generateOne(item, isDone)}
                      disabled={isGenerating}
                      className={`rounded-lg px-3 py-1.5 text-xs font-medium transition disabled:opacity-50 ${isDone ? "border border-q-border bg-q-card text-q-muted hover:bg-q-card-hover" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                      {isGenerating ? "Generating..." : isDone ? "Regenerate" : "Generate"}
                    </button>
                  </div>
                </div>
              );
            })}

            {visibleItems.length === 0 && (
              <div className="py-10 text-center text-q-muted">
                {filter === "missing" ? "All tools have unique content! 🎉" : "No items match your search."}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Recent results */}
      {results.length > 0 && (
        <section className="rounded-2xl border border-q-border bg-q-card p-6">
          <h3 className="font-semibold text-q-text mb-3">Recent Results</h3>
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {results.map((r, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-q-muted font-mono">{r.slug}</span>
                <span className={r.status.startsWith("✓") ? "text-emerald-600" : "text-amber-600"}>{r.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Preview modal */}
      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-q-border bg-q-card p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-q-text">{preview.slug}</h3>
              <button onClick={() => setPreview(null)} className="text-q-muted hover:text-q-text">✕</button>
            </div>
            <p className="text-sm text-q-muted">{preview.intro}</p>
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-q-muted mb-2">Benefits</h4>
              {preview.benefits?.map((b, i) => <p key={i} className="text-sm text-q-muted">• {b}</p>)}
            </div>
            <div className="mt-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-q-muted mb-2">FAQs</h4>
              {preview.faqs?.map((f, i) => (
                <div key={i} className="mt-2">
                  <p className="text-sm font-medium text-q-text">{f.question}</p>
                  <p className="text-sm text-q-muted">{f.answer}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-q-muted">Generated: {preview.generated_at} via {preview.source}</p>
          </div>
        </div>
      )}
    </div>
  );
}