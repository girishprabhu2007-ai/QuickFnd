"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type QueueItem = {
  id: string;
  query: string;
  suggested_name: string;
  suggested_slug: string;
  suggested_category: "tool" | "calculator" | "ai_tool";
  suggested_engine: string;
  demand_score: number;
  search_volume: number;
  gap_score: number;
  sources: string[];
  status: string;
  created_at: string;
};

type Signal = {
  query: string;
  source: string;
  volume: number;
  category: string;
  captured_at: string;
};

type CronRun = {
  id: string;
  job_name: string;
  status: string;
  signals_collected: number;
  gaps_identified: number;
  items_published: number;
  error_message: string | null;
  started_at: string;
  duration_ms: number;
};

type Stats = {
  signals_7d: number;
  queue_pending: number;
  queue_published: number;
  last_run: CronRun | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  approved: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  published: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  duplicate: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
};

const CAT_COLORS: Record<string, string> = {
  tool: "text-blue-600 dark:text-blue-400",
  calculator: "text-purple-600 dark:text-purple-400",
  ai_tool: "text-emerald-600 dark:text-emerald-400",
};

export default function AdminIntelligencePage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [cronLog, setCronLog] = useState<CronRun[]>([]);
  const [activeTab, setActiveTab] = useState<"queue" | "signals" | "cron">("queue");
  const [queueStatus, setQueueStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");

  const loadStats = useCallback(async () => {
    const res = await fetch("/api/admin/trend-signals?view=stats");
    if (res.ok) setStats(await res.json());
  }, []);

  const loadQueue = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/trend-signals?view=queue&status=${queueStatus}`);
    if (res.ok) setQueue((await res.json()).items || []);
    setLoading(false);
  }, [queueStatus]);

  const loadSignals = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/trend-signals?view=signals");
    if (res.ok) setSignals((await res.json()).items || []);
    setLoading(false);
  }, []);

  const loadCronLog = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/trend-signals?view=cron-log");
    if (res.ok) setCronLog((await res.json()).items || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
    loadQueue();
  }, [loadStats, loadQueue]);

  useEffect(() => {
    if (activeTab === "signals") loadSignals();
    if (activeTab === "cron") loadCronLog();
  }, [activeTab, loadSignals, loadCronLog]);

  async function runCronNow() {
    setRunning(true);
    setMessage("");
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET || "";
      const res = await fetch("/api/cron/intelligence", {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`✓ Collected ${data.signals_collected} signals, queued ${data.gaps_queued} gaps`);
        loadStats();
        loadQueue();
      } else {
        setMessage(`Error: ${data.error}`);
      }
    } catch {
      setMessage("Failed to trigger cron job");
    } finally {
      setRunning(false);
    }
  }

  async function updateStatus(id: string, status: string, reason?: string) {
    await fetch("/api/admin/trend-signals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, rejection_reason: reason }),
    });
    loadQueue();
    loadStats();
  }

  function scoreColor(score: number) {
    if (score >= 70) return "text-red-600 dark:text-red-400";
    if (score >= 40) return "text-amber-600 dark:text-amber-400";
    return "text-q-muted";
  }

  return (
    <div className="grid gap-6">

      {/* Header */}
      <div className="rounded-2xl border border-q-border bg-q-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-q-text">Intelligence Pipeline</h2>
            <p className="mt-1 text-sm text-q-muted">
              Automated trend collection from Google Autocomplete, Search Console, and Serper.
              Runs daily at 2am IST via Vercel Cron.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={runCronNow} disabled={running}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50">
              {running ? "Running..." : "▶ Run Now"}
            </button>
            <Link href="/admin" className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm font-medium text-q-muted hover:bg-q-card-hover transition">
              ← Dashboard
            </Link>
          </div>
        </div>
        {message && (
          <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${message.startsWith("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700"}`}>
            {message}
          </div>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { label: "Signals (7 days)", value: stats.signals_7d, color: "blue" },
            { label: "Pending in queue", value: stats.queue_pending, color: "amber" },
            { label: "Published", value: stats.queue_published, color: "green" },
            {
              label: "Last run",
              value: stats.last_run
                ? new Date(stats.last_run.started_at).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
                : "Never",
              color: stats.last_run?.status === "success" ? "green" : "default",
            },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-5 ${
              stat.color === "blue" ? "border-blue-200/60 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5" :
              stat.color === "amber" ? "border-amber-200/60 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5" :
              stat.color === "green" ? "border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5" :
              "border-q-border bg-q-card"
            }`}>
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">{stat.label}</div>
              <div className={`mt-2 text-2xl font-bold ${
                stat.color === "blue" ? "text-blue-700 dark:text-blue-400" :
                stat.color === "amber" ? "text-amber-700 dark:text-amber-400" :
                stat.color === "green" ? "text-emerald-700 dark:text-emerald-400" :
                "text-q-text"
              }`}>{stat.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-q-border">
        {([
          { key: "queue", label: "📋 Demand Queue" },
          { key: "signals", label: "📡 Raw Signals" },
          { key: "cron", label: "🕐 Cron Log" },
        ] as const).map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`rounded-t-xl px-5 py-2.5 text-sm font-medium transition ${activeTab === tab.key ? "border border-b-0 border-q-border bg-q-card text-q-text" : "text-q-muted hover:text-q-text"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Queue tab */}
      {activeTab === "queue" && (
        <div className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {["pending", "approved", "published", "rejected", "duplicate"].map(s => (
              <button key={s} onClick={() => setQueueStatus(s)}
                className={`rounded-xl border px-4 py-2 text-sm font-medium capitalize transition ${queueStatus === s ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"}`}>
                {s}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-q-muted">Loading...</div>
          ) : queue.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-sm text-q-muted">
              No items with status "{queueStatus}". Run the cron job to collect signals first.
            </div>
          ) : (
            <div className="grid gap-3">
              {queue.map(item => (
                <div key={item.id} className="rounded-2xl border border-q-border bg-q-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-q-text">{item.suggested_name}</span>
                        <span className={`text-xs font-medium ${CAT_COLORS[item.suggested_category] || "text-q-muted"}`}>
                          {item.suggested_category}
                        </span>
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${STATUS_COLORS[item.status] || ""}`}>
                          {item.status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-q-muted font-mono">/{item.suggested_slug}</div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-q-muted">
                        <span>Engine: <span className="font-mono text-q-text">{item.suggested_engine}</span></span>
                        <span>Score: <span className={`font-bold ${scoreColor(item.demand_score)}`}>{item.demand_score}/100</span></span>
                        <span>Volume: {item.search_volume}</span>
                        <span>Sources: {item.sources.join(", ")}</span>
                        <span>Query: "{item.query}"</span>
                      </div>
                    </div>

                    {item.status === "pending" && (
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => updateStatus(item.id, "approved")}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500 transition">
                          Approve
                        </button>
                        <button
                          onClick={() => updateStatus(item.id, "rejected", "Not relevant")}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400">
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Signals tab */}
      {activeTab === "signals" && (
        <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-q-muted">Loading...</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-q-border text-left">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-q-muted">Query</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-q-muted">Source</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-q-muted">Volume</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-q-muted">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-widest text-q-muted">Captured</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-q-border">
                {signals.map((s, i) => (
                  <tr key={i} className="hover:bg-q-bg transition">
                    <td className="px-5 py-3 font-medium text-q-text">{s.query}</td>
                    <td className="px-5 py-3">
                      <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-0.5 text-xs text-q-muted">{s.source}</span>
                    </td>
                    <td className="px-5 py-3 text-q-muted">{s.volume || "—"}</td>
                    <td className="px-5 py-3 text-q-muted">{s.category}</td>
                    <td className="px-5 py-3 text-q-muted">
                      {new Date(s.captured_at).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
                {signals.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-q-muted">No signals yet. Run the cron job first.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Cron log tab */}
      {activeTab === "cron" && (
        <div className="grid gap-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-q-muted">Loading...</div>
          ) : cronLog.length === 0 ? (
            <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-sm text-q-muted">
              No cron runs yet. Click "Run Now" to test the pipeline.
            </div>
          ) : (
            cronLog.map(run => (
              <div key={run.id} className="rounded-2xl border border-q-border bg-q-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                      run.status === "success" ? STATUS_COLORS.published :
                      run.status === "failed" ? STATUS_COLORS.rejected :
                      run.status === "partial" ? STATUS_COLORS.pending :
                      STATUS_COLORS.approved
                    }`}>{run.status}</span>
                    <span className="text-sm font-medium text-q-text">{run.job_name}</span>
                  </div>
                  <span className="text-xs text-q-muted">
                    {new Date(run.started_at).toLocaleString("en-IN")}
                    {run.duration_ms && ` · ${(run.duration_ms / 1000).toFixed(1)}s`}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs text-q-muted">
                  <span>Signals: <strong className="text-q-text">{run.signals_collected}</strong></span>
                  <span>Gaps: <strong className="text-q-text">{run.gaps_identified}</strong></span>
                  <span>Published: <strong className="text-q-text">{run.items_published}</strong></span>
                </div>
                {run.error_message && (
                  <div className="mt-3 rounded-lg border border-red-200/60 bg-red-50/40 p-3 text-xs text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400">
                    {run.error_message}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Setup instructions */}
      <div className="rounded-2xl border border-q-border bg-q-card p-6">
        <h3 className="font-semibold text-q-text mb-3">Setup Checklist</h3>
        <div className="space-y-2 text-sm text-q-muted">
          {[
            { label: "CRON_SECRET env var set in Vercel", key: "cron_secret" },
            { label: "vercel.json cron schedule configured (see below)", key: "vercel_json" },
            { label: "Supabase intelligence tables created (run SQL)", key: "supabase" },
            { label: "SERPER_API_KEY set in Vercel (optional, ~$3/month for 10k searches)", key: "serper" },
          ].map(item => (
            <div key={item.key} className="flex items-center gap-2">
              <span className="text-q-muted">○</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-q-bg border border-q-border p-4 font-mono text-xs text-q-muted">
          <div className="text-q-text mb-1">vercel.json — add this to your project root:</div>
          {`{
  "crons": [
    { "path": "/api/cron/intelligence", "schedule": "30 20 * * *" }
  ]
}`}
        </div>
        <p className="mt-3 text-xs text-q-muted">
          "0 2 * * *" = 2:00 AM UTC daily. Vercel Pro includes 40 cron invocations/day free.
        </p>
      </div>

    </div>
  );
}