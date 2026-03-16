"use client";

import { useMemo, useState } from "react";

type DemandSuggestion = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
  demand_score: number;
  demand_reason: string;
};

type CreatedTool = {
  name: string;
  slug: string;
  engine_type: string;
};

type SkippedTool = {
  slug: string;
  reason: string;
};

export default function AdminBulkGeneratePage() {
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState("15");

  const [busy, setBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  const [suggestions, setSuggestions] = useState<DemandSuggestion[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [createdItems, setCreatedItems] = useState<CreatedTool[]>([]);
  const [skippedItems, setSkippedItems] = useState<SkippedTool[]>([]);

  const selectedCount = useMemo(() => {
    return Object.values(selected).filter(Boolean).length;
  }, [selected]);

  async function handleGenerateSuggestions() {
    setBusy(true);
    setError("");
    setSummary("");
    setSuggestions([]);
    setSelected({});
    setCreatedItems([]);
    setSkippedItems([]);

    try {
      const response = await fetch("/api/admin/tool-demand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          theme,
          count: Number(count),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate demand suggestions.");
      }

      const nextSuggestions = Array.isArray(data.suggestions) ? data.suggestions : [];
      setSuggestions(nextSuggestions);

      const nextSelected: Record<string, boolean> = {};
      for (const item of nextSuggestions) {
        nextSelected[item.slug] = true;
      }
      setSelected(nextSelected);

      setSummary(
        `Generated ${data.generatedCount} suggestion(s), ${data.supportedCount} supported, ${data.newCount} new and publishable.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate demand suggestions."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleCreateSelected() {
    const selectedItems = suggestions.filter((item) => selected[item.slug]);

    if (selectedItems.length === 0) {
      setError("Select at least one suggestion first.");
      return;
    }

    setCreateBusy(true);
    setError("");

    try {
      const response = await fetch("/api/admin/create-selected-tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: selectedItems,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create selected tools.");
      }

      setCreatedItems(Array.isArray(data.created) ? data.created : []);
      setSkippedItems(Array.isArray(data.skipped) ? data.skipped : []);
      setSummary(
        `Created ${data.createdCount} tool(s), skipped ${data.skippedCount}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create selected tools."
      );
    } finally {
      setCreateBusy(false);
    }
  }

  function setAllSelected(value: boolean) {
    const next: Record<string, boolean> = {};
    for (const item of suggestions) {
      next[item.slug] = value;
    }
    setSelected(next);
  }

  function toggleSelected(slug: string) {
    setSelected((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  }

  function fillExample(value: string) {
    setTheme(value);
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-q-text">Bulk Generate</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
          Enter a niche or theme. QuickFnd will generate demand-ranked tool ideas
          using your existing tools, request history, usage signals, and supported
          engine families.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[1fr_120px_auto]">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Example: youtube tools"
            className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-4 text-q-text outline-none placeholder:text-q-muted"
          />

          <input
            type="number"
            min={5}
            max={40}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-4 text-q-text outline-none"
          />

          <button
            onClick={handleGenerateSuggestions}
            disabled={busy || !theme.trim()}
            className="rounded-2xl bg-q-primary px-5 py-4 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
          >
            {busy ? "Generating..." : "Generate Demand Suggestions"}
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            onClick={() => fillExample("youtube tools")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            youtube tools
          </button>
          <button
            onClick={() => fillExample("seo tools")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            seo tools
          </button>
          <button
            onClick={() => fillExample("developer tools")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            developer tools
          </button>
          <button
            onClick={() => fillExample("text tools")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            text tools
          </button>
        </div>

        {summary ? (
          <div className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {summary}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-q-text">Demand Suggestions</h3>
            <p className="mt-2 text-sm text-q-muted">
              Review AI-ranked tool ideas and publish only the ones you want.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setAllSelected(true)}
              disabled={suggestions.length === 0}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50"
            >
              Select All
            </button>

            <button
              onClick={() => setAllSelected(false)}
              disabled={suggestions.length === 0}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50"
            >
              Clear
            </button>

            <button
              onClick={handleCreateSelected}
              disabled={createBusy || selectedCount === 0}
              className="rounded-xl bg-q-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
            >
              {createBusy
                ? "Creating..."
                : `Create Selected (${selectedCount})`}
            </button>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No suggestions yet. Enter a niche and generate demand suggestions first.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {suggestions.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[item.slug])}
                      onChange={() => toggleSelected(item.slug)}
                      className="mt-1"
                    />
                    <div>
                      <div className="text-lg font-semibold text-q-text">
                        {item.name}
                      </div>
                      <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                    </div>
                  </label>

                  <div className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs font-medium text-q-text">
                    Score {item.demand_score}
                  </div>
                </div>

                <div className="mt-4 text-sm leading-6 text-q-muted">
                  {item.description}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-q-border bg-q-card p-3">
                    <div className="text-xs uppercase tracking-wide text-q-muted">
                      Engine
                    </div>
                    <div className="mt-1 text-sm font-medium text-q-text">
                      {item.engine_type}
                    </div>
                  </div>

                  <div className="rounded-xl border border-q-border bg-q-card p-3">
                    <div className="text-xs uppercase tracking-wide text-q-muted">
                      Demand Reason
                    </div>
                    <div className="mt-1 text-sm text-q-text">
                      {item.demand_reason}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-q-text">Created Tools</h3>

        {createdItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No tools created in this session yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {createdItems.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="text-lg font-semibold text-q-text">{item.name}</div>
                <div className="mt-2 text-sm text-q-muted">/{item.slug}</div>
                <div className="mt-2 text-sm text-q-muted">
                  Engine: {item.engine_type}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-q-text">Skipped Items</h3>

        {skippedItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No skipped items in this session.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {skippedItems.map((item) => (
              <div
                key={`${item.slug}-${item.reason}`}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="text-lg font-semibold text-q-text">{item.slug}</div>
                <div className="mt-2 text-sm text-q-muted">{item.reason}</div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}