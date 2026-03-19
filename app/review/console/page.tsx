"use client";

import { useEffect, useMemo, useState } from "react";

type ReviewRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
};

type ReviewSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  genericDirectory: number;
  recentItems: ReviewRow[];
  missingItems: ReviewRow[];
};

type DiagnosticsPayload = {
  generatedAt: string;
  tools: ReviewSection;
  calculators: ReviewSection;
  aiTools: ReviewSection;
};

type RecentPayload = {
  tools: ReviewRow[];
  calculators: ReviewRow[];
  aiTools: ReviewRow[];
};

type FallbackPayload = {
  generatedAt: string;
  toolsMissingRuntime: ReviewRow[];
  calculatorsMissingRuntime: ReviewRow[];
  aiToolsMissingRuntime: ReviewRow[];
  formulaCalculatorCandidates: ReviewRow[];
};

type RepairPreviewItem = {
  table: "tools" | "calculators" | "ai_tools";
  id: number;
  name: string;
  slug: string;
  current_engine_type: string | null;
  suggested_engine_type: string | null;
  fixable: boolean;
  suggested_engine_config: Record<string, unknown>;
};

type RepairPreviewPayload = {
  generatedAt: string;
  items: RepairPreviewItem[];
  summary: {
    total: number;
    fixable: number;
    notFixable: number;
  };
};

type EnginePreviewPayload = {
  generatedAt: string;
  input: {
    category: "tool" | "calculator" | "ai-tool";
    name: string;
    slug: string;
    description: string;
  };
  suggestion: {
    engine_type: string | null;
    engine_config: Record<string, unknown>;
    reason: string;
    is_supported: boolean;
  };
};

type BulkPreviewPayload = {
  generatedAt: string;
  input: {
    topic: string;
    type: "tools" | "calculators" | "ai_tools";
  };
  count: number;
  items: Array<{
    name: string;
    slug: string;
    description: string;
    related_slugs: string[];
    engine_type: string;
    engine_config: Record<string, unknown>;
  }>;
};

function Card({
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

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none placeholder:text-q-muted";
}

function Stat({
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

function useReviewKey() {
  return useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("key") || "";
  }, []);
}

async function fetchJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error || "Request failed.");
  }

  return payload;
}

export default function ReviewConsolePage() {
  const key = useReviewKey();

  const [diagnostics, setDiagnostics] = useState<DiagnosticsPayload | null>(null);
  const [recent, setRecent] = useState<RecentPayload | null>(null);
  const [fallback, setFallback] = useState<FallbackPayload | null>(null);
  const [repairPreview, setRepairPreview] = useState<RepairPreviewPayload | null>(null);

  const [engineCategory, setEngineCategory] = useState<"tool" | "calculator" | "ai-tool">("tool");
  const [engineName, setEngineName] = useState("");
  const [engineSlug, setEngineSlug] = useState("");
  const [engineDescription, setEngineDescription] = useState("");
  const [enginePreview, setEnginePreview] = useState<EnginePreviewPayload | null>(null);

  const [bulkTopic, setBulkTopic] = useState("");
  const [bulkType, setBulkType] = useState<"tools" | "calculators" | "ai_tools">("tools");
  const [bulkPreview, setBulkPreview] = useState<BulkPreviewPayload | null>(null);

  const [loading, setLoading] = useState(true);
  const [engineLoading, setEngineLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadAll() {
    setLoading(true);
    setError("");

    try {
      const [diagnosticsRes, recentRes, fallbackRes, repairPreviewRes] = await Promise.all([
        fetchJson(`/api/review/diagnostics?key=${encodeURIComponent(key)}`),
        fetchJson(`/api/review/recent-items?key=${encodeURIComponent(key)}`),
        fetchJson(`/api/review/fallback-audit?key=${encodeURIComponent(key)}`),
        fetchJson(`/api/review/repair-preview?key=${encodeURIComponent(key)}`),
      ]);

      setDiagnostics(diagnosticsRes.data || null);
      setRecent(recentRes.data || null);
      setFallback(fallbackRes.data || null);
      setRepairPreview(repairPreviewRes.data || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load review console.");
      setDiagnostics(null);
      setRecent(null);
      setFallback(null);
      setRepairPreview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!key) {
      setLoading(false);
      setError("Missing review key in URL.");
      return;
    }

    loadAll();
  }, [key]);

  async function runEnginePreview() {
    setEngineLoading(true);

    try {
      const response = await fetch(`/api/review/engine-preview?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          category: engineCategory,
          name: engineName,
          slug: engineSlug,
          description: engineDescription,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to preview engine.");
      }

      setEnginePreview(payload.data || null);
    } catch (err) {
      setEnginePreview(null);
      setError(err instanceof Error ? err.message : "Failed to preview engine.");
    } finally {
      setEngineLoading(false);
    }
  }

  async function runBulkPreview() {
    setBulkLoading(true);

    try {
      const response = await fetch(`/api/review/bulk-preview?key=${encodeURIComponent(key)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: bulkTopic,
          type: bulkType,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to preview bulk generation.");
      }

      setBulkPreview(payload.data || null);
    } catch (err) {
      setBulkPreview(null);
      setError(err instanceof Error ? err.message : "Failed to preview bulk generation.");
    } finally {
      setBulkLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-q-border bg-q-card p-6">
          <h1 className="text-3xl font-bold text-q-text">Review Console</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-q-muted">
            Temporary read-only + dry-run surface for deep system inspection without relying on the real admin session.
          </p>
        </header>

        {error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={loadAll}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh Review Data
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-sm text-q-muted">
            Loading review console...
          </div>
        ) : (
          <>
            {diagnostics ? (
              <div className="grid gap-8 xl:grid-cols-3">
                <Card title="Tools">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    <Stat label="Total" value={diagnostics.tools.total} />
                    <Stat label="With Engine" value={diagnostics.tools.withEngine} />
                    <Stat label="Missing Engine" value={diagnostics.tools.missingEngine} />
                    <Stat label="Generic Directory" value={diagnostics.tools.genericDirectory} />
                  </div>
                </Card>

                <Card title="Calculators">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    <Stat label="Total" value={diagnostics.calculators.total} />
                    <Stat label="With Engine" value={diagnostics.calculators.withEngine} />
                    <Stat label="Missing Engine" value={diagnostics.calculators.missingEngine} />
                    <Stat label="Generic Directory" value={diagnostics.calculators.genericDirectory} />
                  </div>
                </Card>

                <Card title="AI Tools">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                    <Stat label="Total" value={diagnostics.aiTools.total} />
                    <Stat label="With Engine" value={diagnostics.aiTools.withEngine} />
                    <Stat label="Missing Engine" value={diagnostics.aiTools.missingEngine} />
                    <Stat label="Generic Directory" value={diagnostics.aiTools.genericDirectory} />
                  </div>
                </Card>
              </div>
            ) : null}

            <div className="grid gap-8 xl:grid-cols-2">
              <Card title="Fallback Audit">
                {fallback ? (
                  <div className="space-y-5">
                    <div>
                      <div className="mb-2 text-sm font-medium text-q-text">
                        Tools missing runtime
                      </div>
                      <div className="grid gap-2">
                        {fallback.toolsMissingRuntime.slice(0, 10).map((item) => (
                          <div
                            key={`tool-missing-${item.id}`}
                            className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                          >
                            {item.slug}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-sm font-medium text-q-text">
                        Calculators missing runtime
                      </div>
                      <div className="grid gap-2">
                        {fallback.calculatorsMissingRuntime.slice(0, 10).map((item) => (
                          <div
                            key={`calc-missing-${item.id}`}
                            className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                          >
                            {item.slug}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 text-sm font-medium text-q-text">
                        Formula calculator candidates
                      </div>
                      <div className="grid gap-2">
                        {fallback.formulaCalculatorCandidates.slice(0, 10).map((item) => (
                          <div
                            key={`formula-candidate-${item.id}`}
                            className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                          >
                            {item.slug}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>

              <Card title="Repair Dry-Run">
                {repairPreview ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <Stat label="Total Missing" value={repairPreview.summary.total} />
                      <Stat label="Fixable" value={repairPreview.summary.fixable} />
                      <Stat label="Not Fixable" value={repairPreview.summary.notFixable} />
                    </div>

                    <div className="grid gap-3">
                      {repairPreview.items.slice(0, 20).map((item) => (
                        <div
                          key={`repair-${item.table}-${item.id}`}
                          className="rounded-xl border border-q-border bg-q-bg p-4"
                        >
                          <div className="font-medium text-q-text">{item.name}</div>
                          <div className="mt-1 text-sm text-q-muted">
                            {item.table} / {item.slug}
                          </div>
                          <div className="mt-2 text-sm text-q-text">
                            Suggested engine: {item.suggested_engine_type || "None"}
                          </div>
                          <div className="mt-1 text-sm text-q-muted">
                            Fixable: {item.fixable ? "Yes" : "No"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              <Card title="Engine Assignment Preview">
                <div className="space-y-4">
                  <select
                    value={engineCategory}
                    onChange={(e) =>
                      setEngineCategory(e.target.value as "tool" | "calculator" | "ai-tool")
                    }
                    className={inputClass()}
                  >
                    <option value="tool">Tool</option>
                    <option value="calculator">Calculator</option>
                    <option value="ai-tool">AI Tool</option>
                  </select>

                  <input
                    value={engineName}
                    onChange={(e) => setEngineName(e.target.value)}
                    placeholder="Name"
                    className={inputClass()}
                  />

                  <input
                    value={engineSlug}
                    onChange={(e) => setEngineSlug(e.target.value)}
                    placeholder="Slug"
                    className={inputClass()}
                  />

                  <textarea
                    value={engineDescription}
                    onChange={(e) => setEngineDescription(e.target.value)}
                    placeholder="Description"
                    rows={4}
                    className={inputClass()}
                  />

                  <button
                    onClick={runEnginePreview}
                    disabled={engineLoading}
                    className="rounded-xl bg-q-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
                  >
                    {engineLoading ? "Previewing..." : "Preview Engine Assignment"}
                  </button>

                  {enginePreview ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-4">
                      <div className="text-sm text-q-muted">Suggested engine</div>
                      <div className="mt-2 text-lg font-semibold text-q-text">
                        {enginePreview.suggestion.engine_type || "None"}
                      </div>
                      <div className="mt-2 text-sm text-q-muted">
                        {enginePreview.suggestion.reason}
                      </div>
                      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-q-muted">
                        {JSON.stringify(enginePreview.suggestion.engine_config || {}, null, 2)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </Card>

              <Card title="Bulk Generation Preview">
                <div className="space-y-4">
                  <select
                    value={bulkType}
                    onChange={(e) =>
                      setBulkType(e.target.value as "tools" | "calculators" | "ai_tools")
                    }
                    className={inputClass()}
                  >
                    <option value="tools">Tools</option>
                    <option value="calculators">Calculators</option>
                    <option value="ai_tools">AI Tools</option>
                  </select>

                  <input
                    value={bulkTopic}
                    onChange={(e) => setBulkTopic(e.target.value)}
                    placeholder="Topic"
                    className={inputClass()}
                  />

                  <button
                    onClick={runBulkPreview}
                    disabled={bulkLoading || !bulkTopic.trim()}
                    className="rounded-xl bg-q-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-q-primary-hover disabled:opacity-60"
                  >
                    {bulkLoading ? "Generating..." : "Preview Bulk Generation"}
                  </button>

                  {bulkPreview ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-q-border bg-q-bg p-4">
                        <div className="text-sm text-q-muted">Generated count</div>
                        <div className="mt-2 text-2xl font-semibold text-q-text">
                          {bulkPreview.count}
                        </div>
                      </div>

                      {bulkPreview.items.map((item) => (
                        <div
                          key={`bulk-item-${item.slug}`}
                          className="rounded-xl border border-q-border bg-q-bg p-4"
                        >
                          <div className="font-medium text-q-text">{item.name}</div>
                          <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                          <div className="mt-2 text-sm text-q-text">
                            Engine: {item.engine_type}
                          </div>
                          <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-q-muted">
                            {JSON.stringify(item.engine_config || {}, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </Card>
            </div>

            {recent ? (
              <div className="grid gap-8 xl:grid-cols-3">
                <Card title="Recent Tools">
                  <div className="grid gap-2">
                    {recent.tools.map((item) => (
                      <div
                        key={`recent-tool-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.slug}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent Calculators">
                  <div className="grid gap-2">
                    {recent.calculators.map((item) => (
                      <div
                        key={`recent-calculator-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.slug}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Recent AI Tools">
                  <div className="grid gap-2">
                    {recent.aiTools.map((item) => (
                      <div
                        key={`recent-ai-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.slug}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}