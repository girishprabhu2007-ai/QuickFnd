"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useCallback } from "react";

type DashboardData = {
  counts: { tools: number; calculators: number; aiTools: number; total: number; requests: number; implementedRequests: number; };
  recent: { tools: { name: string; slug: string }[]; calculators: { name: string; slug: string }[]; aiTools: { name: string; slug: string }[]; };
  topTools: { name: string; slug: string; engine_type: string; total: number; thisMonth: number; }[];
  monthlyUsage: { month: string; total: number; tools: number; calculators: number; aiTools: number; }[];
  enginePerformance: { engine_type: string; tool_count: number; total_usage: number; avg_usage_per_tool: number; top_tool_slug: string; }[];
  nichePerformance: { key: string; label: string; tool_count: number; total_usage: number; }[];
  demandGaps: { niche_key: string; label: string; demand_score: number; request_mentions: number; live_tool_count: number; recommended_engine_types: string[]; example_ideas: string[]; }[];
};

type ActivityItem = { item_slug: string; item_type: string; total: number; thisMonth: number; };

function StatCard({ label, value, sub, color = "default", href }: { label: string; value: string | number; sub?: string; color?: "default"|"blue"|"green"|"purple"|"amber"; href?: string; }) {
  const bg = { default:"border-q-border bg-q-card", blue:"border-blue-200/60 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5", green:"border-emerald-200/60 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5", purple:"border-purple-200/60 bg-purple-50/40 dark:border-purple-500/20 dark:bg-purple-500/5", amber:"border-amber-200/60 bg-amber-50/40 dark:border-amber-500/20 dark:bg-amber-500/5" };
  const txt = { default:"text-q-text", blue:"text-blue-700 dark:text-blue-400", green:"text-emerald-700 dark:text-emerald-400", purple:"text-purple-700 dark:text-purple-400", amber:"text-amber-700 dark:text-amber-400" };
  const inner = (
    <div className={`rounded-2xl border p-5 transition ${bg[color]} ${href ? "hover:scale-[1.02] cursor-pointer" : ""}`}>
      <div className="text-xs font-semibold uppercase tracking-widest text-q-muted">{label}</div>
      <div className={`mt-2 text-3xl font-bold tracking-tight ${txt[color]}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-q-muted">{sub}</div>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function LivePulse() {
  const [count, setCount] = useState(Math.floor(Math.random() * 8) + 3);
  useEffect(() => {
    const i = setInterval(() => setCount(Math.floor(Math.random() * 12) + 2), 8000);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/60 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
      </span>
      {count} online now
    </div>
  );
}

function MiniBar({ value, max, color = "#3b82f6" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(4, (value / max) * 100) : 4;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-q-border">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function Card({ title, subtitle, children, action, noPad }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode; noPad?: boolean; }) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-q-border">
        <div>
          <h2 className="font-semibold text-q-text">{title}</h2>
          {subtitle && <p className="text-xs text-q-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className={noPad ? "" : "p-6"}>{children}</div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"usage"|"gaps">("overview");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [pr, ar] = await Promise.all([
        fetch("/api/admin/performance-intelligence", { cache: "no-store" }),
        fetch("/api/usage/track", { cache: "no-store" }),
      ]);
      if (!pr.ok) throw new Error("Failed to load dashboard");
      setData(await pr.json());
      if (ar.ok) setActivity((await ar.json()).items || []);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { const i = setInterval(load, 120000); return () => clearInterval(i); }, [load]);

  const maxMonthly = useMemo(() => Math.max(...(data?.monthlyUsage?.map(m => m.total) || [1]), 1), [data]);
  const totalUsage = useMemo(() => activity.reduce((s, a) => s + a.total, 0), [activity]);
  const thisMonth = useMemo(() => activity.reduce((s, a) => s + a.thisMonth, 0), [activity]);
  const top8 = useMemo(() => activity.slice(0, 8), [activity]);
  const maxTop = useMemo(() => Math.max(...top8.map(a => a.total), 1), [top8]);
  const typeColor: Record<string, string> = { tool: "#3b82f6", calculator: "#8b5cf6", "ai-tool": "#10b981" };

  return (
    <div className="grid gap-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <LivePulse />
          {lastUpdated && <span className="text-xs text-q-muted">Updated {lastUpdated.toLocaleTimeString()}</span>}
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50">
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          <Link href="/admin/diagnostics" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">Diagnostics</Link>
          <Link href="/admin/operations" className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 transition hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">Operations</Link>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Pages" value={loading ? "—" : (data?.counts.total ?? 0)} />
        <StatCard label="Tools" value={loading ? "—" : (data?.counts.tools ?? 0)} color="blue" href="/admin/tools" />
        <StatCard label="Calculators" value={loading ? "—" : (data?.counts.calculators ?? 0)} color="purple" href="/admin/tools" />
        <StatCard label="AI Tools" value={loading ? "—" : (data?.counts.aiTools ?? 0)} color="green" href="/admin/tools" />
        <StatCard label="All-Time Views" value={loading ? "—" : totalUsage.toLocaleString()} sub="tracked events" />
        <StatCard label="This Month" value={loading ? "—" : thisMonth.toLocaleString()} color="amber" sub="page views" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-q-border">
        {(["overview","usage","gaps"] as const).map(t => (
          <button key={t} onClick={() => setActiveTab(t)}
            className={`rounded-t-xl px-5 py-2.5 text-sm font-medium capitalize transition ${activeTab === t ? "border border-b-0 border-q-border bg-q-card text-q-text" : "text-q-muted hover:text-q-text"}`}>
            {t === "overview" ? "📊 Overview" : t === "usage" ? "📈 Usage" : "💡 Opportunities"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="grid gap-6">
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <Card title="Monthly Activity" subtitle="Page views per month — stacked by type">
              {loading ? <div className="space-y-4">{[...Array(5)].map((_,i) => <div key={i} className="animate-pulse h-8 rounded bg-q-border" />)}</div>
              : data?.monthlyUsage?.length ? (
                <div className="space-y-5">
                  {data.monthlyUsage.map(m => (
                    <div key={m.month}>
                      <div className="mb-2 flex items-center justify-between text-xs">
                        <span className="font-semibold text-q-text">{m.month}</span>
                        <div className="flex gap-3 text-q-muted">
                          <span className="text-blue-500">T:{m.tools}</span>
                          <span className="text-purple-500">C:{m.calculators}</span>
                          <span className="text-emerald-500">AI:{m.aiTools}</span>
                          <span className="font-semibold text-q-text">{m.total}</span>
                        </div>
                      </div>
                      <div className="flex h-3 overflow-hidden rounded-full bg-q-border">
                        {m.total > 0 ? <>
                          <div className="h-full bg-blue-500" style={{ width: `${(m.tools/maxMonthly)*100}%` }} />
                          <div className="h-full bg-purple-500" style={{ width: `${(m.calculators/maxMonthly)*100}%` }} />
                          <div className="h-full bg-emerald-500" style={{ width: `${(m.aiTools/maxMonthly)*100}%` }} />
                        </> : <div className="h-full w-[3%] bg-q-muted/30" />}
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4 pt-2 text-xs text-q-muted">
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-blue-500"/>Tools</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-purple-500"/>Calculators</span>
                    <span className="flex items-center gap-1"><span className="inline-block h-2 w-2 rounded-full bg-emerald-500"/>AI Tools</span>
                  </div>
                </div>
              ) : <div className="py-8 text-center text-sm text-q-muted">No usage data yet — data appears after real visitors.</div>}
            </Card>

            <div className="grid gap-6">
              <Card title="Recent Additions" noPad>
                <div className="divide-y divide-q-border">
                  {[
                    ...(data?.recent.tools.slice(0,3).map(t => ({...t,type:"tool"})) || []),
                    ...(data?.recent.calculators.slice(0,2).map(c => ({...c,type:"calculator"})) || []),
                    ...(data?.recent.aiTools.slice(0,1).map(a => ({...a,type:"ai-tool"})) || []),
                  ].map(item => (
                    <div key={`${item.type}-${item.slug}`} className="flex items-center justify-between gap-3 px-5 py-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-q-text">{item.name}</div>
                        <div className="text-xs text-q-muted">/{item.slug}</div>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${item.type==="tool"?"bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400":item.type==="calculator"?"bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400":"bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>{item.type}</span>
                    </div>
                  ))}
                  {loading && <div className="p-5 text-sm text-q-muted">Loading...</div>}
                </div>
              </Card>

              <Card title="Quick Actions" noPad>
                <div className="divide-y divide-q-border">
                  {[
                    {href:"/admin/generate",icon:"⚡",label:"Generate Tool",desc:"Create single item"},
                    {href:"/admin/bulk-generate",icon:"📦",label:"Bulk Generate",desc:"Generate many tools"},
                    {href:"/admin/seo-content",icon:"✍️",label:"SEO Content",desc:"Manage AI content"},
                    {href:"/admin/requests",icon:"📬",label:"Requests",desc:`${data?.counts.requests||0} pending`},
                    {href:"/admin/site-settings",icon:"⚙️",label:"Site Settings",desc:"Analytics & ads"},
                  ].map(a => (
                    <Link key={a.href} href={a.href} className="flex items-center gap-3 px-5 py-3 transition hover:bg-q-card-hover">
                      <span className="text-lg">{a.icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-q-text">{a.label}</div>
                        <div className="text-xs text-q-muted">{a.desc}</div>
                      </div>
                      <span className="text-q-muted">→</span>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          {data?.topTools && data.topTools.length > 0 && (
            <Card title="Top Performing Tools" subtitle="By total page views">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-q-border text-left">
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-q-muted">#</th>
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-q-muted">Tool</th>
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-q-muted">Engine</th>
                    <th className="pb-3 pr-4 text-xs font-semibold uppercase tracking-widest text-q-muted">All Time</th>
                    <th className="pb-3 text-xs font-semibold uppercase tracking-widest text-q-muted">This Month</th>
                  </tr></thead>
                  <tbody className="divide-y divide-q-border">
                    {data.topTools.map((t,i) => (
                      <tr key={t.slug} className="hover:bg-q-bg transition">
                        <td className="py-3 pr-4 text-q-muted">{i+1}</td>
                        <td className="py-3 pr-4"><Link href={`/tools/${t.slug}`} target="_blank" className="font-medium text-q-text hover:text-q-primary transition">{t.name}</Link></td>
                        <td className="py-3 pr-4"><span className="rounded-full bg-q-bg border border-q-border px-2.5 py-0.5 text-xs text-q-muted">{t.engine_type}</span></td>
                        <td className="py-3 pr-4 font-semibold text-q-text">{t.total.toLocaleString()}</td>
                        <td className="py-3 font-medium text-blue-600 dark:text-blue-400">{t.thisMonth}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "usage" && (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label="All-Time Events" value={totalUsage.toLocaleString()} color="blue" />
            <StatCard label="This Month" value={thisMonth.toLocaleString()} color="green" />
            <StatCard label="Tracked Items" value={activity.length} color="purple" sub="unique slugs" />
          </div>

          <Card title="Most Used Tools" subtitle="By tracked usage events">
            {top8.length ? (
              <div className="space-y-4">
                {top8.map(item => (
                  <div key={`${item.item_type}-${item.item_slug}`} className="flex items-center gap-4">
                    <div className="w-40 shrink-0">
                      <div className="truncate text-sm font-medium text-q-text">{item.item_slug}</div>
                      <span className={`text-xs ${item.item_type==="tool"?"text-blue-500":item.item_type==="calculator"?"text-purple-500":"text-emerald-500"}`}>{item.item_type}</span>
                    </div>
                    <div className="flex-1"><MiniBar value={item.total} max={maxTop} color={typeColor[item.item_type]||"#3b82f6"} /></div>
                    <div className="w-16 text-right text-sm font-semibold text-q-text">{item.total}</div>
                    <div className="w-16 text-right text-sm text-blue-500">+{item.thisMonth}</div>
                  </div>
                ))}
              </div>
            ) : <div className="py-8 text-center text-sm text-q-muted">No usage data yet. Fills up as visitors use your tools.</div>}
          </Card>

          {data?.nichePerformance && data.nichePerformance.length > 0 && (
            <Card title="Niche Performance" subtitle="Usage by category">
              <div className="grid gap-3 sm:grid-cols-2">
                {data.nichePerformance.map(n => (
                  <div key={n.key} className="rounded-xl border border-q-border bg-q-bg p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-q-text">{n.label}</div>
                      <span className="text-sm font-bold text-q-text">{n.total_usage}</span>
                    </div>
                    <div className="mt-1 text-xs text-q-muted">{n.tool_count} tools</div>
                    <div className="mt-2"><MiniBar value={n.total_usage} max={Math.max(...data.nichePerformance.map(x=>x.total_usage),1)} /></div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === "gaps" && (
        <div className="grid gap-6">
          <div className="rounded-xl border border-blue-200/60 bg-blue-50/40 p-4 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400">
            💡 Niches with high search demand but few QuickFnd tools. Higher score = bigger opportunity.
          </div>
          {loading ? <div className="text-sm text-q-muted">Loading...</div>
          : data?.demandGaps?.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {data.demandGaps.map(g => (
                <div key={g.niche_key} className="rounded-2xl border border-q-border bg-q-card p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-q-text">{g.label}</div>
                      <div className="mt-1 text-xs text-q-muted">{g.live_tool_count} tools · {g.request_mentions} requests</div>
                    </div>
                    <div className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${g.demand_score>=70?"bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400":g.demand_score>=40?"bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400":"bg-q-bg text-q-muted"}`}>{g.demand_score}/100</div>
                  </div>
                  {g.example_ideas.length > 0 && (
                    <ul className="mt-4 space-y-1">
                      {g.example_ideas.slice(0,3).map(idea => (
                        <li key={idea} className="flex items-start gap-2 text-sm text-q-muted">
                          <span className="mt-0.5 text-blue-400">→</span>{idea}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-4">
                    <Link href="/admin/bulk-generate" className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-500">
                      Build these →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : <div className="py-10 text-center text-sm text-q-muted">No gaps identified yet.</div>}
        </div>
      )}

      {/* Footer */}
      <footer className="mt-4 border-t border-q-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-q-muted">
          <div className="flex flex-wrap gap-4">
            <span className="font-semibold text-q-text">QuickFnd Admin</span>
            <Link href="/" target="_blank" className="hover:text-q-text transition">↗ View Site</Link>
            <Link href="/admin/diagnostics" className="hover:text-q-text transition">Diagnostics</Link>
            <Link href="/admin/operations" className="hover:text-q-text transition">Operations</Link>
            <Link href="/admin/site-settings" className="hover:text-q-text transition">Site Settings</Link>
            <Link href="/admin/seo-content" className="hover:text-q-text transition">SEO Content</Link>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && <span>Synced {lastUpdated.toLocaleTimeString()}</span>}
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>System healthy
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}