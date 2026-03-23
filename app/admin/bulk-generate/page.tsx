"use client";

import { useMemo, useState } from "react";

type DemandSuggestion = {
  content_type: "tools" | "calculators" | "ai_tools";
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
  demand_score: number;
  demand_reason: string;
};

type CreatedItem = {
  name: string;
  slug: string;
  engine_type: string;
  content_type: string;
};

type SkippedItem = {
  slug: string;
  reason: string;
};

export default function AdminBulkGeneratePage() {
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState("15");
  const [contentType, setContentType] = useState<"tools" | "calculators" | "ai_tools">("tools");

  const [busy, setBusy] = useState(false);
  const [createBusy, setCreateBusy] = useState(false);

  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");

  const [suggestions, setSuggestions] = useState<DemandSuggestion[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([]);
  const [skippedItems, setSkippedItems] = useState<SkippedItem[]>([]);

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
          contentType,
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
        `Generated ${data.generatedCount} suggestion(s), ${data.supportedCount} valid, ${data.newCount} new and publishable for ${labelForType(contentType)}.`
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
        throw new Error(data?.error || "Failed to create selected items.");
      }

      setCreatedItems(Array.isArray(data.created) ? data.created : []);
      setSkippedItems(Array.isArray(data.skipped) ? data.skipped : []);
      setSummary(
        `Created ${data.createdCount} item(s), skipped ${data.skippedCount}.`
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create selected items."
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

  function labelForType(value: "tools" | "calculators" | "ai_tools") {
    if (value === "calculators") return "Calculators";
    if (value === "ai_tools") return "AI Tools";
    return "Tools";
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-q-text">Bulk Generate</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
          Enter a niche or theme. QuickFnd will generate demand-ranked ideas using
          your existing content, request history, usage signals, and the selected content type.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-[220px_1fr_120px_auto]">
          <select
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as "tools" | "calculators" | "ai_tools")
            }
            className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-4 text-q-text outline-none"
          >
            <option value="tools">Tools</option>
            <option value="calculators">Calculators</option>
            <option value="ai_tools">AI Tools</option>
          </select>

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
            {busy ? "Generating..." : `Generate ${labelForType(contentType)}`}
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
          <button
            onClick={() => fillExample("finance")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            finance
          </button>
          <button
            onClick={() => fillExample("writing assistant")}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            writing assistant
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
              Review AI-ranked ideas and publish only the ones you want.
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
              {createBusy ? "Creating..." : `Create Selected (${selectedCount})`}
            </button>
          </div>
        </div>

        {suggestions.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No suggestions yet. Enter a theme and generate demand suggestions first.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {suggestions.map((item) => (
              <div
                key={`${item.content_type}-${item.slug}`}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[item.slug])}
                    onChange={() => toggleSelected(item.slug)}
                    className="mt-1"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-lg font-semibold text-q-text">{item.name}</div>
                      <span className="rounded-full border border-q-border bg-q-card px-2.5 py-1 text-xs text-q-muted">
                        {labelForType(item.content_type)}
                      </span>
                      {item.engine_type ? (
                        <span className="rounded-full border border-q-border bg-q-card px-2.5 py-1 text-xs text-q-muted">
                          {item.engine_type}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>

                    <div className="mt-3 text-sm leading-6 text-q-muted">
                      {item.description}
                    </div>

                    <div className="mt-3 text-sm text-q-text">
                      Demand Score: <span className="font-medium">{item.demand_score}</span>
                    </div>

                    {item.demand_reason ? (
                      <div className="mt-2 text-sm text-q-muted">{item.demand_reason}</div>
                    ) : null}
                  </div>
                </label>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-q-text">Created Items</h3>

        {createdItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No items created in this session yet.
          </div>
        ) : (
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {createdItems.map((item) => (
              <div
                key={`${item.content_type}-${item.slug}`}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="text-lg font-semibold text-q-text">{item.name}</div>
                <div className="mt-2 text-sm text-q-muted">/{item.slug}</div>
                <div className="mt-2 text-sm text-q-muted">
                  Type: {labelForType(item.content_type as "tools" | "calculators" | "ai_tools")}
                </div>
                {item.engine_type ? (
                  <div className="mt-1 text-sm text-q-muted">Engine: {item.engine_type}</div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-q-text">Skipped Items</h3>

        {skippedItems.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
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