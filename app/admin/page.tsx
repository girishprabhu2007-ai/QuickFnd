"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DashboardData = {
  counts: {
    tools: number;
    calculators: number;
    aiTools: number;
    total: number;
    requests: number;
    implementedRequests: number;
  };
  recent: {
    tools: { name: string; slug: string }[];
    calculators: { name: string; slug: string }[];
    aiTools: { name: string; slug: string }[];
  };
  topTools: {
    name: string;
    slug: string;
    engine_type: string;
    total: number;
    thisMonth: number;
  }[];
  monthlyUsage: {
    month: string;
    total: number;
    tools: number;
    calculators: number;
    aiTools: number;
  }[];
  enginePerformance: {
    engine_type: string;
    tool_count: number;
    total_usage: number;
    avg_usage_per_tool: number;
    top_tool_slug: string;
  }[];
  nichePerformance: {
    key: string;
    label: string;
    tool_count: number;
    total_usage: number;
  }[];
  demandGaps: {
    niche_key: string;
    label: string;
    demand_score: number;
    request_mentions: number;
    live_tool_count: number;
    recommended_engine_types: string[];
    example_ideas: string[];
  }[];
};

function SectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-semibold text-q-text">{title}</h2>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function QuickActionCard({
  href,
  title,
  description,
  accent = "default",
}: {
  href: string;
  title: string;
  description: string;
  accent?: "default" | "success" | "primary";
}) {
  const className =
    accent === "success"
      ? "block rounded-xl border border-green-300 bg-green-50 p-5 transition hover:bg-green-100"
      : accent === "primary"
        ? "block rounded-xl border border-blue-300 bg-blue-50 p-5 transition hover:bg-blue-100"
        : "block rounded-xl border border-q-border bg-q-bg p-5 transition hover:bg-q-card-hover";

  const titleClass =
    accent === "success"
      ? "text-sm font-semibold text-green-800"
      : accent === "primary"
        ? "text-sm font-semibold text-blue-800"
        : "text-sm font-semibold text-q-text";

  const descClass =
    accent === "success"
      ? "mt-1 text-xs text-green-700"
      : accent === "primary"
        ? "mt-1 text-xs text-blue-700"
        : "mt-1 text-xs text-q-muted";

  return (
    <Link href={href} className={className}>
      <div className={titleClass}>{title}</div>
      <div className={descClass}>{description}</div>
    </Link>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/performance-intelligence", {
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load dashboard.");
      }

      setData(payload);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const maxMonthlyValue = useMemo(() => {
    if (!data?.monthlyUsage?.length) return 1;
    return Math.max(...data.monthlyUsage.map((item) => item.total), 1);
  }, [data]);

  return (
    <div className="grid gap-8">
      <SectionCard
        title="Platform Overview"
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/diagnostics"
              className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-medium text-green-800 transition hover:bg-green-100"
            >
              Diagnostics
            </Link>
            <Link
              href="/admin/operations"
              className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-800 transition hover:bg-blue-100"
            >
              Operations
            </Link>
            <button
              onClick={loadData}
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
            >
              Refresh
            </button>
          </div>
        }
      >
        {loading ? (
          <div className="text-sm text-q-muted">Loading dashboard...</div>
        ) : error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">Total Pages</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{data.counts.total}</div>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">Tools</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{data.counts.tools}</div>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">Calculators</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{data.counts.calculators}</div>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">AI Tools</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{data.counts.aiTools}</div>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">Tool Requests</div>
              <div className="mt-2 text-3xl font-bold text-q-text">{data.counts.requests}</div>
            </div>
            <div className="rounded-xl border border-q-border bg-q-bg p-5">
              <div className="text-sm text-q-muted">Implemented Requests</div>
              <div className="mt-2 text-3xl font-bold text-q-text">
                {data.counts.implementedRequests}
              </div>
            </div>
          </div>
        ) : null}
      </SectionCard>

      <SectionCard title="Quick Actions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <QuickActionCard
            href="/admin/generate"
            title="Generate Item"
            description="Create a single tool, calculator, or AI tool with engine automation."
          />
          <QuickActionCard
            href="/admin/requests"
            title="Tool Requests"
            description="Review requested items and convert demand into live pages."
          />
          <QuickActionCard
            href="/admin/diagnostics"
            title="System Diagnostics"
            description="View missing engines, broken items, and platform health."
            accent="success"
          />
          <QuickActionCard
            href="/admin/operations"
            title="Operations Console"
            description="Repair missing engines, preview assignments, and test bulk generation."
            accent="primary"
          />
          <QuickActionCard
            href="/admin"
            title="Refresh Dashboard"
            description="Reload this page data and re-check current platform metrics."
          />
        </div>
      </SectionCard>

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Monthly Usage Trend">
          {loading ? (
            <div className="text-sm text-q-muted">Loading usage trend...</div>
          ) : data && data.monthlyUsage.length > 0 ? (
            <div className="space-y-4">
              {data.monthlyUsage.map((item) => {
                const width = `${Math.max(8, (item.total / maxMonthlyValue) * 100)}%`;

                return (
                  <div key={item.month}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-q-text">{item.month}</span>
                      <span className="text-q-muted">
                        Total {item.total} · Tools {item.tools} · Calculators {item.calculators} · AI{" "}
                        {item.aiTools}
                      </span>
                    </div>

                    <div className="h-4 rounded-full bg-q-bg">
                      <div className="h-4 rounded-full bg-q-primary" style={{ width }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-sm text-q-muted">No monthly usage data available yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Recent Items">
          {loading ? (
            <div className="text-sm text-q-muted">Loading recent items...</div>
          ) : data ? (
            <div className="grid gap-5">
              <div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-q-muted">
                  Tools
                </div>
                <div className="space-y-2">
                  {data.recent.tools.length === 0 ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-muted">
                      No tools yet.
                    </div>
                  ) : (
                    data.recent.tools.map((item) => (
                      <div
                        key={item.slug}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-q-muted">
                  Calculators
                </div>
                <div className="space-y-2">
                  {data.recent.calculators.length === 0 ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-muted">
                      No calculators yet.
                    </div>
                  ) : (
                    data.recent.calculators.map((item) => (
                      <div
                        key={item.slug}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-q-muted">
                  AI Tools
                </div>
                <div className="space-y-2">
                  {data.recent.aiTools.length === 0 ? (
                    <div className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-muted">
                      No AI tools yet.
                    </div>
                  ) : (
                    data.recent.aiTools.map((item) => (
                      <div
                        key={item.slug}
                        className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                      >
                        {item.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </SectionCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <SectionCard title="Top Performing Tools">
          {loading ? (
            <div className="text-sm text-q-muted">Loading top tools...</div>
          ) : data && data.topTools.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-left text-sm text-q-muted">
                    <th className="px-3 py-2">Tool</th>
                    <th className="px-3 py-2">Engine</th>
                    <th className="px-3 py-2">Total</th>
                    <th className="px-3 py-2">This Month</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topTools.map((item) => (
                    <tr key={item.slug} className="bg-q-bg text-sm text-q-text">
                      <td className="rounded-l-xl px-3 py-3 font-medium">{item.name}</td>
                      <td className="px-3 py-3">{item.engine_type}</td>
                      <td className="px-3 py-3">{item.total}</td>
                      <td className="rounded-r-xl px-3 py-3">{item.thisMonth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-sm text-q-muted">No tool usage data yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Engine Family Performance">
          {loading ? (
            <div className="text-sm text-q-muted">Loading engine performance...</div>
          ) : data && data.enginePerformance.length > 0 ? (
            <div className="grid gap-4">
              {data.enginePerformance.map((item) => (
                <div key={item.engine_type} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="text-base font-semibold text-q-text">{item.engine_type}</div>
                  <div className="mt-2 grid gap-2 text-sm text-q-muted sm:grid-cols-2">
                    <div>
                      Tools: <span className="font-medium text-q-text">{item.tool_count}</span>
                    </div>
                    <div>
                      Total usage: <span className="font-medium text-q-text">{item.total_usage}</span>
                    </div>
                    <div>
                      Avg/tool:{" "}
                      <span className="font-medium text-q-text">{item.avg_usage_per_tool}</span>
                    </div>
                    <div>
                      Top slug: <span className="font-medium text-q-text">{item.top_tool_slug || "-"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-q-muted">No engine performance data yet.</div>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-8 xl:grid-cols-2">
        <SectionCard title="Top Niches">
          {loading ? (
            <div className="text-sm text-q-muted">Loading niche performance...</div>
          ) : data && data.nichePerformance.length > 0 ? (
            <div className="grid gap-4">
              {data.nichePerformance.map((item) => (
                <div key={item.key} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="text-base font-semibold text-q-text">{item.label}</div>
                  <div className="mt-2 grid gap-2 text-sm text-q-muted sm:grid-cols-2">
                    <div>
                      Live tools: <span className="font-medium text-q-text">{item.tool_count}</span>
                    </div>
                    <div>
                      Total usage: <span className="font-medium text-q-text">{item.total_usage}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-q-muted">No niche data yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Demand Gaps">
          {loading ? (
            <div className="text-sm text-q-muted">Loading demand gaps...</div>
          ) : data && data.demandGaps.length > 0 ? (
            <div className="grid gap-4">
              {data.demandGaps.map((item) => (
                <div key={item.niche_key} className="rounded-xl border border-q-border bg-q-bg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-q-text">{item.label}</div>
                    <div className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs font-medium text-q-text">
                      Score {item.demand_score}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-q-muted sm:grid-cols-2">
                    <div>
                      Request mentions:{" "}
                      <span className="font-medium text-q-text">{item.request_mentions}</span>
                    </div>
                    <div>
                      Live tools: <span className="font-medium text-q-text">{item.live_tool_count}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-q-muted">
                      Recommended engines
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.recommended_engine_types.map((engine) => (
                        <span
                          key={engine}
                          className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs text-q-text"
                        >
                          {engine}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs uppercase tracking-wide text-q-muted">Example ideas</div>
                    <ul className="mt-2 space-y-1 text-sm text-q-text">
                      {item.example_ideas.map((idea) => (
                        <li key={idea}>• {idea}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-q-muted">No demand gaps available yet.</div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}