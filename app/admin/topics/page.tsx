"use client";

import { useEffect, useState } from "react";

type TopicOpportunity = {
  key: string;
  label: string;
  live_tool_count: number;
  total_usage: number;
  request_mentions: number;
  opportunity_score: number;
  recommended_engine_types: string[];
  example_ideas: string[];
};

type CreatedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
};

type SkippedItem = {
  slug: string;
  reason: string;
};

export default function AdminTopicsPage() {
  const [items, setItems] = useState<TopicOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [busyTopic, setBusyTopic] = useState("");
  const [message, setMessage] = useState("");

  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([]);
  const [skippedItems, setSkippedItems] = useState<SkippedItem[]>([]);

  async function loadTopics() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/topic-expansion", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load topic intelligence.");
      }

      setItems(Array.isArray(data.opportunities) ? data.opportunities : []);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load topic intelligence."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTopics();
  }, []);

  async function expandTopic(topicKey: string) {
    setBusyTopic(topicKey);
    setMessage("");
    setCreatedItems([]);
    setSkippedItems([]);
    setError("");

    try {
      const response = await fetch("/api/admin/expand-topic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic_key: topicKey,
          count: 6,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to expand topic.");
      }

      setMessage(
        `Expanded ${data.topic_label}. Created ${data.createdCount} tool(s), skipped ${data.skippedCount}.`
      );
      setCreatedItems(Array.isArray(data.created) ? data.created : []);
      setSkippedItems(Array.isArray(data.skipped) ? data.skipped : []);

      await loadTopics();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to expand topic.");
    } finally {
      setBusyTopic("");
    }
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-q-text">Topic Expansion</h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
              Review niche opportunities with the strongest expansion potential.
              Use demand signals, live tool coverage, and topic usage to decide which
              clusters QuickFnd should expand next.
            </p>
          </div>

          <button
            onClick={loadTopics}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh
          </button>
        </div>

        {message ? (
          <div className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h3 className="text-2xl font-semibold text-q-text">Topic Opportunities</h3>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            Loading topic opportunities...
          </div>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            No topic opportunities available yet.
          </div>
        ) : (
          <div className="mt-6 grid gap-5">
            {items.map((item) => (
              <div
                key={item.key}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-3">
                      <div className="text-xl font-semibold text-q-text">{item.label}</div>
                      <div className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs font-medium text-q-text">
                        Score {item.opportunity_score}
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Live Tools
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.live_tool_count}
                        </div>
                      </div>

                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Total Usage
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.total_usage}
                        </div>
                      </div>

                      <div className="rounded-xl border border-q-border bg-q-card p-3">
                        <div className="text-xs uppercase tracking-wide text-q-muted">
                          Request Mentions
                        </div>
                        <div className="mt-1 text-sm font-medium text-q-text">
                          {item.request_mentions}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-q-muted">
                        Recommended Engines
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {item.recommended_engine_types.map((engine) => (
                          <span
                            key={engine}
                            className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text"
                          >
                            {engine}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs uppercase tracking-wide text-q-muted">
                        Example Expansion Ideas
                      </div>
                      <ul className="mt-2 space-y-1 text-sm text-q-text">
                        {item.example_ideas.map((idea) => (
                          <li key={idea}>• {idea}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="w-full xl:max-w-xs">
                    <button
                      onClick={() => expandTopic(item.key)}
                      disabled={busyTopic === item.key}
                      className="w-full rounded-xl bg-q-primary px-4 py-3 font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
                    >
                      {busyTopic === item.key ? "Expanding..." : "Expand Topic"}
                    </button>
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
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
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