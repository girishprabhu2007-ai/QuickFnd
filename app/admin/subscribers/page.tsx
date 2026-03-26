"use client";

import { useState, useEffect, useCallback } from "react";
import AdminTabs from "@/components/admin/AdminTabs";

type Subscriber = {
  id: number;
  email: string;
  source: string;
  status: "active" | "unsubscribed";
  subscribed_at: string;
  resubscribed_at: string | null;
};

type Stats = {
  total: number;
  active: number;
  unsubscribed: number;
  sources: { source: string; count: number }[];
  growth: { month: string; label: string; count: number }[];
};

type ListResponse = {
  subscribers: Subscriber[];
  total: number;
  page: number;
  totalPages: number;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function StatBox({ label, value, sub, color = "default" }: {
  label: string; value: number | string; sub?: string;
  color?: "default" | "green" | "red" | "blue";
}) {
  const ring = {
    default: "border-q-border",
    green: "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5",
    red: "border-red-200/60 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/5",
    blue: "border-blue-200/60 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5",
  };
  const txt = {
    default: "text-q-text",
    green: "text-emerald-700 dark:text-emerald-400",
    red: "text-red-700 dark:text-red-400",
    blue: "text-blue-700 dark:text-blue-400",
  };
  return (
    <div className={`rounded-2xl border p-5 bg-q-card ${ring[color]}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold tracking-tight ${txt[color]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-q-muted">{sub}</div>}
    </div>
  );
}

export default function SubscribersPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [list, setList] = useState<ListResponse | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState("");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/subscribers?action=stats");
    if (res.ok) setStats(await res.json() as Stats);
  }, []);

  const loadList = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({
      action: "list",
      page: String(page),
      per_page: "50",
      status: statusFilter,
      search,
    });
    const res = await fetch(`/api/admin/subscribers?${params}`);
    if (res.ok) setList(await res.json() as ListResponse);
    setLoading(false);
  }, [page, statusFilter, search]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadList(); }, [loadList]);

  async function handleDelete(id: number, email: string) {
    if (!confirm(`Permanently delete ${email}?`)) return;
    setDeleting(id);
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    if (res.ok) {
      showToast("Deleted.");
      loadList();
      loadStats();
    }
    setDeleting(null);
  }

  async function handleUnsubscribe(email: string) {
    if (!confirm(`Mark ${email} as unsubscribed?`)) return;
    const res = await fetch("/api/admin/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "unsubscribe", email }),
    });
    if (res.ok) {
      showToast("Marked as unsubscribed.");
      loadList();
      loadStats();
    }
  }

  async function handleExport() {
    setExporting(true);
    const res = await fetch("/api/admin/subscribers?action=export");
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `quickfnd-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("CSV downloaded.");
    }
    setExporting(false);
  }

  const maxGrowth = Math.max(...(stats?.growth.map((g) => g.count) ?? [1]), 1);

  return (
    <div className="min-h-screen bg-q-bg text-q-text">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-q-text">Subscribers</h1>
            <p className="mt-1 text-sm text-q-muted">Manage your email list</p>
          </div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-60"
          >
            {exporting ? "Exporting..." : "⬇ Export CSV"}
          </button>
        </div>

        <AdminTabs />

        {/* Toast */}
        {toast && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
            ✓ {toast}
          </div>
        )}

        {/* Stats cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatBox label="Total" value={stats.total} sub="all time" color="blue" />
            <StatBox label="Active" value={stats.active} sub="subscribed" color="green" />
            <StatBox label="Unsubscribed" value={stats.unsubscribed} sub="opted out" color="red" />
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[1fr_280px]">
          <div className="space-y-6">

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
                placeholder="Search by email..."
                className="flex-1 min-w-[180px] rounded-xl border border-q-border bg-q-card px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
              />
              <button
                onClick={() => { setSearch(searchInput); setPage(1); }}
                className="rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white hover:bg-q-primary-hover transition"
              >
                Search
              </button>
              {["all", "active", "unsubscribed"].map((s) => (
                <button
                  key={s}
                  onClick={() => { setStatusFilter(s); setPage(1); }}
                  className={`rounded-xl border px-4 py-2 text-sm font-medium transition capitalize ${
                    statusFilter === s
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                      : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-q-muted text-sm">Loading...</div>
              ) : !list || list.subscribers.length === 0 ? (
                <div className="p-12 text-center text-q-muted text-sm">
                  {search ? "No subscribers match your search." : "No subscribers yet."}
                </div>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-q-border bg-q-bg">
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-q-muted">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-q-muted hidden sm:table-cell">Source</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-q-muted hidden md:table-cell">Subscribed</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-q-muted">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-q-muted">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-q-border">
                      {list.subscribers.map((sub) => (
                        <tr key={sub.id} className="hover:bg-q-bg transition">
                          <td className="px-4 py-3 font-mono text-xs text-q-text break-all">{sub.email}</td>
                          <td className="px-4 py-3 text-q-muted text-xs hidden sm:table-cell">{sub.source || "—"}</td>
                          <td className="px-4 py-3 text-q-muted text-xs hidden md:table-cell">{fmtDate(sub.subscribed_at)}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              sub.status === "active"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                                : "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400"
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {sub.status === "active" && (
                                <button
                                  onClick={() => handleUnsubscribe(sub.email)}
                                  className="text-xs text-q-muted hover:text-amber-600 transition"
                                  title="Mark unsubscribed"
                                >
                                  Unsub
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(sub.id, sub.email)}
                                disabled={deleting === sub.id}
                                className="text-xs text-q-muted hover:text-red-600 transition disabled:opacity-40"
                                title="Delete permanently"
                              >
                                {deleting === sub.id ? "..." : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  {list.totalPages > 1 && (
                    <div className="flex items-center justify-between gap-3 border-t border-q-border px-4 py-3">
                      <span className="text-xs text-q-muted">
                        {list.total} total · page {list.page} of {list.totalPages}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page <= 1}
                          className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-text disabled:opacity-40 hover:bg-q-card transition"
                        >
                          ← Prev
                        </button>
                        <button
                          onClick={() => setPage((p) => Math.min(list.totalPages, p + 1))}
                          disabled={page >= list.totalPages}
                          className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-text disabled:opacity-40 hover:bg-q-card transition"
                        >
                          Next →
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right panel: Source breakdown + Growth chart */}
          <div className="space-y-6">
            {stats && stats.sources.length > 0 && (
              <div className="rounded-2xl border border-q-border bg-q-card p-5">
                <h2 className="text-sm font-semibold text-q-text mb-4">Signup sources</h2>
                <div className="space-y-3">
                  {stats.sources.map(({ source, count }) => {
                    const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                    return (
                      <div key={source}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-q-muted capitalize">{source.replace(/-/g, " ")}</span>
                          <span className="font-semibold text-q-text">{count} <span className="text-q-muted font-normal">({pct}%)</span></span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-q-border overflow-hidden">
                          <div className="h-full rounded-full bg-blue-500 transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {stats && (
              <div className="rounded-2xl border border-q-border bg-q-card p-5">
                <h2 className="text-sm font-semibold text-q-text mb-4">Growth — last 6 months</h2>
                <div className="flex items-end gap-2 h-24">
                  {stats.growth.map((g) => {
                    const heightPct = maxGrowth > 0 ? (g.count / maxGrowth) * 100 : 0;
                    return (
                      <div key={g.month} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-xs font-semibold text-q-text">{g.count > 0 ? g.count : ""}</span>
                        <div className="w-full rounded-t-md bg-blue-500/20 relative" style={{ height: "60px" }}>
                          <div
                            className="absolute bottom-0 w-full rounded-t-md bg-blue-500 transition-all duration-700"
                            style={{ height: `${Math.max(heightPct, g.count > 0 ? 8 : 0)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-q-muted">{g.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3 text-sm text-q-muted">
              <div className="font-semibold text-q-text text-xs uppercase tracking-wider">Quick tips</div>
              <p>📧 Add <strong className="text-q-text">RESEND_API_KEY</strong> to Vercel env vars to activate welcome emails.</p>
              <p>📤 Export CSV to import into Mailchimp, ConvertKit, or any email platform.</p>
              <p>🔔 Email capture shows on all tool detail page sidebars automatically.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}