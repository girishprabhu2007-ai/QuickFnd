"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ReviewRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
};

type DiagnosticsSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  genericDirectory: number;
  recentItems: ReviewRow[];
  missingItems: ReviewRow[];
};

type DiagnosticsPayload = {
  generatedAt: string;
  tools: DiagnosticsSection;
  calculators: DiagnosticsSection;
  aiTools: DiagnosticsSection;
};

type FallbackPayload = {
  generatedAt: string;
  toolsMissingRuntime: ReviewRow[];
  calculatorsMissingRuntime: ReviewRow[];
  aiToolsMissingRuntime: ReviewRow[];
  formulaCalculatorCandidates: ReviewRow[];
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-q-border bg-q-bg p-4">
      <div className="text-sm text-q-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-q-text">{value}</div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6">
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Failed request.");
  }

  return payload;
}

export default function AdminDiagnosticsPage() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [fallback, setFallback] = useState<FallbackPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [diagnosticsRes, fallbackRes] = await Promise.all([
        fetchJson("/api/admin/diagnostics"),
        fetchJson("/api/admin/fallback-audit"),
      ]);

      setDiagnostics(diagnosticsRes.data || null);
      setFallback(fallbackRes.data || null);
    } catch (err) {
      setDiagnostics(null);
      setFallback(null);
      setError(err instanceof Error ? err.message : "Failed to load diagnostics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="grid gap-8">
      <SectionCard title="Diagnostics Overview">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadData}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh Diagnostics
          </button>
          <Link
            href="/admin/operations"
            className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
          >
            Open Operations
          </Link>
        </div>
      </SectionCard>

      {loading ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-6 text-sm text-q-muted">
          Loading diagnostics...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <>
          {diagnostics ? (
            <div className="grid gap-8 xl:grid-cols-3">
              <SectionCard title="Tools">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <StatCard label="Total" value={diagnostics.tools.total} />
                  <StatCard label="With Engine" value={diagnostics.tools.withEngine} />
                  <StatCard label="Missing Engine" value={diagnostics.tools.missingEngine} />
                  <StatCard label="Generic Directory" value={diagnostics.tools.genericDirectory} />
                </div>
              </SectionCard>

              <SectionCard title="Calculators">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <StatCard label="Total" value={diagnostics.calculators.total} />
                  <StatCard label="With Engine" value={diagnostics.calculators.withEngine} />
                  <StatCard label="Missing Engine" value={diagnostics.calculators.missingEngine} />
                  <StatCard label="Generic Directory" value={diagnostics.calculators.genericDirectory} />
                </div>
              </SectionCard>

              <SectionCard title="AI Tools">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <StatCard label="Total" value={diagnostics.aiTools.total} />
                  <StatCard label="With Engine" value={diagnostics.aiTools.withEngine} />
                  <StatCard label="Missing Engine" value={diagnostics.aiTools.missingEngine} />
                  <StatCard label="Generic Directory" value={diagnostics.aiTools.genericDirectory} />
                </div>
              </SectionCard>
            </div>
          ) : null}

          {fallback ? (
            <div className="grid gap-8 xl:grid-cols-2">
              <SectionCard title="Calculators Missing Runtime">
                <div className="grid gap-3">
                  {fallback.calculatorsMissingRuntime.length === 0 ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
                      No calculator runtime gaps detected.
                    </div>
                  ) : (
                    fallback.calculatorsMissingRuntime.slice(0, 20).map((item) => (
                      <div
                        key={`calculator-gap-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-4"
                      >
                        <div className="font-medium text-q-text">{item.name}</div>
                        <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>

              <SectionCard title="Formula Calculator Candidates">
                <div className="grid gap-3">
                  {fallback.formulaCalculatorCandidates.length === 0 ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
                      No formula candidates detected.
                    </div>
                  ) : (
                    fallback.formulaCalculatorCandidates.slice(0, 20).map((item) => (
                      <div
                        key={`formula-candidate-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-4"
                      >
                        <div className="font-medium text-q-text">{item.name}</div>
                        <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                      </div>
                    ))
                  )}
                </div>
              </SectionCard>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}