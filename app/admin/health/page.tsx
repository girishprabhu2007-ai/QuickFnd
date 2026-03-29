"use client";

import { useState, useEffect, useCallback } from "react";

type ServiceCheck = {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  message: string;
  latency_ms?: number;
  details?: Record<string, unknown>;
};

type HealthData = {
  overall: "healthy" | "degraded" | "critical";
  summary: { total: number; healthy: number; degraded: number; down: number };
  checks: ServiceCheck[];
  checked_at: string;
  total_latency_ms: number;
};

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  healthy:  { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20", icon: "●", label: "Healthy" },
  degraded: { color: "text-amber-700 dark:text-amber-400",    bg: "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20",       icon: "◐", label: "Degraded" },
  down:     { color: "text-red-700 dark:text-red-400",         bg: "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20",               icon: "○", label: "Down" },
  unknown:  { color: "text-gray-600 dark:text-gray-400",       bg: "bg-gray-50 border-gray-200 dark:bg-gray-500/10 dark:border-gray-500/20",           icon: "?", label: "Unknown" },
  critical: { color: "text-red-700 dark:text-red-400",         bg: "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20",               icon: "✕", label: "Critical" },
};

export default function HealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedCheck, setExpandedCheck] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/health");
      if (!res.ok) throw new Error("Failed to load health data");
      setData(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  // Auto-refresh every 60s
  useEffect(() => { const i = setInterval(load, 60000); return () => clearInterval(i); }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-q-border border-t-blue-500" />
          <p className="mt-4 text-sm text-q-muted">Running health checks...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-500/20 dark:bg-red-500/10">
        <p className="font-semibold text-red-700 dark:text-red-400">Health check failed</p>
        <p className="mt-1 text-sm text-red-600">{error}</p>
        <button onClick={load} className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">Retry</button>
      </div>
    );
  }

  if (!data) return null;

  const overallCfg = STATUS_CONFIG[data.overall] || STATUS_CONFIG.unknown;

  return (
    <div className="space-y-6">

      {/* Overall status banner */}
      <div className={`rounded-2xl border p-6 ${overallCfg.bg}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-3xl ${overallCfg.color}`}>{overallCfg.icon}</span>
            <div>
              <h2 className={`text-xl font-bold ${overallCfg.color}`}>System {overallCfg.label}</h2>
              <p className="text-sm text-q-muted mt-1">
                {data.summary.healthy}/{data.summary.total} services healthy
                {data.summary.degraded > 0 && ` · ${data.summary.degraded} degraded`}
                {data.summary.down > 0 && ` · ${data.summary.down} down`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-q-muted">
              Checked {new Date(data.checked_at).toLocaleTimeString()} · {data.total_latency_ms}ms
            </span>
            <button onClick={load} disabled={loading}
              className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-50">
              {loading ? "Checking..." : "↻ Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Service checks */}
      <div className="space-y-3">
        {data.checks.map(check => {
          const cfg = STATUS_CONFIG[check.status] || STATUS_CONFIG.unknown;
          const isExpanded = expandedCheck === check.name;

          return (
            <div key={check.name} className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
              <button
                onClick={() => setExpandedCheck(isExpanded ? null : check.name)}
                className="flex w-full items-center justify-between p-5 text-left hover:bg-q-bg/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-lg ${cfg.color}`}>{cfg.icon}</span>
                  <div>
                    <p className="font-semibold text-q-text">{check.name}</p>
                    <p className="text-sm text-q-muted mt-0.5">{check.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {check.latency_ms !== undefined && (
                    <span className="text-xs text-q-muted">{check.latency_ms}ms</span>
                  )}
                  <span className={`rounded-lg border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                    {cfg.label}
                  </span>
                  <span className="text-q-muted text-sm">{isExpanded ? "▲" : "▼"}</span>
                </div>
              </button>

              {isExpanded && check.details && (
                <div className="border-t border-q-border bg-q-bg p-5">
                  <pre className="text-xs text-q-muted whitespace-pre-wrap font-mono leading-relaxed overflow-x-auto">
                    {JSON.stringify(check.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Auto-refresh note */}
      <p className="text-xs text-q-muted text-center">Auto-refreshes every 60 seconds</p>
    </div>
  );
}
