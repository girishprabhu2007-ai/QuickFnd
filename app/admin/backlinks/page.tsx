"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Backlink = {
  id: string;
  url: string;
  source_name: string;
  source_type: string;
  anchor_text: string;
  target_url: string;
  da: number;
  notes: string;
  link_status: "unchecked" | "alive" | "dead";
  http_status: number | null;
  last_checked: string | null;
  last_pinged: string | null;
  created_at: string;
};

type Directory = {
  name: string;
  url: string;
  category: string;
  da: number;
  type: "free" | "paid" | "freemium";
  submitUrl: string;
  notes: string;
  status: "pending" | "submitted" | "approved" | "rejected";
};

type PingResult = {
  success: boolean;
  summary?: {
    tools: number;
    calculators: number;
    ai_tools: number;
    blog_posts: number;
    total_urls_submitted: number;
    errors: string[];
  };
  error?: string;
  duration_ms?: number;
};

// ── Directory Data (static) ──────────────────────────────────────────────────

const DIRECTORIES: Directory[] = [
  { name: "Product Hunt", url: "https://www.producthunt.com", category: "Tools", da: 90, type: "free", submitUrl: "https://www.producthunt.com/posts/new", notes: "Launch as a product. Best on Tuesday morning PST.", status: "pending" },
  { name: "AlternativeTo", url: "https://alternativeto.net", category: "Tools", da: 85, type: "free", submitUrl: "https://alternativeto.net/software/add/", notes: "Add as alternative to SmallDev.tools, DevUtils.", status: "pending" },
  { name: "Hacker News Show HN", url: "https://news.ycombinator.com", category: "Developer", da: 90, type: "free", submitUrl: "https://news.ycombinator.com/submit", notes: "Post as 'Show HN: QuickFnd – Free browser-based tools'.", status: "pending" },
  { name: "Reddit r/webdev", url: "https://reddit.com/r/webdev", category: "Developer", da: 91, type: "free", submitUrl: "https://reddit.com/r/webdev/submit", notes: "Share specific tools. Be helpful in comments first.", status: "pending" },
  { name: "Reddit r/sideprojects", url: "https://reddit.com/r/SideProject", category: "General", da: 91, type: "free", submitUrl: "https://reddit.com/r/SideProject/submit", notes: "Share your story building 200+ free tools.", status: "pending" },
  { name: "Dev.to", url: "https://dev.to", category: "Developer", da: 86, type: "free", submitUrl: "https://dev.to/new", notes: "Write article linking to QuickFnd tools.", status: "pending" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com", category: "Startup", da: 78, type: "free", submitUrl: "https://www.indiehackers.com/post", notes: "Share growth milestones.", status: "pending" },
  { name: "BetaList", url: "https://betalist.com", category: "Startup", da: 72, type: "freemium", submitUrl: "https://betalist.com/submit", notes: "Free listing takes 1-3 weeks.", status: "pending" },
  { name: "SaaSHub", url: "https://www.saashub.com", category: "Tools", da: 68, type: "free", submitUrl: "https://www.saashub.com/submit", notes: "List as alternative to popular tools.", status: "pending" },
  { name: "There's An AI For That", url: "https://theresanaiforthat.com", category: "AI Tools", da: 72, type: "free", submitUrl: "https://theresanaiforthat.com/submit-ai/", notes: "Submit AI tools individually.", status: "pending" },
  { name: "GitHub Awesome Lists", url: "https://github.com/sindresorhus/awesome", category: "Developer", da: 96, type: "free", submitUrl: "https://github.com/explore", notes: "Submit PR to awesome-web-tools. DA96 backlink.", status: "pending" },
  { name: "Free For Dev", url: "https://free-for.dev", category: "Developer", da: 72, type: "free", submitUrl: "https://github.com/ripienaar/free-for-dev", notes: "PR submission. High developer traffic.", status: "pending" },
  { name: "Twitter / X", url: "https://twitter.com", category: "Social", da: 94, type: "free", submitUrl: "https://twitter.com/i/flow/signup", notes: "Create @QuickFnd account. Link in bio.", status: "pending" },
  { name: "LinkedIn Page", url: "https://linkedin.com", category: "Social", da: 98, type: "free", submitUrl: "https://www.linkedin.com/company/setup/new/", notes: "Create company page. DA98 backlink.", status: "pending" },
  { name: "YouTube", url: "https://youtube.com", category: "Social", da: 100, type: "free", submitUrl: "https://studio.youtube.com", notes: "Short demo videos. Link in description. DA100.", status: "pending" },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

const LINK_STATUS_COLORS: Record<string, string> = {
  alive: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  dead: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  unchecked: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
};

const SOURCE_TYPES = ["directory", "guest-post", "social", "forum", "blog-comment", "resource-page", "other"];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Ping Dashboard Component ─────────────────────────────────────────────────

function PingDashboard() {
  const [bulkPinging, setBulkPinging] = useState(false);
  const [bulkResult, setBulkResult] = useState<PingResult | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [manualPinging, setManualPinging] = useState(false);
  const [manualResult, setManualResult] = useState("");

  async function bulkPing() {
    setBulkPinging(true);
    setBulkResult(null);
    try {
      const secret = prompt("Enter CRON_SECRET:");
      if (!secret) { setBulkPinging(false); return; }
      const res = await fetch(`/api/admin/bulk-index?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      if (!res.ok) setBulkResult({ success: false, error: data.error || "Failed" });
      else setBulkResult({ success: true, summary: data.summary, duration_ms: data.duration_ms });
    } catch (e) {
      setBulkResult({ success: false, error: e instanceof Error ? e.message : "Request failed" });
    } finally { setBulkPinging(false); }
  }

  async function manualPing() {
    if (!manualUrl.trim()) return;
    setManualPinging(true);
    setManualResult("");
    try {
      const res = await fetch("/api/admin/ping-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: manualUrl.trim() }),
      });
      const data = await res.json() as { url: string; results: { engine: string; ok: boolean; status: number }[]; error?: string };
      if (!res.ok) { setManualResult(`✗ ${data.error || "Failed"}`); return; }
      const parts = data.results.map(r => `${r.engine}: ${r.ok ? "✓ OK" : `✗ ${r.status}`}`);
      setManualResult(parts.join(" · "));
    } catch (e) {
      setManualResult(`✗ ${e instanceof Error ? e.message : "Request failed"}`);
    } finally { setManualPinging(false); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-q-text">📡 IndexNow Ping Dashboard</h2>
        <p className="mt-1 text-xs text-q-muted">Ping Bing + Yandex via IndexNow to get pages crawled faster.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 text-lg">🌐</span>
            <div><p className="font-semibold text-q-text text-sm">Bulk Ping All Pages</p><p className="text-xs text-q-muted">Tools + Calcs + AI + Blog + Compare</p></div>
          </div>
          <button onClick={bulkPing} disabled={bulkPinging} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">
            {bulkPinging ? "Pinging..." : "Ping All Pages →"}
          </button>
          {bulkResult && (
            <div className={`rounded-xl border p-3 text-xs ${bulkResult.success ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700"}`}>
              {bulkResult.success && bulkResult.summary ? <p className="font-semibold">✓ Submitted {bulkResult.summary.total_urls_submitted} URLs ({((bulkResult.duration_ms || 0) / 1000).toFixed(1)}s)</p> : <p>✗ {bulkResult.error}</p>}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 text-lg">🎯</span>
            <div><p className="font-semibold text-q-text text-sm">Ping Single URL</p><p className="text-xs text-q-muted">IndexNow for a specific page</p></div>
          </div>
          <div className="flex gap-2">
            <input type="text" value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="/tools/json-formatter"
              className="flex-1 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-xs text-q-text outline-none focus:border-purple-400/60 transition" />
            <button onClick={manualPing} disabled={manualPinging || !manualUrl.trim()} className="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-60">
              {manualPinging ? "..." : "Ping"}
            </button>
          </div>
          {manualResult && (
            <div className={`rounded-xl border p-3 text-xs ${manualResult.includes("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10" : "border-red-200 bg-red-50 text-red-700"}`}>
              {manualResult}
            </div>
          )}
        </div>
      </div>
      <div className="rounded-2xl border border-q-border bg-q-card p-5">
        <h3 className="text-sm font-semibold text-q-text mb-3">Quick Reference Links</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Google Search Console", url: "https://search.google.com/search-console?resource_id=https://quickfnd.com", icon: "🔍" },
            { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters?siteUrl=https://quickfnd.com", icon: "🅱️" },
            { label: "Google PageSpeed", url: "https://pagespeed.web.dev/analysis?url=https://quickfnd.com", icon: "⚡" },
            { label: "Sitemap", url: "https://quickfnd.com/sitemap.xml", icon: "🗺️" },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener" className="flex items-center gap-2 rounded-xl border border-q-border bg-q-bg px-3 py-2.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">
              <span>{link.icon}</span><span>{link.label}</span><span className="ml-auto text-q-muted">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── My Backlinks Component (DB-driven) ───────────────────────────────────────

function MyBacklinks() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [pinging, setPinging] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [newUrl, setNewUrl] = useState("");
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("directory");
  const [newAnchor, setNewAnchor] = useState("QuickFnd");
  const [newTarget, setNewTarget] = useState("https://quickfnd.com");
  const [newDa, setNewDa] = useState(0);
  const [newNotes, setNewNotes] = useState("");
  const [addError, setAddError] = useState("");

  const loadBacklinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backlinks");
      if (res.ok) { const data = await res.json(); setBacklinks(data.backlinks || []); }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBacklinks(); }, [loadBacklinks]);

  async function addBacklink() {
    if (!newUrl.trim()) { setAddError("URL is required"); return; }
    setAddError("");
    try {
      const res = await fetch("/api/admin/backlinks", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim(), source_name: newName.trim() || undefined, source_type: newType, anchor_text: newAnchor.trim(), target_url: newTarget.trim(), da: newDa, notes: newNotes.trim() }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(data.error || "Failed"); return; }
      setShowAdd(false); setNewUrl(""); setNewName(""); setNewType("directory"); setNewAnchor("QuickFnd"); setNewTarget("https://quickfnd.com"); setNewDa(0); setNewNotes("");
      loadBacklinks();
    } catch (e) { setAddError(e instanceof Error ? e.message : "Failed"); }
  }

  async function deleteBacklink(id: string) {
    if (!confirm("Delete this backlink?")) return;
    await fetch(`/api/admin/backlinks?id=${id}`, { method: "DELETE" });
    loadBacklinks();
  }

  async function checkSingle(id: string) { setChecking(id); try { await fetch(`/api/admin/backlinks?action=check&id=${id}`); loadBacklinks(); } catch {} finally { setChecking(null); } }
  async function checkAll() { setCheckingAll(true); try { await fetch("/api/admin/backlinks?action=check-all"); loadBacklinks(); } catch {} finally { setCheckingAll(false); } }
  async function pingSingle(id: string) { setPinging(id); try { await fetch(`/api/admin/backlinks?action=ping&id=${id}`); loadBacklinks(); } catch {} finally { setPinging(null); } }

  const filtered = backlinks.filter(b => statusFilter === "all" || b.link_status === statusFilter);
  const alive = backlinks.filter(b => b.link_status === "alive").length;
  const dead = backlinks.filter(b => b.link_status === "dead").length;
  const unchecked = backlinks.filter(b => b.link_status === "unchecked").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-q-text">🔗 My Backlinks</h2>
          <p className="mt-1 text-xs text-q-muted">{backlinks.length} tracked · {alive} alive · {dead} dead · {unchecked} unchecked</p>
        </div>
        <div className="flex gap-2">
          <button onClick={checkAll} disabled={checkingAll || backlinks.length === 0} className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-50">
            {checkingAll ? "Checking..." : "🔍 Check All"}
          </button>
          <button onClick={() => setShowAdd(!showAdd)} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">+ Add Backlink</button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3 dark:border-blue-500/20 dark:bg-blue-500/5">
          <h3 className="font-semibold text-q-text text-sm">Add New Backlink</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs text-q-muted font-medium">Backlink URL *</label><input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/page-linking-to-you" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Source Name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Product Hunt, Dev.to..." className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Source Type</label><select value={newType} onChange={e => setNewType(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition">{SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="text-xs text-q-muted font-medium">DA (0-100)</label><input type="number" value={newDa} onChange={e => setNewDa(Number(e.target.value))} min={0} max={100} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Anchor Text</label><input type="text" value={newAnchor} onChange={e => setNewAnchor(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Target URL (your page)</label><input type="text" value={newTarget} onChange={e => setNewTarget(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          </div>
          <div><label className="text-xs text-q-muted font-medium">Notes</label><input type="text" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Optional notes..." className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
          <div className="flex items-center gap-3">
            <button onClick={addBacklink} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">Save Backlink</button>
            <button onClick={() => setShowAdd(false)} className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition">Cancel</button>
            {addError && <span className="text-xs text-red-500">{addError}</span>}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {["all", "alive", "dead", "unchecked"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition capitalize ${statusFilter === s ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"}`}>
            {s} {s === "all" ? `(${backlinks.length})` : s === "alive" ? `(${alive})` : s === "dead" ? `(${dead})` : `(${unchecked})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-q-muted">Loading backlinks...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
          <p className="text-lg font-semibold text-q-text">{backlinks.length === 0 ? "No backlinks tracked yet" : "No backlinks match this filter"}</p>
          <p className="mt-2 text-sm text-q-muted">{backlinks.length === 0 ? "Click '+ Add Backlink' to start tracking." : ""}</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden divide-y divide-q-border">
          {filtered.map(link => (
            <div key={link.id} className="p-4 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={link.url} target="_blank" rel="noopener" className="font-semibold text-sm text-q-text hover:text-blue-500 transition truncate max-w-md">{link.url}</a>
                    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase ${LINK_STATUS_COLORS[link.link_status]}`}>
                      {link.link_status}{link.http_status ? ` (${link.http_status})` : ""}
                    </span>
                    {link.da > 0 && <span className={`text-xs font-bold ${link.da >= 80 ? "text-emerald-600" : link.da >= 60 ? "text-amber-600" : "text-blue-600"}`}>DA {link.da}</span>}
                    <span className="text-xs text-q-muted rounded-full border border-q-border px-2 py-0.5">{link.source_type}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-q-muted">
                    <span>{link.source_name}</span>
                    <span>→ {link.anchor_text}</span>
                    <span>→ {link.target_url.replace("https://quickfnd.com", "") || "/"}</span>
                    {link.last_checked && <span>Checked: {timeAgo(link.last_checked)}</span>}
                    {link.last_pinged && <span>Pinged: {timeAgo(link.last_pinged)}</span>}
                  </div>
                  {link.notes && <p className="mt-1 text-xs text-q-muted opacity-70">{link.notes}</p>}
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => checkSingle(link.id)} disabled={checking === link.id} className="rounded-xl border border-q-border bg-q-bg px-2.5 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-50" title="Check if alive">{checking === link.id ? "..." : "🔍"}</button>
                  <button onClick={() => pingSingle(link.id)} disabled={pinging === link.id} className="rounded-xl border border-q-border bg-q-bg px-2.5 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-50" title="Ping IndexNow">{pinging === link.id ? "..." : "📡"}</button>
                  <button onClick={() => deleteBacklink(link.id)} className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400" title="Delete">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Directory Tracker Component ──────────────────────────────────────────────

function DirectoryTracker() {
  const [category, setCategory] = useState("All");
  const [statuses, setStatuses] = useState<Record<string, Directory["status"]>>({});
  const CATEGORIES = ["All", "Tools", "Developer", "AI Tools", "Startup", "Social", "General"];
  const filtered = DIRECTORIES.filter(d => category === "All" || d.category === category);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-q-text">📋 Directory Submission Tracker</h2><p className="mt-1 text-xs text-q-muted">{DIRECTORIES.length} directories to submit to.</p></div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setCategory(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${category === cat ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>{cat}</button>
        ))}
      </div>
      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden divide-y divide-q-border">
        {filtered.map(dir => {
          const status = statuses[dir.name] || dir.status;
          return (
            <div key={dir.name} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <a href={dir.url} target="_blank" rel="noopener" className="font-semibold text-sm text-q-text hover:text-blue-500 transition">{dir.name}</a>
                    <span className={`text-xs font-bold ${dir.da >= 80 ? "text-emerald-600" : dir.da >= 60 ? "text-amber-600" : "text-blue-600"}`}>DA {dir.da}</span>
                    <span className={`text-xs rounded-full border px-2 py-0.5 ${dir.type === "free" ? "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10" : "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-500/10"}`}>{dir.type}</span>
                  </div>
                  <p className="mt-1 text-xs text-q-muted">{dir.notes}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <a href={dir.submitUrl.startsWith("http") ? dir.submitUrl : "#"} target="_blank" rel="noopener" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">Submit →</a>
                  {(["pending", "submitted", "approved"] as const).map(s => (
                    <button key={s} onClick={() => setStatuses(prev => ({ ...prev, [dir.name]: s }))} className={`rounded-xl border px-2 py-1.5 text-xs font-medium transition capitalize ${status === s ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10" : "border-q-border bg-q-bg text-q-muted opacity-50 hover:opacity-100"}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function BacklinksPage() {
  const [tab, setTab] = useState<"ping" | "backlinks" | "directories">("backlinks");

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 flex-wrap">
        {[
          { key: "ping" as const, label: "📡 Ping Dashboard" },
          { key: "backlinks" as const, label: "🔗 My Backlinks" },
          { key: "directories" as const, label: "📋 Directories" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${tab === t.key ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "ping" && <PingDashboard />}
      {tab === "backlinks" && <MyBacklinks />}
      {tab === "directories" && <DirectoryTracker />}
    </div>
  );
}
