"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

type ReviewRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  is_placeholder?: boolean;
  suggested_engine?: string | null;
  fixable?: boolean;
};

type DiagnosticsSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  genericDirectory: number;
  placeholderCount: number;
  recentItems: ReviewRow[];
  missingItems: ReviewRow[];
  placeholderItems: ReviewRow[];
};

type DiagnosticsPayload = {
  generatedAt: string;
  liveEngines: { tools: number; calculators: number; aiTools: number };
  tools: DiagnosticsSection;
  calculators: DiagnosticsSection;
  aiTools: DiagnosticsSection;
};

type RepairResult = {
  success: boolean;
  fixed: number;
  alreadyOk: number;
  skippedCount: number;
  summary: string;
  repaired: { table: string; slug: string; from: string | null; to: string }[];
  skipped: { table: string; slug: string; current: string | null; reason: string }[];
};

function badge(count: number, good = false) {
  if (count === 0) return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{count}</span>;
  if (good) return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{count}</span>;
  return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">{count}</span>;
}

function StatCard({ label, value, alert = false, good = false }: { label: string; value: number; alert?: boolean; good?: boolean }) {
  const border = alert && value > 0 ? "border-red-300 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/5"
    : good ? "border-blue-200/60 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5"
    : "border-q-border bg-q-bg";
  const text = alert && value > 0 ? "text-red-700 dark:text-red-400"
    : good ? "text-blue-700 dark:text-blue-400"
    : "text-q-text";
  return (
    <div className={`rounded-xl border p-4 ${border}`}>
      <div className="text-xs text-q-muted">{label}</div>
      <div className={`mt-2 text-2xl font-bold ${text}`}>{value}</div>
    </div>
  );
}

function PlaceholderTable({ items, title }: { items: ReviewRow[]; title: string }) {
  if (items.length === 0) return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
      ✓ No placeholders — all {title.toLowerCase()} have live renderers.
    </div>
  );
  return (
    <div className="overflow-x-auto rounded-xl border border-q-border">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-q-border bg-q-bg">
            <th className="px-3 py-2 text-left font-semibold text-q-muted uppercase tracking-wider">Slug</th>
            <th className="px-3 py-2 text-left font-semibold text-q-muted uppercase tracking-wider">Current Engine</th>
            <th className="px-3 py-2 text-left font-semibold text-q-muted uppercase tracking-wider">Suggested Fix</th>
            <th className="px-3 py-2 text-left font-semibold text-q-muted uppercase tracking-wider">Fixable?</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-q-border">
          {items.map((row) => (
            <tr key={row.id} className="hover:bg-q-bg transition">
              <td className="px-3 py-2 font-mono text-q-text">{row.slug}</td>
              <td className="px-3 py-2">
                <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {row.engine_type || "null"}
                </span>
              </td>
              <td className="px-3 py-2">
                {row.suggested_engine ? (
                  <span className="rounded bg-blue-50 px-1.5 py-0.5 font-mono text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                    {row.suggested_engine}
                  </span>
                ) : <span className="text-q-muted">—</span>}
              </td>
              <td className="px-3 py-2">
                {row.fixable ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 font-semibold dark:bg-emerald-500/10 dark:text-emerald-400">✓ Auto</span>
                ) : (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 font-semibold dark:bg-amber-500/10 dark:text-amber-400">Manual</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionPanel({ title, section, color }: { title: string; section: DiagnosticsSection; color: string }) {
  const [open, setOpen] = useState(false);
  const health = section.placeholderCount === 0 && section.missingEngine === 0;
  return (
    <div className={`rounded-2xl border bg-q-card overflow-hidden ${health ? "border-emerald-200/60 dark:border-emerald-500/20" : "border-red-200/60 dark:border-red-500/20"}`}>
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-q-border">
        <div className="flex items-center gap-3">
          <span className={`h-3 w-3 rounded-full ${health ? "bg-emerald-500" : "bg-red-500"}`} />
          <h2 className="font-semibold text-q-text">{title}</h2>
          {!health && <span className="text-xs text-red-600 font-medium">{section.placeholderCount + section.missingEngine} need repair</span>}
        </div>
        <button onClick={() => setOpen(!open)} className="text-xs text-blue-500 hover:text-blue-400">
          {open ? "Hide details ↑" : "Show details ↓"}
        </button>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total in DB" value={section.total} good />
          <StatCard label="Live engine" value={section.withEngine} good />
          <StatCard label="Null engine" value={section.missingEngine} alert />
          <StatCard label="Generic-dir" value={section.genericDirectory} alert />
          <StatCard label="Dead engine" value={section.placeholderCount} alert />
        </div>
        {open && (
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-semibold text-q-text">
              Placeholder items ({section.placeholderItems.length})
              <span className="ml-2 text-xs font-normal text-q-muted">— items with no live renderer</span>
            </h3>
            <PlaceholderTable items={section.placeholderItems} title={title} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [repairing, setRepairing] = useState(false);
  const [repairResult, setRepairResult] = useState<RepairResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload?.error || "Failed");
      setDiagnostics(payload.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function runRepair() {
    setRepairing(true);
    setRepairResult(null);
    try {
      const res = await fetch("/api/admin/execute-repair", { method: "POST" });
      const data = await res.json() as RepairResult;
      setRepairResult(data);
      // Refresh diagnostics after repair
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Repair failed.");
    } finally {
      setRepairing(false);
    }
  }

  const totalPlaceholders = diagnostics
    ? diagnostics.tools.placeholderCount + diagnostics.calculators.placeholderCount + diagnostics.aiTools.placeholderCount
    : 0;

  const allHealthy = totalPlaceholders === 0 &&
    (diagnostics?.tools.missingEngine ?? 1) === 0 &&
    (diagnostics?.calculators.missingEngine ?? 1) === 0 &&
    (diagnostics?.aiTools.missingEngine ?? 1) === 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Diagnostics</h1>
          <p className="mt-1 text-sm text-q-muted">
            Checks every DB item against <strong className="text-q-text">live renderer list</strong> — not just whether engine_type is set.
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-60"
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
          <button
            onClick={runRepair}
            disabled={repairing || allHealthy}
            className="rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60"
          >
            {repairing ? "Repairing..." : `⚡ Auto-Repair All${totalPlaceholders > 0 ? ` (${totalPlaceholders})` : ""}`}
          </button>
          <Link href="/admin/operations" className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
            Operations →
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Repair result */}
      {repairResult && (
        <div className={`rounded-xl border px-5 py-4 ${repairResult.fixed > 0 ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-q-border bg-q-card"}`}>
          <p className="font-semibold text-sm text-q-text">{repairResult.summary}</p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-q-muted">
            <span>✓ Fixed: <strong className="text-emerald-700">{repairResult.fixed}</strong></span>
            <span>Already OK: <strong>{repairResult.alreadyOk}</strong></span>
            <span>Needs manual: <strong className="text-amber-600">{repairResult.skippedCount}</strong></span>
          </div>
          {repairResult.repaired?.length > 0 && (
            <div className="mt-3 max-h-40 overflow-y-auto space-y-1">
              {repairResult.repaired.map((r, i) => (
                <div key={i} className="text-xs font-mono text-q-muted">
                  [{r.table}] {r.slug}: <span className="text-red-500">{r.from || "null"}</span> → <span className="text-emerald-600">{r.to}</span>
                </div>
              ))}
            </div>
          )}
          {repairResult.skipped?.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs cursor-pointer text-q-muted hover:text-q-text">
                {repairResult.skipped.length} items still need manual attention
              </summary>
              <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                {repairResult.skipped.map((r, i) => (
                  <div key={i} className="text-xs font-mono text-q-muted">
                    [{r.table}] {r.slug}: {r.reason}
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
      )}

      {/* Overall health */}
      {diagnostics && (
        <div className={`rounded-2xl border p-5 flex items-center gap-4 ${allHealthy ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-red-200 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/5"}`}>
          <span className="text-3xl">{allHealthy ? "✅" : "⚠️"}</span>
          <div>
            <div className="font-semibold text-q-text">
              {allHealthy ? "All items have live renderers" : `${totalPlaceholders} placeholder(s) detected`}
            </div>
            <div className="text-xs text-q-muted mt-0.5">
              Live engines tracked: {diagnostics.liveEngines.tools} tools · {diagnostics.liveEngines.calculators} calculators · {diagnostics.liveEngines.aiTools} AI tools
            </div>
          </div>
        </div>
      )}

      {/* Sections */}
      {loading ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center text-sm text-q-muted">
          Running diagnostics...
        </div>
      ) : diagnostics ? (
        <div className="space-y-4">
          <SectionPanel title="Tools" section={diagnostics.tools} color="blue" />
          <SectionPanel title="Calculators" section={diagnostics.calculators} color="purple" />
          <SectionPanel title="AI Tools" section={diagnostics.aiTools} color="green" />
        </div>
      ) : null}

      {diagnostics && (
        <p className="text-xs text-q-muted text-right">
          Last checked: {new Date(diagnostics.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}