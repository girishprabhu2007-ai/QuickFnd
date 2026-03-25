"use client";

import { useEffect, useState } from "react";

type AdminItem = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  is_featured?: boolean | null;
  featured_until?: string | null;
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? "bg-amber-500" : "bg-q-border"}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}

function isFeaturedActive(item: AdminItem): boolean {
  if (!item.is_featured) return false;
  if (!item.featured_until) return true;
  return item.featured_until > new Date().toISOString();
}

export default function AdminAIToolsPage() {
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busySlug, setBusySlug] = useState("");
  const [featuredUntil, setFeaturedUntil] = useState<Record<string, string>>({});

  async function loadItems() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/list-ai-tools");
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load AI tools.");
      const loaded: AdminItem[] = Array.isArray(data.items) ? data.items : [];
      setItems(loaded);
      const defaults: Record<string, string> = {};
      for (const item of loaded) {
        if (item.featured_until) {
          defaults[item.slug] = item.featured_until.slice(0, 10);
        }
      }
      setFeaturedUntil(defaults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI tools.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadItems(); }, []);

  async function handleDelete(slug: string) {
    if (!confirm(`Delete "${slug}"? This cannot be undone.`)) return;
    setBusySlug(slug);
    setError("");
    try {
      const response = await fetch("/api/admin/delete-ai-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to delete AI tool.");
      setItems((prev) => prev.filter((item) => item.slug !== slug));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete AI tool.");
    } finally {
      setBusySlug("");
    }
  }

  async function handleToggleFeatured(item: AdminItem, featured: boolean) {
    setBusySlug(item.slug);
    const until = featuredUntil[item.slug]
      ? new Date(featuredUntil[item.slug] + "T23:59:59Z").toISOString()
      : null;
    try {
      const res = await fetch("/api/admin/toggle-featured", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: item.slug, is_featured: featured, featured_until: until }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItems((prev) => prev.map((i) =>
        i.slug === item.slug ? { ...i, is_featured: featured, featured_until: until } : i
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update featured status.");
    } finally {
      setBusySlug("");
    }
  }

  const featuredCount = items.filter(isFeaturedActive).length;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-q-text">Manage AI Tools</h2>
            <p className="mt-2 text-sm text-q-muted">
              Review, delete, and manage featured status for AI tool entries.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm">
              <span className="font-semibold text-amber-700">⭐ {featuredCount}</span>
              <span className="text-amber-600"> featured active</span>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted">
              {items.length} total AI tools
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
          <strong>Featured badge:</strong> Toggle ON to show ⭐ Featured on the tool card and float it to the top of the AI tools listing. Set an optional expiry date — it auto-expires on that date. Max 5 featured slots recommended.
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">Loading AI tools...</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-q-muted">No AI tools found.</div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const active = isFeaturedActive(item);
            return (
              <div key={item.slug} className={`rounded-2xl border bg-q-card p-5 transition ${active ? "border-amber-300" : "border-q-border"}`}>
                <div className="flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-q-text">{item.name}</span>
                      {active && (
                        <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          ⭐ Featured
                        </span>
                      )}
                      {item.is_featured && !active && item.featured_until && (
                        <span className="rounded-full border border-q-border bg-q-bg px-2 py-0.5 text-xs text-q-muted">
                          Expired
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-q-muted font-mono">/{item.slug}</div>
                    <p className="mt-1 text-sm text-q-muted line-clamp-2">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-q-muted">Featured</span>
                      <Toggle
                        checked={!!item.is_featured}
                        onChange={(v) => handleToggleFeatured(item, v)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-q-muted">Expires</span>
                      <input
                        type="date"
                        value={featuredUntil[item.slug] || ""}
                        min={new Date().toISOString().slice(0, 10)}
                        onChange={(e) => setFeaturedUntil((prev) => ({ ...prev, [item.slug]: e.target.value }))}
                        className="rounded-lg border border-q-border bg-q-bg px-2 py-1 text-xs text-q-text"
                      />
                    </div>
                    <a
                      href={`/ai-tools/${item.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-muted hover:bg-q-card-hover transition"
                    >
                      View →
                    </a>
                    <button
                      onClick={() => handleDelete(item.slug)}
                      disabled={busySlug === item.slug}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                    >
                      {busySlug === item.slug ? "..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}