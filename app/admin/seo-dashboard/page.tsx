"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Keyword = {
  keyword: string;
  clicks: number;
  impressions: number;
  position: number;
  ctr: number;
};

type Action = {
  type: "blog" | "faq" | "comparison" | "fix" | "index";
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  keyword?: string;
};

type CronLog = {
  job_name: string;
  status: string;
  signals_collected: number;
  gaps_identified: number;
  items_published: number;
  error_message: string | null;
  started_at: string;
  duration_ms: number;
};

type DashboardData = {
  gsc: {
    totalQueries: number;
    totalImpressions: number;
    totalClicks: number;
    avgPosition: number;
    avgCTR: number;
    topKeywords: Keyword[];
    contentGaps: Keyword[];
    risers: Keyword[];
  };
  inventory: {
    tools: number;
    calculators: number;
    aiTools: number;
    blog: number;
    comparisons: number;
    subscribers: number;
    total: number;
  };
  cronLogs: CronLog[];
  actions: Action[];
  fetchedAt: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};

const ACTION_ICONS: Record<string, string> = {
  blog: "📝", faq: "❓", comparison: "⚖️", fix: "🔧", index: "📡",
};

const STATUS_COLORS: Record<string, string> = {
  success: "text-emerald-600 dark:text-emerald-400",
  error: "text-red-600 dark:text-red-400",
  partial: "text-amber-600 dark:text-amber-400",
};

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

function positionBadge(pos: number): string {
  if (pos <= 3) return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
  if (pos <= 10) return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20";
  if (pos <= 20) return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
  return "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Tab type ─────────────────────────────────────────────────────────────────

type Tab = "overview" | "keywords" | "gaps" | "actions" | "cron";

// ── Component ────────────────────────────────────────────────────────────────

export default function AdminSEODashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [kwSort, setKwSort] = useState<"impressions" | "clicks" | "position" | "ctr">("impressions");
  const [kwFilter, setKwFilter] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seo-dashboard");
      if (!res.ok) throw new Error("Failed to load dashboard data");
      setData(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-q-border border-t-blue-500" />
          <p className="mt-4 text-sm text-q-muted">Loading SEO Intelligence...</p>
          <p className="mt-1 text-xs text-q-muted opacity-60">Fetching Google Search Console data</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
        <p className="font-semibold text-red-700 dark:text-red-400">Error loading dashboard</p>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
        <button onClick={loadData} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
          Retry
        </button>
      </div>
    );
  }

  const { gsc, inventory, cronLogs, actions } = data;

  // Filter & sort keywords
  const filteredKw = (tab === "keywords" ? gsc.topKeywords : gsc.contentGaps)
    .filter(k => !kwFilter || k.keyword.toLowerCase().includes(kwFilter.toLowerCase()))
    .sort((a, b) => {
      if (kwSort === "impressions") return b.impressions - a.impressions;
      if (kwSort === "clicks") return b.clicks - a.clicks;
      if (kwSort === "position") return a.position - b.position;
      return b.ctr - a.ctr;
    });

  const TABS: { key: Tab; label: string; badge?: number }[] = [
    { key: "overview", label: "Overview" },
    { key: "keywords", label: "Keywords", badge: gsc.totalQueries },
    { key: "gaps", label: "Content Gaps", badge: gsc.contentGaps.length },
    { key: "actions", label: "Actions", badge: actions.filter(a => a.priority === "high").length },
    { key: "cron", label: "Cron Logs", badge: cronLogs.length },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-q-text">SEO Intelligence Dashboard</h2>
          <p className="mt-1 text-sm text-q-muted">
            Last updated: {new Date(data.fetchedAt).toLocaleString()}
          </p>
        </div>
        <button
          onClick={loadData}
          className="rounded-xl border border-q-border bg-q-card px-4 py-2.5 text-sm font-medium text-q-text hover:bg-q-card-hover transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "border-q-primary bg-q-primary text-white"
                : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
            }`}
          >
            {t.label}
            {t.badge !== undefined && t.badge > 0 && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                tab === t.key ? "bg-white/20" : "bg-q-bg"
              }`}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* ── OVERVIEW TAB ──────────────────────────────────────────────────── */}
      {tab === "overview" && (
        <div className="space-y-6">

          {/* GSC Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Total Impressions (28d)", value: formatNumber(gsc.totalImpressions), sub: `${gsc.totalQueries} queries`, color: "blue" },
              { label: "Total Clicks (28d)", value: formatNumber(gsc.totalClicks), sub: `${gsc.avgCTR}% avg CTR`, color: "emerald" },
              { label: "Avg Position", value: String(gsc.avgPosition), sub: gsc.avgPosition <= 20 ? "Page 1-2 range" : "Needs improvement", color: gsc.avgPosition <= 20 ? "purple" : "amber" },
              { label: "Content Gap Keywords", value: String(gsc.contentGaps.length), sub: "Position 4-20, 30+ imp", color: "red" },
            ].map(stat => (
              <div key={stat.label} className="rounded-2xl border border-q-border bg-q-card p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-q-muted">{stat.label}</p>
                <p className={`mt-2 text-3xl font-black text-${stat.color}-500`}>{stat.value}</p>
                <p className="mt-1 text-xs text-q-muted">{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Inventory */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6">
            <h3 className="text-lg font-semibold text-q-text mb-4">Content Inventory</h3>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
              {[
                { label: "Tools", value: inventory.tools, icon: "⚙️" },
                { label: "Calculators", value: inventory.calculators, icon: "🧮" },
                { label: "AI Tools", value: inventory.aiTools, icon: "✨" },
                { label: "Blog Posts", value: inventory.blog, icon: "📝" },
                { label: "Comparisons", value: inventory.comparisons, icon: "⚖️" },
                { label: "Subscribers", value: inventory.subscribers, icon: "📧" },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-q-border bg-q-bg p-4 text-center">
                  <span className="text-2xl">{item.icon}</span>
                  <p className="mt-1 text-2xl font-black text-q-text">{item.value}</p>
                  <p className="text-xs text-q-muted">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 risers */}
          {gsc.risers.length > 0 && (
            <div className="rounded-2xl border border-q-border bg-q-card p-6">
              <h3 className="text-lg font-semibold text-q-text mb-4">🚀 Best Performing Keywords</h3>
              <div className="space-y-2">
                {gsc.risers.slice(0, 10).map(kw => (
                  <div key={kw.keyword} className="flex items-center gap-3 rounded-xl border border-q-border bg-q-bg p-3">
                    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-semibold ${positionBadge(kw.position)}`}>
                      #{Math.round(kw.position)}
                    </span>
                    <span className="flex-1 text-sm font-medium text-q-text truncate">{kw.keyword}</span>
                    <span className="text-xs text-q-muted">{kw.clicks} clicks</span>
                    <span className="text-xs text-q-muted">{kw.impressions} imp</span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{kw.ctr}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top 5 actions preview */}
          {actions.length > 0 && (
            <div className="rounded-2xl border border-q-border bg-q-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-q-text">⚡ Priority Actions</h3>
                <button onClick={() => setTab("actions")} className="text-sm font-medium text-blue-500 hover:text-blue-400 transition">
                  View all {actions.length} →
                </button>
              </div>
              <div className="space-y-3">
                {actions.slice(0, 5).map((action, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-q-border bg-q-bg p-4">
                    <span className="text-lg">{ACTION_ICONS[action.type] || "📌"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-q-text">{action.title}</span>
                        <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PRIORITY_COLORS[action.priority]}`}>
                          {action.priority}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-q-muted leading-relaxed">{action.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GSC not connected */}
          {gsc.totalQueries === 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
              <h3 className="font-semibold text-amber-700 dark:text-amber-400">No GSC Data</h3>
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-300">
                Google Search Console returned 0 queries. This is normal for a new site (under 2-4 weeks old).
                Data will populate as Google indexes more pages.
              </p>
              <p className="mt-2 text-xs text-amber-500">
                Ensure GOOGLE_SERVICE_ACCOUNT_JSON is set in Vercel env vars and the service account has access to the GSC property.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── KEYWORDS TAB ──────────────────────────────────────────────────── */}
      {tab === "keywords" && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={kwFilter}
              onChange={e => setKwFilter(e.target.value)}
              placeholder="Filter keywords..."
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition sm:w-64"
            />
            <div className="flex gap-2">
              {(["impressions", "clicks", "position", "ctr"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setKwSort(s)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    kwSort === s
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                      : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"
                  }`}
                >
                  {s === "ctr" ? "CTR" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-q-border bg-q-bg text-xs uppercase tracking-widest text-q-muted">
                    <th className="px-4 py-3 text-left font-semibold">Keyword</th>
                    <th className="px-4 py-3 text-right font-semibold">Position</th>
                    <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                    <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-4 py-3 text-right font-semibold">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKw.map(kw => (
                    <tr key={kw.keyword} className="border-b border-q-border hover:bg-q-bg/50 transition">
                      <td className="px-4 py-3 font-medium text-q-text max-w-[300px] truncate">{kw.keyword}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${positionBadge(kw.position)}`}>
                          {kw.position}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-q-muted">{formatNumber(kw.impressions)}</td>
                      <td className="px-4 py-3 text-right text-q-muted">{kw.clicks}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-semibold ${kw.ctr >= 5 ? "text-emerald-600 dark:text-emerald-400" : kw.ctr >= 2 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400"}`}>
                          {kw.ctr}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredKw.length === 0 && (
                <div className="py-12 text-center text-sm text-q-muted">
                  {gsc.totalQueries === 0 ? "No GSC data available yet." : "No keywords match your filter."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT GAPS TAB ──────────────────────────────────────────────── */}
      {tab === "gaps" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              <strong>Content gaps</strong> are keywords where you rank at position 4-20 with 30+ impressions.
              These are the easiest wins — a targeted blog post or FAQ could push them to page 1.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={kwFilter}
              onChange={e => setKwFilter(e.target.value)}
              placeholder="Filter gaps..."
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition sm:w-64"
            />
            <div className="flex gap-2">
              {(["impressions", "clicks", "position", "ctr"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setKwSort(s)}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition ${
                    kwSort === s
                      ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                      : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"
                  }`}
                >
                  {s === "ctr" ? "CTR" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-q-border bg-q-bg text-xs uppercase tracking-widest text-q-muted">
                    <th className="px-4 py-3 text-left font-semibold">Keyword</th>
                    <th className="px-4 py-3 text-right font-semibold">Position</th>
                    <th className="px-4 py-3 text-right font-semibold">Impressions</th>
                    <th className="px-4 py-3 text-right font-semibold">Clicks</th>
                    <th className="px-4 py-3 text-right font-semibold">CTR</th>
                    <th className="px-4 py-3 text-right font-semibold">Opportunity</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKw.map(kw => {
                    const opp = kw.position <= 10 ? "🔥 High" : kw.position <= 15 ? "⚡ Medium" : "💡 Low";
                    return (
                      <tr key={kw.keyword} className="border-b border-q-border hover:bg-q-bg/50 transition">
                        <td className="px-4 py-3 font-medium text-q-text max-w-[300px] truncate">{kw.keyword}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex rounded-lg border px-2 py-0.5 text-xs font-semibold ${positionBadge(kw.position)}`}>
                            {kw.position}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-q-muted">{formatNumber(kw.impressions)}</td>
                        <td className="px-4 py-3 text-right text-q-muted">{kw.clicks}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${kw.ctr >= 5 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                            {kw.ctr}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-medium">{opp}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredKw.length === 0 && (
                <div className="py-12 text-center text-sm text-q-muted">
                  {gsc.contentGaps.length === 0 ? "No content gaps found yet — keep building pages!" : "No gaps match your filter."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIONS TAB ───────────────────────────────────────────────────── */}
      {tab === "actions" && (
        <div className="space-y-4">
          {actions.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
              <p className="text-lg font-semibold text-q-text">No actions yet</p>
              <p className="mt-2 text-sm text-q-muted">Actions are generated from GSC data. As Google indexes more pages, recommendations will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {actions.map((action, i) => (
                <div key={i} className="rounded-2xl border border-q-border bg-q-card p-5">
                  <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-q-border bg-q-bg text-lg">
                      {ACTION_ICONS[action.type] || "📌"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-q-text">{action.title}</span>
                        <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${PRIORITY_COLORS[action.priority]}`}>
                          {action.priority}
                        </span>
                        <span className="rounded-lg border border-q-border bg-q-bg px-2 py-0.5 text-[10px] font-medium text-q-muted uppercase tracking-wider">
                          {action.type}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-q-muted leading-relaxed">{action.detail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CRON LOGS TAB ─────────────────────────────────────────────────── */}
      {tab === "cron" && (
        <div className="space-y-4">
          {cronLogs.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
              <p className="text-lg font-semibold text-q-text">No cron logs found</p>
              <p className="mt-2 text-sm text-q-muted">Cron jobs write to the cron_runs table. Logs will appear after the first run.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-q-border bg-q-bg text-xs uppercase tracking-widest text-q-muted">
                      <th className="px-4 py-3 text-left font-semibold">Job</th>
                      <th className="px-4 py-3 text-left font-semibold">Status</th>
                      <th className="px-4 py-3 text-right font-semibold">Signals</th>
                      <th className="px-4 py-3 text-right font-semibold">Gaps</th>
                      <th className="px-4 py-3 text-right font-semibold">Published</th>
                      <th className="px-4 py-3 text-right font-semibold">Duration</th>
                      <th className="px-4 py-3 text-right font-semibold">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronLogs.map((log, i) => (
                      <tr key={i} className="border-b border-q-border hover:bg-q-bg/50 transition">
                        <td className="px-4 py-3 font-medium text-q-text">{log.job_name}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${STATUS_COLORS[log.status] || "text-q-muted"}`}>
                            {log.status}
                          </span>
                          {log.error_message && (
                            <p className="mt-1 text-xs text-red-500 truncate max-w-[200px]" title={log.error_message}>
                              {log.error_message}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right text-q-muted">{log.signals_collected}</td>
                        <td className="px-4 py-3 text-right text-q-muted">{log.gaps_identified}</td>
                        <td className="px-4 py-3 text-right text-q-muted">{log.items_published}</td>
                        <td className="px-4 py-3 text-right text-q-muted">{log.duration_ms > 0 ? `${(log.duration_ms / 1000).toFixed(1)}s` : "—"}</td>
                        <td className="px-4 py-3 text-right text-xs text-q-muted">{log.started_at ? timeAgo(log.started_at) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
