"use client";

import { useEffect, useState } from "react";

type AdminItem = {
  id?: number;
  name: string;
  slug: string;
  description: string;
};

export default function AdminCalculatorsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState("");

  async function loadItems() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/list-calculators");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to load calculators.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load calculators.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function handleDelete(slug: string) {
    setBusySlug(slug);
    setError("");

    try {
      const response = await fetch("/api/admin/delete-calculator", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to delete calculator.");
      }

      setItems((prev) => prev.filter((item) => item.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete calculator.");
    } finally {
      setBusySlug("");
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Manage Calculators</h2>
        <p className="mt-2 text-sm text-q-muted">
          Review saved calculator entries and remove outdated records.
        </p>
      </section>

      {error ? (
        <div className="rounded-xl border border-q-danger bg-q-danger-soft px-4 py-3 text-sm text-q-danger">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
          Loading calculators...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
          No calculators found.
        </div>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="rounded-2xl border border-q-border bg-q-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-q-text">{item.name}</h3>
                  <p className="mt-1 text-sm text-q-muted">{item.slug}</p>
                  <p className="mt-3 text-sm leading-6 text-q-muted">
                    {item.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(item.slug)}
                  disabled={busySlug === item.slug}
                  className="rounded-xl border border-q-danger bg-q-danger-soft px-4 py-2 text-sm font-medium text-q-danger hover:opacity-90 disabled:opacity-60"
                >
                  {busySlug === item.slug ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}