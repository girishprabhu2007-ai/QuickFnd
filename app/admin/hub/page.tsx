"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

type Notification = { type: string; title: string; detail: string; time: string; priority: "high" | "medium" | "low"; href?: string };
type BlogPost = { id: number; slug: string; title: string; status: string; published_at: string | null; created_at: string; source: string; target_keyword: string | null };
type CalendarDay = { posts: number; titles: string[] };
type RevenueEntry = { month: string; adsense_revenue: number; affiliate_revenue: number; other_revenue: number; openai_cost: number; vercel_cost: number; supabase_cost: number; other_cost: number; notes: string };

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  low: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
};
const NOTIF_ICONS: Record<string, string> = { request: "🙋", "cron-failure": "🔴", subscriber: "📧", application: "📬", "blog-failure": "📝", "guest-post": "📄" };

function timeAgo(d: string): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/hub?view=notifications").then(r => r.json()).then(d => { setNotifications(d.notifications || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-sm text-q-muted">Loading notifications...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-q-text">Notifications</h2>
        <span className="text-sm text-q-muted">{notifications.length} items</span>
      </div>
      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
          <p className="text-lg font-semibold text-q-text">All clear</p>
          <p className="mt-2 text-sm text-q-muted">No pending notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n, i) => (
            <div key={i} className="rounded-2xl border border-q-border bg-q-card p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5">{NOTIF_ICONS[n.type] || "📌"}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-q-text">{n.title}</span>
                    <span className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase ${PRIORITY_COLORS[n.priority]}`}>{n.priority}</span>
                    <span className="text-xs text-q-muted">{timeAgo(n.time)}</span>
                  </div>
                  <p className="mt-1 text-xs text-q-muted">{n.detail}</p>
                </div>
                {n.href && <Link href={n.href} className="shrink-0 rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">View →</Link>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Content Calendar Tab ─────────────────────────────────────────────────────

function CalendarTab() {
  const [postsByDate, setPostsByDate] = useState<Record<string, CalendarDay>>({});
  const [recentPosts, setRecentPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/hub?view=calendar").then(r => r.json()).then(d => {
      setPostsByDate(d.postsByDate || {});
      setRecentPosts(d.recentPosts || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-sm text-q-muted">Loading calendar...</div>;

  // Build last 14 days
  const days: { date: string; label: string; data: CalendarDay | null }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    days.push({ date: dateStr, label, data: postsByDate[dateStr] || null });
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-q-text">Content Calendar — Last 14 Days</h2>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map(day => {
          const isToday = day.date === todayStr;
          const count = day.data?.posts || 0;
          return (
            <div key={day.date} className={`rounded-xl border p-3 text-center ${isToday ? "border-blue-400 bg-blue-50/50 dark:border-blue-500/30 dark:bg-blue-500/5" : "border-q-border bg-q-card"}`}>
              <p className="text-[10px] text-q-muted">{day.label.split(",")[0]}</p>
              <p className={`text-xl font-bold mt-1 ${count > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-q-muted"}`}>{count}</p>
              <p className="text-[10px] text-q-muted mt-0.5">{day.date.slice(5)}</p>
            </div>
          );
        })}
      </div>

      {/* Recent posts list */}
      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        <div className="px-5 py-3 border-b border-q-border">
          <h3 className="font-semibold text-q-text text-sm">Recent Blog Posts</h3>
        </div>
        <div className="divide-y divide-q-border">
          {recentPosts.slice(0, 15).map(post => (
            <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-q-text truncate">{post.title}</p>
                <p className="text-xs text-q-muted mt-0.5">{post.target_keyword || post.slug} · {post.source}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${post.status === "published" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"}`}>
                  {post.status}
                </span>
                <span className="text-xs text-q-muted">{timeAgo(post.published_at || post.created_at)}</span>
                <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs text-blue-500 hover:text-blue-400">↗</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Blog Editor Tab ──────────────────────────────────────────────────────────

function BlogEditorTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/blog?status=published&limit=30").then(r => r.json()).then(d => { setPosts(d.posts || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function startEdit(id: number) {
    const res = await fetch(`/api/admin/hub?view=blog-post&id=${id}`);
    const data = await res.json();
    if (data.post) { setEditingId(id); setEditTitle(data.post.title); setEditExcerpt(data.post.excerpt || ""); }
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/admin/hub?action=edit-blog", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, title: editTitle, excerpt: editExcerpt }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setSaveMsg("Saved!"); setEditingId(null); setPosts(prev => prev.map(p => p.id === editingId ? { ...p, title: editTitle } : p)); }
    else setSaveMsg(`Error: ${data.error}`);
  }

  if (loading) return <div className="py-12 text-center text-sm text-q-muted">Loading posts...</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-q-text">Blog Post Editor</h2>
      <p className="text-sm text-q-muted">Edit titles, excerpts, and meta for published blog posts.</p>

      {editingId && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3 dark:border-blue-500/20 dark:bg-blue-500/5">
          <h3 className="font-semibold text-q-text text-sm">Editing Post #{editingId}</h3>
          <div><label className="text-xs text-q-muted font-medium">Title</label>
            <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          <div><label className="text-xs text-q-muted font-medium">Excerpt</label>
            <textarea value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={3} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          <div className="flex items-center gap-3">
            <button onClick={saveEdit} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">{saving ? "Saving..." : "Save Changes"}</button>
            <button onClick={() => setEditingId(null)} className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition">Cancel</button>
            {saveMsg && <span className={`text-xs ${saveMsg.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}>{saveMsg}</span>}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-q-border bg-q-card divide-y divide-q-border">
        {posts.map(post => (
          <div key={post.id} className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-q-text truncate">{post.title}</p>
              <p className="text-xs text-q-muted mt-0.5">/{post.slug}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => startEdit(post.id)} className="rounded-lg border border-q-border bg-q-bg px-2.5 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">Edit</button>
              <Link href={`/blog/${post.slug}`} target="_blank" className="rounded-lg border border-q-border bg-q-bg px-2.5 py-1.5 text-xs font-medium text-blue-500 hover:bg-q-card-hover transition">Preview ↗</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Comparison Generator Tab ─────────────────────────────────────────────────

function ComparisonGeneratorTab() {
  const [toolAName, setToolAName] = useState("");
  const [toolASlug, setToolASlug] = useState("");
  const [toolBName, setToolBName] = useState("");
  const [toolBSlug, setToolBSlug] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState("");

  async function generate() {
    if (!toolAName.trim() || !toolBName.trim()) return;
    setGenerating(true); setResult("");
    try {
      const res = await fetch("/api/admin/hub?action=create-comparison", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool_a_name: toolAName.trim(), tool_a_slug: toolASlug.trim(), tool_b_name: toolBName.trim(), tool_b_slug: toolBSlug.trim() }),
      });
      const data = await res.json();
      if (data.success) { setResult(`Created: /compare/${data.comparison.slug}`); setToolAName(""); setToolASlug(""); setToolBName(""); setToolBSlug(""); }
      else setResult(`Error: ${data.error}`);
    } catch (e) { setResult(`Error: ${e instanceof Error ? e.message : "Failed"}`); }
    finally { setGenerating(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-q-text">Comparison Page Generator</h2>
        <p className="text-sm text-q-muted mt-1">Pick two tools and AI generates a full comparison page with pros, cons, verdict, and FAQs.</p>
      </div>

      <div className="rounded-2xl border border-q-border bg-q-card p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-q-text">Tool A</p>
            <div><label className="text-xs text-q-muted">Name *</label>
              <input type="text" value={toolAName} onChange={e => setToolAName(e.target.value)} placeholder="e.g. QuickFnd Image Compressor" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted">Slug (optional)</label>
              <input type="text" value={toolASlug} onChange={e => setToolASlug(e.target.value)} placeholder="e.g. image-compressor" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-q-text">Tool B</p>
            <div><label className="text-xs text-q-muted">Name *</label>
              <input type="text" value={toolBName} onChange={e => setToolBName(e.target.value)} placeholder="e.g. TinyPNG" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted">Slug (optional)</label>
              <input type="text" value={toolBSlug} onChange={e => setToolBSlug(e.target.value)} placeholder="e.g. tinypng" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button onClick={generate} disabled={generating || !toolAName.trim() || !toolBName.trim()}
            className="rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-60">
            {generating ? "Generating with AI..." : "Generate Comparison Page"}
          </button>
          {result && <span className={`text-sm ${result.startsWith("Error") ? "text-red-500" : "text-emerald-600 font-medium"}`}>{result}</span>}
        </div>
      </div>
    </div>
  );
}

// ── Revenue Tracker Tab ──────────────────────────────────────────────────────

function RevenueTab() {
  const [entries, setEntries] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [adsense, setAdsense] = useState(0);
  const [affiliate, setAffiliate] = useState(0);
  const [otherRev, setOtherRev] = useState(0);
  const [openaiCost, setOpenaiCost] = useState(0);
  const [vercelCost, setVercelCost] = useState(0);
  const [supabaseCost, setSupabaseCost] = useState(0);
  const [otherCost, setOtherCost] = useState(0);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/hub?view=revenue").then(r => r.json()).then(d => { setEntries(d.entries || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setSaveMsg("");
    const res = await fetch("/api/admin/hub?action=save-revenue", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, adsense_revenue: adsense, affiliate_revenue: affiliate, other_revenue: otherRev, openai_cost: openaiCost, vercel_cost: vercelCost, supabase_cost: supabaseCost, other_cost: otherCost, notes }),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) { setSaveMsg("Saved!"); setShowAdd(false); fetch("/api/admin/hub?view=revenue").then(r => r.json()).then(d => setEntries(d.entries || [])); }
    else setSaveMsg(`Error: ${data.error}`);
  }

  if (loading) return <div className="py-12 text-center text-sm text-q-muted">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-q-text">Revenue & Cost Tracker</h2>
          <p className="text-sm text-q-muted mt-1">Track monthly income vs expenses.</p>
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">{showAdd ? "Cancel" : "+ Add Month"}</button>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-4 dark:border-blue-500/20 dark:bg-blue-500/5">
          <div><label className="text-xs text-q-muted font-medium">Month</label>
            <input type="month" value={month} onChange={e => setMonth(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none transition" /></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold text-emerald-600 mb-2">Revenue ($)</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">AdSense</label><input type="number" value={adsense} onChange={e => setAdsense(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">Affiliate</label><input type="number" value={affiliate} onChange={e => setAffiliate(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">Other</label><input type="number" value={otherRev} onChange={e => setOtherRev(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-red-600 mb-2">Costs ($)</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">OpenAI</label><input type="number" value={openaiCost} onChange={e => setOpenaiCost(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">Vercel</label><input type="number" value={vercelCost} onChange={e => setVercelCost(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">Supabase</label><input type="number" value={supabaseCost} onChange={e => setSupabaseCost(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
                <div className="flex items-center gap-2"><label className="text-xs text-q-muted w-20">Other</label><input type="number" value={otherCost} onChange={e => setOtherCost(Number(e.target.value))} className="flex-1 rounded-lg border border-q-border bg-q-bg px-2 py-1.5 text-sm text-q-text outline-none" /></div>
              </div>
            </div>
          </div>
          <div><label className="text-xs text-q-muted font-medium">Notes</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none transition" /></div>
          <div className="flex items-center gap-3">
            <button onClick={save} disabled={saving} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">{saving ? "Saving..." : "Save Entry"}</button>
            {saveMsg && <span className={`text-xs ${saveMsg.startsWith("Error") ? "text-red-500" : "text-emerald-600"}`}>{saveMsg}</span>}
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
          <p className="text-lg font-semibold text-q-text">No revenue data yet</p>
          <p className="mt-2 text-sm text-q-muted">Click "+ Add Month" to start tracking income vs expenses.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-q-border bg-q-bg text-xs uppercase tracking-widest text-q-muted">
                <th className="px-4 py-3 text-left">Month</th>
                <th className="px-4 py-3 text-right text-emerald-600">Revenue</th>
                <th className="px-4 py-3 text-right text-red-600">Costs</th>
                <th className="px-4 py-3 text-right font-bold">Profit</th>
                <th className="px-4 py-3 text-left">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-q-border">
              {entries.map(e => {
                const rev = (e.adsense_revenue || 0) + (e.affiliate_revenue || 0) + (e.other_revenue || 0);
                const cost = (e.openai_cost || 0) + (e.vercel_cost || 0) + (e.supabase_cost || 0) + (e.other_cost || 0);
                const profit = rev - cost;
                return (
                  <tr key={e.month} className="hover:bg-q-bg/50 transition">
                    <td className="px-4 py-3 font-medium text-q-text">{e.month}</td>
                    <td className="px-4 py-3 text-right text-emerald-600 font-medium">${rev.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-red-600">${cost.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-bold ${profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>${profit.toFixed(2)}</td>
                    <td className="px-4 py-3 text-xs text-q-muted truncate max-w-[200px]">{e.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminHubPage() {
  const [tab, setTab] = useState<"notifications" | "calendar" | "editor" | "comparisons" | "revenue">("notifications");

  const TABS = [
    { key: "notifications" as const, label: "🔔 Notifications" },
    { key: "calendar" as const, label: "📅 Calendar" },
    { key: "editor" as const, label: "📝 Blog Editor" },
    { key: "comparisons" as const, label: "⚖️ Comparisons" },
    { key: "revenue" as const, label: "💰 Revenue" },
  ];

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${tab === t.key ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "notifications" && <NotificationsTab />}
      {tab === "calendar" && <CalendarTab />}
      {tab === "editor" && <BlogEditorTab />}
      {tab === "comparisons" && <ComparisonGeneratorTab />}
      {tab === "revenue" && <RevenueTab />}
    </div>
  );
}
