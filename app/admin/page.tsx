"use client";

import { useEffect, useState } from "react";

type DashboardStats = {
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
};

type UsageItem = {
  item_slug: string;
  item_type: string;
  total: number;
  thisMonth: number;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [usage, setUsage] = useState<UsageItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    try {
      const [statsRes, usageRes] = await Promise.all([
        fetch("/api/admin/dashboard-stats", { cache: "no-store" }),
        fetch("/api/admin/usage-summary", { cache: "no-store" }),
      ]);

      const statsText = await statsRes.text();
      const statsData = statsText ? JSON.parse(statsText) : null;

      const usageText = await usageRes.text();
      const usageData = usageText ? JSON.parse(usageText) : { items: [] };

      if (statsRes.ok) {
        setStats(statsData);
      }

      if (usageRes.ok) {
        setUsage(Array.isArray(usageData.items) ? usageData.items : []);
      }
    } catch (error) {
      console.error("dashboard load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-6">
        <section className="rounded-2xl border border-q-border bg-q-card p-6">
          <h2 className="text-xl font-semibold text-q-text">Content counts</h2>

          {loading || !stats ? (
            <p className="mt-4 text-sm text-q-muted">Loading counts...</p>
          ) : (
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">Total Pages</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.total}
                </div>
              </div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">Tools</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.tools}
                </div>
              </div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">Calculators</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.calculators}
                </div>
              </div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">AI Tools</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.aiTools}
                </div>
              </div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">Tool Requests</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.requests}
                </div>
              </div>
              <div className="rounded-xl border border-q-border bg-q-bg p-4">
                <div className="text-q-muted">Implemented Requests</div>
                <div className="mt-1 text-2xl font-bold text-q-text">
                  {stats.counts.implementedRequests}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-q-border bg-q-card p-6">
          <h2 className="text-xl font-semibold text-q-text">Top usage</h2>

          {loading ? (
            <p className="mt-4 text-sm text-q-muted">Loading usage...</p>
          ) : usage.length === 0 ? (
            <p className="mt-4 text-sm text-q-muted">
              No usage data yet. Open some live tools and then refresh this page.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {usage.slice(0, 8).map((item) => (
                <div
                  key={`${item.item_type}-${item.item_slug}`}
                  className="rounded-xl border border-q-border bg-q-bg p-4"
                >
                  <div className="text-sm font-semibold text-q-text">
                    {item.item_slug}
                  </div>
                  <div className="mt-2 text-xs uppercase tracking-wide text-q-muted">
                    {item.item_type}
                  </div>
                  <div className="mt-3 text-sm text-q-muted">
                    Total: <span className="font-medium text-q-text">{item.total}</span>
                  </div>
                  <div className="text-sm text-q-muted">
                    This month:{" "}
                    <span className="font-medium text-q-text">{item.thisMonth}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </aside>

      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">Recently available items</h2>

        {loading || !stats ? (
          <p className="mt-4 text-sm text-q-muted">Loading recent items...</p>
        ) : (
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-semibold text-q-text">Tools</h3>
              <div className="mt-3 space-y-2">
                {stats.recent.tools.map((item) => (
                  <div
                    key={item.slug}
                    className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-q-text">Calculators</h3>
              <div className="mt-3 space-y-2">
                {stats.recent.calculators.map((item) => (
                  <div
                    key={item.slug}
                    className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-q-text">AI Tools</h3>
              <div className="mt-3 space-y-2">
                {stats.recent.aiTools.map((item) => (
                  <div
                    key={item.slug}
                    className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-text"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}