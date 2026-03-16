"use client";

import { useEffect, useMemo, useState } from "react";

type SuggestionItem = {
  name: string;
  category: "tool" | "calculator" | "ai-tool";
  reason: string;
  slug: string;
};

export default function AdminBulkGeneratePage() {
  const [ideas, setIdeas] = useState<SuggestionItem[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");

  async function loadIdeas() {
    setLoadingIdeas(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/tool-suggestions", {
        method: "GET",
        cache: "no-store",
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : { suggestions: [] };

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load suggestions.");
      }

      const items = Array.isArray(data.suggestions) ? data.suggestions : [];
      setIdeas(items);

      const nextSelected: Record<string, boolean> = {};
      for (const item of items) {
        nextSelected[item.slug] = false;
      }
      setSelected(nextSelected);
    } catch (error) {
      console.error("bulk loadIdeas error:", error);
      setIdeas([]);
      setSelected({});
      setMessage(
        error instanceof Error ? error.message : "Failed to load suggestions."
      );
    } finally {
      setLoadingIdeas(false);
    }
  }

  useEffect(() => {
    loadIdeas();
  }, []);

  const selectedItems = useMemo(
    () => ideas.filter((item) => selected[item.slug]),
    [ideas, selected]
  );

  async function createSelected() {
    if (selectedItems.length === 0) return;

    setCreating(true);
    setMessage("");

    const createdSlugs: string[] = [];
    const messages: string[] = [];

    for (const item of selectedItems) {
      try {
        const res = await fetch("/api/admin/create-tool", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idea: item.name,
            category: item.category,
          }),
        });

        const text = await res.text();
        const data = text ? JSON.parse(text) : {};

        if (!res.ok || !data.success) {
          messages.push(`${item.name}: ${data?.error || "failed"}`);
          continue;
        }

        createdSlugs.push(item.slug);
        messages.push(
          data.alreadyExists
            ? `${item.name}: already exists`
            : `${item.name}: created`
        );
      } catch {
        messages.push(`${item.name}: failed`);
      }
    }

    setIdeas((prev) => prev.filter((item) => !createdSlugs.includes(item.slug)));
    setSelected((prev) => {
      const next = { ...prev };
      for (const slug of createdSlugs) {
        delete next[slug];
      }
      return next;
    });

    setMessage(messages.join(" | "));
    setCreating(false);
  }

  function toggleAll(value: boolean) {
    const next: Record<string, boolean> = {};
    for (const item of ideas) {
      next[item.slug] = value;
    }
    setSelected(next);
  }

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-q-text">
              Bulk Generate
            </h2>
            <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
              Review AI-suggested high-demand ideas, select the ones you want, and create them in bulk.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => toggleAll(true)}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
            >
              Select All
            </button>
            <button
              onClick={() => toggleAll(false)}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
            >
              Clear
            </button>
            <button
              onClick={loadIdeas}
              disabled={loadingIdeas}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-medium text-q-text transition hover:border-blue-400/50 hover:text-blue-500 disabled:opacity-60"
            >
              {loadingIdeas ? "Refreshing..." : "Refresh Suggestions"}
            </button>
            <button
              onClick={createSelected}
              disabled={creating || selectedItems.length === 0}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creating
                ? "Creating..."
                : `Create Selected (${selectedItems.length})`}
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text">
            {message}
          </div>
        ) : null}
      </div>

      {loadingIdeas ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
          Loading suggestions...
        </div>
      ) : ideas.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
          No suggestions available right now.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {ideas.map((idea) => (
            <label
              key={idea.slug}
              className="block rounded-2xl border border-q-border bg-q-card p-6 transition hover:border-blue-400/50"
            >
              <div className="flex items-start justify-between gap-4">
                <input
                  type="checkbox"
                  checked={!!selected[idea.slug]}
                  onChange={(e) =>
                    setSelected((prev) => ({
                      ...prev,
                      [idea.slug]: e.target.checked,
                    }))
                  }
                  className="mt-1 h-4 w-4"
                />

                <span className="rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-wide text-q-muted">
                  {idea.category}
                </span>
              </div>

              <h3 className="mt-4 text-xl font-semibold text-q-text">
                {idea.name}
              </h3>

              <p className="mt-3 text-sm leading-6 text-q-muted">
                {idea.reason}
              </p>

              <div className="mt-4 text-xs text-q-muted">{idea.slug}</div>
            </label>
          ))}
        </div>
      )}
    </section>
  );
}