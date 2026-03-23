"use client";

import { useEffect, useMemo, useState } from "react";

type BaseRow = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
};

type AuditSection = {
  total: number;
  withEngine: number;
  missingEngine: number;
  itemsWithMissingEngine: BaseRow[];
  recentItems: BaseRow[];
};

type EngineUsageRow = {
  engine_type: string;
  count: number;
};

type AuditPayload = {
  generatedAt: string;
  tools: AuditSection;
  calculators: AuditSection;
  aiTools: AuditSection;
  engineUsage: {
    tools: EngineUsageRow[];
    calculators: EngineUsageRow[];
    aiTools: EngineUsageRow[];
  };
  formulaCalculatorCandidates: BaseRow[];
  aiToolConfigs: Array<{
    slug: string;
    name: string;
    engine_type: string | null;
    engine_config: Record<string, unknown> | null;
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

function SectionOverview({
  title,
  section,
}: {
  title: string;
  section: AuditSection;
}) {
  return (
    <Card title={title}>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat label="Total" value={section.total} />
        <Stat label="With Engine" value={section.withEngine} />
        <Stat label="Missing Engine" value={section.missingEngine} />
      </div>

      {section.itemsWithMissingEngine.length > 0 ? (
        <div className="mt-6">
          <div className="mb-3 text-sm font-medium text-q-text">Missing engine examples</div>
          <div className="grid gap-3">
            {section.itemsWithMissingEngine.map((item) => (
              <div
                key={`${title}-${item.id}`}
                className="rounded-xl border border-q-border bg-q-bg p-4"
              >
                <div className="font-medium text-q-text">{item.name}</div>
                <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export default function ReviewAuditPage() {
  const [data, setData] = useState<AuditPayload | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("key") || "";
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/review/audit?key=${encodeURIComponent(key)}`, {
          cache: "no-store",
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load review audit.");
        }

        setData(payload.data || null);
      } catch (err) {
        setData(null);
        setError(err instanceof Error ? err.message : "Failed to load review audit.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [key]);

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="rounded-2xl border border-q-border bg-q-card p-6">
          <h1 className="text-3xl font-bold text-q-text">Review Audit Surface</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-q-muted">
            Temporary external audit surface for reviewing system health without weakening
            the real admin experience. This page is intended for diagnosis and correction work.
          </p>
          {data ? (
            <div className="mt-4 text-sm text-q-muted">Generated: {data.generatedAt}</div>
          ) : null}
        </header>

        {loading ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-sm text-q-muted">
            Loading review audit...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <>
            <div className="grid gap-8 xl:grid-cols-3">
              <SectionOverview title="Tools" section={data.tools} />
              <SectionOverview title="Calculators" section={data.calculators} />
              <SectionOverview title="AI Tools" section={data.aiTools} />
            </div>

            <div className="grid gap-8 xl:grid-cols-2">
              <Card title="Formula Calculator Candidates">
                {data.formulaCalculatorCandidates.length === 0 ? (
                  <div className="text-sm text-q-muted">No candidates detected.</div>
                ) : (
                  <div className="grid gap-3">
                    {data.formulaCalculatorCandidates.map((item) => (
                      <div
                        key={`formula-${item.id}`}
                        className="rounded-xl border border-q-border bg-q-bg p-4"
                      >
                        <div className="font-medium text-q-text">{item.name}</div>
                        <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="AI Tool Configs">
                <div className="grid gap-3">
                  {data.aiToolConfigs.map((item) => (
                    <div
                      key={`ai-config-${item.slug}`}
                      className="rounded-xl border border-q-border bg-q-bg p-4"
                    >
                      <div className="font-medium text-q-text">{item.name}</div>
                      <div className="mt-1 text-sm text-q-muted">/{item.slug}</div>
                      <div className="mt-2 text-sm text-q-text">
                        Engine: {item.engine_type || "None"}
                      </div>
                      <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs leading-6 text-q-muted">
                        {JSON.stringify(item.engine_config || {}, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="grid gap-8 xl:grid-cols-3">
              <Card title="Tool Engine Usage">
                <div className="space-y-3">
                  {data.engineUsage.tools.map((row) => (
                    <div
                      key={`tool-engine-${row.engine_type}`}
                      className="rounded-xl border border-q-border bg-q-bg p-4"
                    >
                      <div className="font-medium text-q-text">{row.engine_type}</div>
                      <div className="mt-1 text-sm text-q-muted">Count: {row.count}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Calculator Engine Usage">
                <div className="space-y-3">
                  {data.engineUsage.calculators.map((row) => (
                    <div
                      key={`calculator-engine-${row.engine_type}`}
                      className="rounded-xl border border-q-border bg-q-bg p-4"
                    >
                      <div className="font-medium text-q-text">{row.engine_type}</div>
                      <div className="mt-1 text-sm text-q-muted">Count: {row.count}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="AI Engine Usage">
                <div className="space-y-3">
                  {data.engineUsage.aiTools.map((row) => (
                    <div
                      key={`ai-engine-${row.engine_type}`}
                      className="rounded-xl border border-q-border bg-q-bg p-4"
                    >
                      <div className="font-medium text-q-text">{row.engine_type}</div>
                      <div className="mt-1 text-sm text-q-muted">Count: {row.count}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}