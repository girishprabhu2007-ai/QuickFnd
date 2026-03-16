"use client";

import { useMemo, useState } from "react";

type BulkCreatedTool = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

type BulkSkippedTool = {
  slug: string;
  reason: string;
};

export default function AdminBulkGeneratePage() {
  const [theme, setTheme] = useState("");
  const [count, setCount] = useState("8");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [createdItems, setCreatedItems] = useState<BulkCreatedTool[]>([]);
  const [skippedItems, setSkippedItems] = useState<BulkSkippedTool[]>([]);

  const canSubmit = useMemo(() => {
    return theme.trim().length > 0 && !busy;
  }, [theme, busy]);

  async function handleGenerate() {
    setBusy(true);
    setError("");
    setSummary("");
    setCreatedItems([]);
    setSkippedItems([]);

    try {
      const response = await fetch("/api/admin/bulk-create-tools", {
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
        throw new Error(data?.error || "Failed to bulk create tools.");
      }

      setSummary(
        `Created ${data.createdCount} tool(s), skipped ${data.skippedCount}, from ${data.supportedCount} supported AI suggestions.`
      );

      setCreatedItems(Array.isArray(data.created) ? data.created : []);
      setSkippedItems(Array.isArray(data.skipped) ? data.skipped : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to bulk create tools."
      );
    } finally {
      setBusy(false);
    }
  }

  function fillExample(value: string) {
    setTheme(value);
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-q-text">Bulk Generate</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-q-muted md:text-base">
          Enter a niche or theme. AI will generate multiple tool ideas, but only
          ideas that match supported engine families will be published.
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
            min={2}
            max={30}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-4 text-q-text outline-none"
          />

          <button
            onClick={handleGenerate}
            disabled={!canSubmit}
            className="rounded-2xl bg-q-primary px-5 py-4 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
          >
            {busy ? "Generating..." : "Generate Tools"}
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
        <h3 className="text-2xl font-semibold text-q-text">Created Tools</h3>

        {createdItems.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No tools created yet in this session.
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
                <div className="mt-3 text-sm leading-6 text-q-muted">
                  {item.description}
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