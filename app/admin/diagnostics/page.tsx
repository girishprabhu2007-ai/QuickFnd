"use client";

import { useEffect, useState } from "react";

type Item = {
  id: number;
  name: string;
  slug: string;
  engine_type: string | null;
};

type Stats = {
  total: number;
  working: number;
  missing: number;
  missingItems: Item[];
};

function analyze(items: Item[]): Stats {
  const total = items.length;

  const missingItems = items.filter(
    (i) => !i.engine_type || i.engine_type === ""
  );

  return {
    total,
    working: total - missingItems.length,
    missing: missingItems.length,
    missingItems: missingItems.slice(0, 10),
  };
}

export default function DiagnosticsPage() {
  const [tools, setTools] = useState<Item[]>([]);
  const [calculators, setCalculators] = useState<Item[]>([]);
  const [aiTools, setAiTools] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState("");

  async function loadData() {
    setLoading(true);

    const res = await fetch("/api/admin/diagnostics");
    const data = await res.json();

    setTools(data.tools || []);
    setCalculators(data.calculators || []);
    setAiTools(data.aiTools || []);

    setLoading(false);
  }

  async function fixEngines() {
    setFixing(true);
    setResult("");

    const res = await fetch("/api/admin/fix-engines", {
      method: "POST",
    });

    const data = await res.json();

    if (data.success) {
      setResult(`✅ Fixed ${data.fixed} items`);
      await loadData(); // refresh stats
    } else {
      setResult("❌ Failed to fix engines");
    }

    setFixing(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const toolStats = analyze(tools);
  const calcStats = analyze(calculators);
  const aiStats = analyze(aiTools);

  function Section(title: string, stats: Stats) {
    return (
      <div className="rounded-xl border border-q-border bg-q-card p-5">
        <h2 className="text-lg font-semibold text-q-text">{title}</h2>

        <div className="mt-3 text-sm text-q-muted">
          Total: {stats.total} <br />
          Working: {stats.working} <br />
          Missing Engine: {stats.missing}
        </div>

        {stats.missingItems.length > 0 && (
          <div className="mt-4">
            <div className="text-sm font-medium text-q-text">
              Examples (broken):
            </div>

            <ul className="mt-2 space-y-1 text-xs text-q-muted">
              {stats.missingItems.map((item) => (
                <li key={item.id}>
                  {item.slug} → NO ENGINE
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-q-text">
        System Diagnostics
      </h1>

      {/* FIX BUTTON */}
      <div className="flex items-center gap-4">
        <button
          onClick={fixEngines}
          disabled={fixing}
          className="rounded-xl bg-green-600 px-5 py-2 text-white"
        >
          {fixing ? "Fixing..." : "Fix Missing Engines"}
        </button>

        {result && (
          <div className="text-sm text-q-text">{result}</div>
        )}
      </div>

      {loading ? (
        <div className="text-sm text-q-muted">Loading...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {Section("Tools", toolStats)}
          {Section("Calculators", calcStats)}
          {Section("AI Tools", aiStats)}
        </div>
      )}
    </div>
  );
}