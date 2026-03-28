"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getHistory } from "@/components/history/ToolHistoryTracker";
import type { HistoryEntry } from "@/components/history/ToolHistoryTracker";

const TABLE_CONFIG: Record<string, { icon: string; accent: string; label: string }> = {
  tools: { icon: "🔧", accent: "text-blue-500", label: "Tool" },
  calculators: { icon: "🧮", accent: "text-emerald-500", label: "Calculator" },
  ai_tools: { icon: "✨", accent: "text-violet-500", label: "AI Tool" },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function RecentlyUsedTools() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    const history = getHistory();
    setEntries(history.slice(0, 6));
  }, []);

  if (entries.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-500 mb-2">
            Pick Up Where You Left Off
          </p>
          <h2 className="text-2xl font-bold text-q-text">Recently Used</h2>
        </div>
        <button
          onClick={() => {
            try {
              localStorage.removeItem("quickfnd-history");
              setEntries([]);
            } catch {}
          }}
          className="text-xs font-medium text-q-muted hover:text-red-500 transition"
        >
          Clear history
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => {
          const config = TABLE_CONFIG[entry.table] ?? TABLE_CONFIG.tools;
          return (
            <Link
              key={`${entry.slug}-${entry.visitedAt}`}
              href={entry.href}
              className="group flex items-center gap-4 rounded-2xl border border-q-border bg-q-card p-4 transition-all hover:-translate-y-0.5 hover:border-amber-400/40 hover:shadow-sm"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-lg">
                {config.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-q-text truncate group-hover:text-amber-600 transition-colors">
                  {entry.name}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs font-medium ${config.accent}`}>
                    {config.label}
                  </span>
                  <span className="text-xs text-q-muted">
                    · {timeAgo(entry.visitedAt)}
                  </span>
                </div>
              </div>
              <span className="text-q-border group-hover:text-amber-500 transition-colors text-lg">
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}