"use client";

import { useEffect, useMemo, useState } from "react";

type ToolItem = {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  engine_type?: string;
};

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

export default function AdminToolsPage() {
  const [items, setItems] = useState<ToolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const [singleIdea, setSingleIdea] = useState("");
  const [singleBusy, setSingleBusy] = useState(false);
  const [singleMessage, setSingleMessage] = useState("");
  const [singleError, setSingleError] = useState("");

  const [theme, setTheme] = useState("");
  const [count, setCount] = useState("8");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkError, setBulkError] = useState("");
  const [bulkSummary, setBulkSummary] = useState("");
  const [createdItems, setCreatedItems] = useState<BulkCreatedTool[]>([]);
  const [skippedItems, setSkippedItems] = useState<BulkSkippedTool[]>([]);

  async function loadTools() {
    setLoading(true);
    setListError("");

    try {
      const response = await fetch("/api/admin/list-tools", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load tools.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      setItems([]);
      setListError(error instanceof Error ? error.message : "Failed to load tools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTools();
  }, []);

  async function handleSingleCreate() {
    setSingleBusy(true);
    setSingleMessage("");
    setSingleError("");

    try {
      const response = await fetch("/api/admin/create-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: singleIdea,
          category: "tool",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to create tool.");
      }

      setSingleMessage(
        data?.alreadyExists
          ? `Tool already exists: ${data.slug}`
          : `Tool created successfully: ${data.slug}`
      );

      setSingleIdea("");
      await loadTools();
    } catch (error) {
      setSingleError(error instanceof Error ? error.message : "Failed to create tool.");
    } finally {
      setSingleBusy(false);
    }
  }

  async function handleBulkCreate() {
    setBulkBusy(true);
    setBulkError("");
    setBulkSummary("");
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

      setBulkSummary(
        `Created ${data.createdCount} tool(s), skipped ${data.skippedCount}, from ${data.supportedCount} supported AI suggestions.`
      );
      setCreatedItems(Array.isArray(data.created) ? data.created : []);
      setSkippedItems(Array.isArray(data.skipped) ? data.skipped : []);

      await loadTools();
    } catch (error) {
      setBulkError(error instanceof Error ? error.message : "Failed to bulk create tools.");
    } finally {
      setBulkBusy(false);
    }
  }

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }, [items]);

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        <h2 className="text-2xl font-semibold text-q-text">Create Single Tool</h2>
        <p className="mt-2 text-sm text-q-muted">
          Enter one tool idea. The system will only publish it if it matches a supported engine family.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={singleIdea}
            onChange={(e) => setSingleIdea(e.target.value)}
            placeholder="Example: SEO Title Slug Generator"
            className="w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted"
          />

          <button
            onClick={handleSingleCreate}
            disabled={singleBusy || !singleIdea.trim()}
            className="rounded-xl bg-q-primary px-5 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
          >
            {singleBusy ? "Creating..." : "Create Tool"}
          </button>
        </div>

        {singleMessage ? (
          <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {singleMessage}
          </div>
        ) : null}

        {singleError ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {singleError}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        <h2 className="text-2xl font-semibold text-q-text">Bulk Tool Generator</h2>
        <p className="mt-2 text-sm text-q-muted">
          Enter a niche or theme. AI will generate multiple tool ideas, but only supported engine-family tools will be published.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-[1fr_120px_auto]">
          <input
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Example: youtube tools"
            className="w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted"
          />

          <input
            type="number"
            min={2}
            max={30}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            className="w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none"
          />

          <button
            onClick={handleBulkCreate}
            disabled={bulkBusy || !theme.trim()}
            className="rounded-xl bg-q-primary px-5 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
          >
            {bulkBusy ? "Generating..." : "Generate In Bulk"}
          </button>
        </div>

        {bulkSummary ? (
          <div className="mt-4 rounded-xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {bulkSummary}
          </div>
        ) : null}

        {bulkError ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {bulkError}
          </div>
        ) : null}

        {createdItems.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-q-text">Created Tools</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {createdItems.map((item) => (
                <div key={item.slug} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="font-medium text-q-text">{item.name}</div>
                  <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                  <div className="mt-2 text-sm text-q-muted">{item.engine_type}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {skippedItems.length > 0 ? (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-q-text">Skipped Items</h3>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {skippedItems.map((item) => (
                <div key={`${item.slug}-${item.reason}`} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="font-medium text-q-text">{item.slug}</div>
                  <div className="mt-1 text-sm text-q-muted">{item.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-q-text">Existing Tools</h2>
          <button
            onClick={loadTools}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-q-muted">Loading tools...</p>
        ) : listError ? (
          <div className="mt-4 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {listError}
          </div>
        ) : sortedItems.length === 0 ? (
          <p className="mt-4 text-sm text-q-muted">No tools found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-y-2">
              <thead>
                <tr className="text-left text-sm text-q-muted">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Slug</th>
                  <th className="px-3 py-2">Engine Type</th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.map((item) => (
                  <tr key={item.slug} className="rounded-xl bg-q-bg text-sm text-q-text">
                    <td className="px-3 py-3 font-medium">{item.name}</td>
                    <td className="px-3 py-3">{item.slug}</td>
                    <td className="px-3 py-3">{item.engine_type || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}