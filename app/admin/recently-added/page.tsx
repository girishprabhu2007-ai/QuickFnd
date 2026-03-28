"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type RecentItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  engine_type: string;
  category: "tool" | "calculator" | "ai-tool";
  created_at: string;
  liveStatus?: "ok" | "404" | "placeholder" | "checking";
};

const SITE = "https://quickfnd.com";

function categoryPath(cat: string) {
  if (cat === "calculator") return "calculators";
  if (cat === "ai-tool") return "ai-tools";
  return "tools";
}

export default function RecentlyAddedPage() {
  const [items, setItems] = useState<RecentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [checking, setChecking] = useState(false);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    const [t, c, a] = await Promise.all([
      fetch("/api/admin/trend-signals?view=recent&table=tools&limit=30").then(r => r.json()),
      fetch("/api/admin/trend-signals?view=recent&table=calculators&limit=20").then(r => r.json()),
      fetch("/api/admin/trend-signals?view=recent&table=ai_tools&limit=10").then(r => r.json()),
    ]);
    const all: RecentItem[] = [
      ...(t.items || []).map((x: RecentItem) => ({ ...x, category: "tool" as const })),
      ...(c.items || []).map((x: RecentItem) => ({ ...x, category: "calculator" as const })),
      ...(a.items || []).map((x: RecentItem) => ({ ...x, category: "ai-tool" as const })),
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
     .slice(0, 50);
    setItems(all.map(i => ({ ...i, liveStatus: "checking" })));
    setLoading(false);
  }, []);

  useEffect(() => { fetchRecent(); }, [fetchRecent]);

  async function checkLiveStatus() {
    setChecking(true);
    const updated = [...items];
    for (let i = 0; i < updated.length; i++) {
      const item = updated[i];
      const url = `${SITE}/${categoryPath(item.category)}/${item.slug}`;
      try {
        const res = await fetch(`/api/admin/check-url?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        updated[i] = { ...item, liveStatus: data.status };
        setItems([...updated]);
      } catch {
        updated[i] = { ...item, liveStatus: "404" };
        setItems([...updated]);
      }
      await new Promise(r => setTimeout(r, 200));
    }
    setChecking(false);
  }

  async function deleteItem(item: RecentItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setDeleting(item.id);
    const res = await fetch("/api/admin/delete-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: item.slug, category: item.category }),
    });
    const data = await res.json();
    if (data.success) {
      setItems(prev => prev.filter(i => i.id !== item.id));
      setMessage(`✓ Deleted: ${item.name}`);
    } else {
      setMessage(`Error: ${data.error}`);
    }
    setDeleting(null);
  }

  function statusBadge(status?: string) {
    if (!status || status === "checking") return <span className="rounded-full bg-q-bg border border-q-border px-2 py-0.5 text-xs text-q-muted">checking...</span>;
    if (status === "ok") return <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">✓ live</span>;
    if (status === "placeholder") return <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">⚠ placeholder</span>;
    return <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-400">✗ 404</span>;
  }

  function categoryBadge(cat: string) {
    const colors: Record<string, string> = {
      tool: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
      calculator: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
      "ai-tool": "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    };
    return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[cat] || ""}`}>{cat}</span>;
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    return d > 0 ? `${d}d ago` : h > 0 ? `${h}h ago` : "just now";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Recently Added</h1>
          <p className="text-sm text-q-muted mt-1">Last 50 tools, calculators and AI tools published. Check live status and delete bad ones.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={checkLiveStatus} disabled={checking || loading}
            className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 transition">
            {checking ? "Checking..." : "🔍 Check Live Status"}
          </button>
          <Link href="/admin" className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm font-medium text-q-muted hover:bg-q-card transition">
            ← Dashboard
          </Link>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl border px-4 py-3 text-sm ${message.startsWith("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700"}`}>
          {message}
        </div>
      )}

      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 border-b border-q-border px-5 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-q-muted">Name / Slug</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-q-muted text-center px-4">Type</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-q-muted text-center px-4">Engine</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-q-muted text-center px-4">Status</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-q-muted text-center px-4">Actions</span>
        </div>

        {loading && <div className="p-8 text-center text-sm text-q-muted">Loading recent additions...</div>}

        <div className="divide-y divide-q-border">
          {items.map(item => {
            const url = `${SITE}/${categoryPath(item.category)}/${item.slug}`;
            return (
              <div key={item.id} className={`grid grid-cols-[1fr_auto_auto_auto_auto] gap-0 px-5 py-3 items-center hover:bg-q-bg transition ${item.liveStatus === "404" ? "bg-red-50/30 dark:bg-red-500/5" : ""}`}>
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <a href={url} target="_blank" rel="noreferrer"
                      className="truncate text-sm font-medium text-q-text hover:text-blue-600 transition">{item.name}</a>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-q-muted truncate">/{item.slug}</span>
                    <span className="text-xs text-q-muted">· {timeAgo(item.created_at)}</span>
                  </div>
                </div>
                <div className="px-4 text-center">{categoryBadge(item.category)}</div>
                <div className="px-4 text-center">
                  <span className="rounded-full bg-q-bg border border-q-border px-2 py-0.5 text-xs text-q-muted">{item.engine_type}</span>
                </div>
                <div className="px-4 text-center">{statusBadge(item.liveStatus)}</div>
                <div className="px-4 flex gap-2 justify-end">
                  <a href={url} target="_blank" rel="noreferrer"
                    className="rounded-lg border border-q-border bg-q-bg px-2.5 py-1 text-xs text-q-muted hover:text-q-text transition">View</a>
                  <button onClick={() => deleteItem(item)} disabled={deleting === item.id}
                    className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs text-red-600 hover:bg-red-100 disabled:opacity-50 transition dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                    {deleting === item.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}

          {!loading && items.length === 0 && (
            <div className="p-8 text-center text-sm text-q-muted">No items published yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}