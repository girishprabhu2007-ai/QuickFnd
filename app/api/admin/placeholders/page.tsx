"use client";

import { useEffect, useState } from "react";

type PlaceholderItem = {
  name: string;
  slug: string;
  description: string;
  current_engine_type: string;
  resolved_engine_type: string;
  reason: string;
};

export default function AdminPlaceholdersPage() {
  const [items, setItems] = useState<PlaceholderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/placeholder-tools", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load placeholder tools.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setItems([]);
      setError(
        err instanceof Error ? err.message : "Failed to load placeholder tools."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="grid gap-8">
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-3xl font-semibold text-q-text">Placeholder Cleanup</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-q-muted md:text-base">
          These tools are kept in the database, but they are hidden from the public
          site because they do not currently resolve to a supported working engine.
          Once you assign a real supported engine, they will become public again automatically.
        </p>
      </section>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-2xl font-semibold text-q-text">Hidden Placeholder Tools</h3>
          <button
            onClick={loadItems}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
            Loading placeholder tools...
          </div>
        ) : error ? (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-green-300 bg-green-50 p-5 text-sm text-green-700">
            No placeholder tools found. Public tool inventory is clean.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {items.map((item) => (
              <div
                key={item.slug}
                className="rounded-2xl border border-q-border bg-q-bg p-5"
              >
                <div className="text-lg font-semibold text-q-text">{item.name}</div>
                <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-q-border bg-q-card p-3">
                    <div className="text-xs uppercase tracking-wide text-q-muted">
                      Current Engine
                    </div>
                    <div className="mt-1 text-sm font-medium text-q-text">
                      {item.current_engine_type || "(empty)"}
                    </div>
                  </div>

                  <div className="rounded-xl border border-q-border bg-q-card p-3">
                    <div className="text-xs uppercase tracking-wide text-q-muted">
                      Resolved Engine
                    </div>
                    <div className="mt-1 text-sm font-medium text-q-text">
                      {item.resolved_engine_type}
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-q-border bg-q-card p-4 text-sm text-q-muted">
                  {item.reason}
                </div>

                {item.description ? (
                  <div className="mt-4 text-sm leading-6 text-q-muted">
                    {item.description}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}