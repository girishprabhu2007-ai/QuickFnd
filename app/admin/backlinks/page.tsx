"use client";

import { useState, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type Backlink = {
  id: string; url: string; source_name: string; source_type: string;
  anchor_text: string; target_url: string; da: number; notes: string;
  link_status: "unchecked" | "alive" | "dead"; http_status: number | null;
  last_checked: string | null; last_pinged: string | null; created_at: string;
};

type Suggestion = {
  url: string; source_name: string; strategy: string; expected_da: number;
  type: string; effort: string; impact: string;
};

type QualityResult = {
  score: number; grade: string; reasons: string[]; action: string;
};

type AnalysisItem = {
  id: string; url: string; source_name: string; da: number; link_status: string;
  quality: QualityResult;
};

type AnalysisSummary = {
  total: number; excellent: number; good: number; fair: number; poor: number;
  toxic: number; avgScore: number; avgDA: number; removeCount: number;
};

type Directory = {
  name: string; url: string; category: string; da: number; type: string;
  submitUrl: string; notes: string;
};

// ── Constants ────────────────────────────────────────────────────────────────

const LINK_STATUS_COLORS: Record<string, string> = {
  alive: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  dead: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  unchecked: "bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20",
};

const GRADE_COLORS: Record<string, string> = {
  excellent: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400",
  good: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400",
  fair: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400",
  poor: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400",
  toxic: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400",
};

const IMPACT_COLORS: Record<string, string> = {
  high: "text-emerald-600", medium: "text-amber-600", low: "text-gray-500",
};

const SOURCE_TYPES = ["directory", "guest-post", "social", "forum", "blog-comment", "resource-page", "other"];

const DIRECTORIES: Directory[] = [
  { name: "Product Hunt", url: "https://www.producthunt.com", category: "Tools", da: 90, type: "free", submitUrl: "https://www.producthunt.com/posts/new", notes: "Launch as a product. Best on Tuesday morning PST." },
  { name: "AlternativeTo", url: "https://alternativeto.net", category: "Tools", da: 85, type: "free", submitUrl: "https://alternativeto.net/software/add/", notes: "Add as alternative to SmallDev.tools, DevUtils." },
  { name: "Hacker News", url: "https://news.ycombinator.com", category: "Developer", da: 90, type: "free", submitUrl: "https://news.ycombinator.com/submit", notes: "Post as 'Show HN: QuickFnd – Free browser-based tools'." },
  { name: "Reddit r/webdev", url: "https://reddit.com/r/webdev", category: "Developer", da: 91, type: "free", submitUrl: "https://reddit.com/r/webdev/submit", notes: "Share specific tools. Be helpful in comments first." },
  { name: "Dev.to", url: "https://dev.to", category: "Developer", da: 86, type: "free", submitUrl: "https://dev.to/new", notes: "Write article linking to QuickFnd tools." },
  { name: "GitHub Awesome Lists", url: "https://github.com/sindresorhus/awesome", category: "Developer", da: 96, type: "free", submitUrl: "https://github.com/explore", notes: "Submit PR to awesome-web-tools. DA96 backlink." },
  { name: "Free For Dev", url: "https://free-for.dev", category: "Developer", da: 72, type: "free", submitUrl: "https://github.com/ripienaar/free-for-dev", notes: "PR submission. High developer traffic." },
  { name: "There's An AI For That", url: "https://theresanaiforthat.com", category: "AI Tools", da: 72, type: "free", submitUrl: "https://theresanaiforthat.com/submit-ai/", notes: "Submit AI tools individually." },
  { name: "LinkedIn Page", url: "https://linkedin.com", category: "Social", da: 98, type: "free", submitUrl: "https://www.linkedin.com/company/setup/new/", notes: "Company page. DA98." },
  { name: "YouTube", url: "https://youtube.com", category: "Social", da: 100, type: "free", submitUrl: "https://studio.youtube.com", notes: "Demo videos. DA100." },
];

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ── Tab 1: Ping Dashboard ────────────────────────────────────────────────────

function PingDashboard() {
  const [bulkPinging, setBulkPinging] = useState(false);
  const [bulkResult, setBulkResult] = useState<string>("");
  const [manualUrl, setManualUrl] = useState("");
  const [manualPinging, setManualPinging] = useState(false);
  const [manualResult, setManualResult] = useState("");

  async function bulkPing() {
    setBulkPinging(true); setBulkResult("");
    try {
      const secret = prompt("Enter CRON_SECRET:");
      if (!secret) { setBulkPinging(false); return; }
      const res = await fetch(`/api/admin/bulk-index?secret=${encodeURIComponent(secret)}`);
      const data = await res.json();
      setBulkResult(res.ok ? `✓ Submitted ${data.summary?.total_urls_submitted || 0} URLs` : `✗ ${data.error}`);
    } catch (e) { setBulkResult(`✗ ${e instanceof Error ? e.message : "Failed"}`); }
    finally { setBulkPinging(false); }
  }

  async function manualPing() {
    if (!manualUrl.trim()) return;
    setManualPinging(true); setManualResult("");
    try {
      const res = await fetch("/api/admin/ping-url", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: manualUrl.trim() }) });
      const data = await res.json();
      if (!res.ok) { setManualResult(`✗ ${data.error}`); return; }
      setManualResult(data.results.map((r: { engine: string; ok: boolean; status: number }) => `${r.engine}: ${r.ok ? "✓" : `✗ ${r.status}`}`).join(" · "));
    } catch (e) { setManualResult(`✗ ${e instanceof Error ? e.message : "Failed"}`); }
    finally { setManualPinging(false); }
  }

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-q-text">📡 IndexNow Ping Dashboard</h2></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <p className="font-semibold text-q-text text-sm">🌐 Bulk Ping All Pages</p>
          <button onClick={bulkPing} disabled={bulkPinging} className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">{bulkPinging ? "Pinging..." : "Ping All →"}</button>
          {bulkResult && <div className={`rounded-xl border p-3 text-xs ${bulkResult.startsWith("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{bulkResult}</div>}
        </div>
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <p className="font-semibold text-q-text text-sm">🎯 Ping Single URL</p>
          <div className="flex gap-2">
            <input type="text" value={manualUrl} onChange={e => setManualUrl(e.target.value)} placeholder="/tools/json-formatter" className="flex-1 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-xs text-q-text outline-none focus:border-purple-400/60 transition" />
            <button onClick={manualPing} disabled={manualPinging || !manualUrl.trim()} className="rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-60">{manualPinging ? "..." : "Ping"}</button>
          </div>
          {manualResult && <div className={`rounded-xl border p-3 text-xs ${manualResult.includes("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}>{manualResult}</div>}
        </div>
      </div>
      <div className="rounded-2xl border border-q-border bg-q-card p-5">
        <h3 className="text-sm font-semibold text-q-text mb-3">Quick Links</h3>
        <div className="grid gap-2 sm:grid-cols-4">
          {[{ label: "Google Search Console", url: "https://search.google.com/search-console?resource_id=https://quickfnd.com" }, { label: "Bing Webmaster", url: "https://www.bing.com/webmasters?siteUrl=https://quickfnd.com" }, { label: "PageSpeed", url: "https://pagespeed.web.dev/analysis?url=https://quickfnd.com" }, { label: "Sitemap", url: "https://quickfnd.com/sitemap.xml" }].map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener" className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{l.label}<span className="text-q-muted">↗</span></a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Tab 2: My Backlinks ──────────────────────────────────────────────────────

function MyBacklinks() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [checking, setChecking] = useState<string | null>(null);
  const [checkingAll, setCheckingAll] = useState(false);
  const [pinging, setPinging] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // Add form
  const [newUrl, setNewUrl] = useState(""); const [newName, setNewName] = useState(""); const [newType, setNewType] = useState("directory");
  const [newAnchor, setNewAnchor] = useState("QuickFnd"); const [newTarget, setNewTarget] = useState("https://quickfnd.com");
  const [newDa, setNewDa] = useState(0); const [newNotes, setNewNotes] = useState(""); const [addError, setAddError] = useState("");

  // Bulk import
  const [bulkText, setBulkText] = useState(""); const [bulkImporting, setBulkImporting] = useState(false); const [bulkResult, setBulkResult] = useState("");

  const loadBacklinks = useCallback(async () => {
    setLoading(true);
    try { const res = await fetch("/api/admin/backlinks"); if (res.ok) { const data = await res.json(); setBacklinks(data.backlinks || []); } }
    catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { loadBacklinks(); }, [loadBacklinks]);

  async function addBacklink() {
    if (!newUrl.trim()) { setAddError("URL is required"); return; }
    setAddError("");
    const res = await fetch("/api/admin/backlinks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url: newUrl.trim(), source_name: newName.trim() || undefined, source_type: newType, anchor_text: newAnchor.trim(), target_url: newTarget.trim(), da: newDa, notes: newNotes.trim() }) });
    const data = await res.json();
    if (!res.ok) { setAddError(data.error || "Failed"); return; }
    setShowAdd(false); setNewUrl(""); setNewName(""); setNewType("directory"); setNewAnchor("QuickFnd"); setNewTarget("https://quickfnd.com"); setNewDa(0); setNewNotes("");
    loadBacklinks();
  }

  async function bulkImport() {
    const urls = bulkText.split("\n").map(u => u.trim()).filter(Boolean);
    if (urls.length === 0) return;
    setBulkImporting(true); setBulkResult("");
    try {
      const res = await fetch("/api/admin/backlink-intelligence?action=bulk-import", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls }) });
      const data = await res.json();
      if (!res.ok) { setBulkResult(`✗ ${data.error}`); return; }
      setBulkResult(`✓ Imported: ${data.imported} · Duplicates: ${data.duplicates} · Errors: ${data.errors}`);
      setBulkText("");
      loadBacklinks();
    } catch (e) { setBulkResult(`✗ ${e instanceof Error ? e.message : "Failed"}`); }
    finally { setBulkImporting(false); }
  }

  async function deleteBacklink(id: string) { if (!confirm("Delete?")) return; await fetch(`/api/admin/backlinks?id=${id}`, { method: "DELETE" }); loadBacklinks(); }
  async function checkSingle(id: string) { setChecking(id); try { await fetch(`/api/admin/backlinks?action=check&id=${id}`); loadBacklinks(); } catch {} finally { setChecking(null); } }
  async function checkAll() { setCheckingAll(true); try { await fetch("/api/admin/backlinks?action=check-all"); loadBacklinks(); } catch {} finally { setCheckingAll(false); } }
  async function pingSingle(id: string) { setPinging(id); try { await fetch(`/api/admin/backlinks?action=ping&id=${id}`); loadBacklinks(); } catch {} finally { setPinging(null); } }

  const filtered = backlinks.filter(b => statusFilter === "all" || b.link_status === statusFilter);
  const alive = backlinks.filter(b => b.link_status === "alive").length;
  const dead = backlinks.filter(b => b.link_status === "dead").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-q-text">🔗 My Backlinks</h2>
          <p className="mt-1 text-xs text-q-muted">{backlinks.length} tracked · {alive} alive · {dead} dead</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={checkAll} disabled={checkingAll || backlinks.length === 0} className="rounded-xl border border-q-border bg-q-card px-3 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition disabled:opacity-50">{checkingAll ? "Checking..." : "🔍 Check All"}</button>
          <button onClick={() => { setShowBulk(!showBulk); setShowAdd(false); }} className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">📦 Bulk Import</button>
          <button onClick={() => { setShowAdd(!showAdd); setShowBulk(false); }} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">+ Add Single</button>
        </div>
      </div>

      {/* Bulk import panel */}
      {showBulk && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5 space-y-3 dark:border-amber-500/20 dark:bg-amber-500/5">
          <h3 className="font-semibold text-q-text text-sm">📦 Bulk Import Backlinks</h3>
          <p className="text-xs text-q-muted">Paste URLs, one per line. The system will auto-detect source name, estimate DA, check if alive, and classify quality.</p>
          <textarea value={bulkText} onChange={e => setBulkText(e.target.value)} rows={6} placeholder={"https://dev.to/your-article\nhttps://reddit.com/r/webdev/comments/...\nhttps://github.com/awesome-list/..."} className="w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text font-mono outline-none focus:border-amber-400/60 transition" />
          <div className="flex items-center gap-3">
            <button onClick={bulkImport} disabled={bulkImporting || !bulkText.trim()} className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white hover:bg-amber-700 transition disabled:opacity-60">{bulkImporting ? "Importing..." : `Import ${bulkText.split("\n").filter(Boolean).length} URLs`}</button>
            <button onClick={() => setShowBulk(false)} className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition">Cancel</button>
            {bulkResult && <span className={`text-xs ${bulkResult.startsWith("✓") ? "text-emerald-600" : "text-red-500"}`}>{bulkResult}</span>}
          </div>
        </div>
      )}

      {/* Single add panel */}
      {showAdd && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-5 space-y-3 dark:border-blue-500/20 dark:bg-blue-500/5">
          <h3 className="font-semibold text-q-text text-sm">Add Single Backlink</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="text-xs text-q-muted font-medium">URL *</label><input type="url" value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder="https://example.com/page" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Source Name</label><input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Product Hunt" className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition" /></div>
            <div><label className="text-xs text-q-muted font-medium">Type</label><select value={newType} onChange={e => setNewType(e.target.value)} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none transition">{SOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="text-xs text-q-muted font-medium">DA</label><input type="number" value={newDa} onChange={e => setNewDa(Number(e.target.value))} min={0} max={100} className="mt-1 w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none transition" /></div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={addBacklink} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition">Save</button>
            <button onClick={() => setShowAdd(false)} className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-xs font-medium text-q-text hover:bg-q-card-hover transition">Cancel</button>
            {addError && <span className="text-xs text-red-500">{addError}</span>}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "alive", "dead", "unchecked"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition capitalize ${statusFilter === s ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400" : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"}`}>
            {s} ({s === "all" ? backlinks.length : s === "alive" ? alive : s === "dead" ? dead : backlinks.filter(b => b.link_status === "unchecked").length})
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? <div className="py-12 text-center text-sm text-q-muted">Loading...</div> :
      filtered.length === 0 ? <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center"><p className="text-q-text font-semibold">{backlinks.length === 0 ? "No backlinks yet" : "No match"}</p></div> :
      <div className="rounded-2xl border border-q-border bg-q-card divide-y divide-q-border">
        {filtered.map(link => (
          <div key={link.id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <a href={link.url} target="_blank" rel="noopener" className="font-semibold text-sm text-q-text hover:text-blue-500 transition truncate max-w-md">{link.url}</a>
                  <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase ${LINK_STATUS_COLORS[link.link_status]}`}>{link.link_status}{link.http_status ? ` (${link.http_status})` : ""}</span>
                  {link.da > 0 && <span className={`text-xs font-bold ${link.da >= 80 ? "text-emerald-600" : link.da >= 60 ? "text-amber-600" : "text-blue-600"}`}>DA {link.da}</span>}
                  <span className="text-xs text-q-muted border border-q-border rounded-full px-2 py-0.5">{link.source_type}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-3 text-xs text-q-muted">
                  <span>{link.source_name}</span><span>→ {link.anchor_text}</span>
                  {link.last_checked && <span>Checked: {timeAgo(link.last_checked)}</span>}
                </div>
                {link.notes && <p className="mt-1 text-xs text-q-muted opacity-70">{link.notes}</p>}
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => checkSingle(link.id)} disabled={checking === link.id} className="rounded-xl border border-q-border bg-q-bg px-2.5 py-1.5 text-xs hover:bg-q-card-hover transition disabled:opacity-50" title="Check">{checking === link.id ? "..." : "🔍"}</button>
                <button onClick={() => pingSingle(link.id)} disabled={pinging === link.id} className="rounded-xl border border-q-border bg-q-bg px-2.5 py-1.5 text-xs hover:bg-q-card-hover transition disabled:opacity-50" title="Ping">{pinging === link.id ? "..." : "📡"}</button>
                <button onClick={() => deleteBacklink(link.id)} className="rounded-xl border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-100 transition" title="Delete">🗑</button>
              </div>
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
}

// ── Tab 3: AI Suggestions ────────────────────────────────────────────────────

function AISuggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError(""); setSuggestions([]);
    try {
      const res = await fetch("/api/admin/backlink-intelligence?action=suggest", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed"); return; }
      setSuggestions(data.suggestions || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-q-text">🤖 AI Backlink Suggestions</h2><p className="mt-1 text-xs text-q-muted">AI generates targeted backlink opportunities specific to QuickFnd.</p></div>
        <button onClick={generate} disabled={loading} className="rounded-xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-purple-700 transition disabled:opacity-60">{loading ? "Generating..." : "✨ Generate Suggestions"}</button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{error}</div>}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((s, i) => (
            <div key={i} className="rounded-2xl border border-q-border bg-q-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-q-text">{s.source_name}</span>
                    <span className={`text-xs font-bold ${(s.expected_da || 0) >= 80 ? "text-emerald-600" : (s.expected_da || 0) >= 60 ? "text-amber-600" : "text-blue-600"}`}>DA ~{s.expected_da}</span>
                    <span className="text-xs border border-q-border rounded-full px-2 py-0.5 text-q-muted">{s.type}</span>
                    <span className={`text-xs font-semibold ${IMPACT_COLORS[s.impact] || "text-gray-500"}`}>↑ {s.impact} impact</span>
                    <span className="text-xs text-q-muted">{s.effort} effort</span>
                  </div>
                  <p className="mt-2 text-sm text-q-muted leading-relaxed">{s.strategy}</p>
                </div>
                <a href={s.url} target="_blank" rel="noopener" className="shrink-0 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">Open →</a>
              </div>
            </div>
          ))}
        </div>
      )}
      {!loading && suggestions.length === 0 && !error && (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
          <p className="text-3xl mb-3">🤖</p>
          <p className="text-q-text font-semibold">Click "Generate Suggestions" to get AI-powered backlink ideas</p>
          <p className="mt-2 text-sm text-q-muted">The AI analyzes QuickFnd&apos;s niche and finds new opportunities beyond the standard directory list.</p>
        </div>
      )}
    </div>
  );
}

// ── Tab 4: Quality Analysis ──────────────────────────────────────────────────

function QualityAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisItem[]>([]);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [gradeFilter, setGradeFilter] = useState("all");

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/backlink-intelligence?action=analyze", { method: "POST" });
      const data = await res.json();
      setAnalysis(data.analysis || []);
      setSummary(data.summary || null);
    } catch {} finally { setLoading(false); }
  }

  const filtered = gradeFilter === "all" ? analysis : analysis.filter(a => a.quality.grade === gradeFilter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-xl font-bold text-q-text">📊 Backlink Quality Analysis</h2><p className="mt-1 text-xs text-q-muted">Scores each backlink and flags toxic or low-quality ones.</p></div>
        <button onClick={analyze} disabled={loading} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60">{loading ? "Analyzing..." : "🔬 Run Analysis"}</button>
      </div>

      {summary && (
        <div className="grid gap-3 sm:grid-cols-4 xl:grid-cols-7">
          {[
            { label: "Total", value: summary.total, color: "text-q-text" },
            { label: "Excellent", value: summary.excellent, color: "text-emerald-600" },
            { label: "Good", value: summary.good, color: "text-blue-600" },
            { label: "Fair", value: summary.fair, color: "text-amber-600" },
            { label: "Poor", value: summary.poor, color: "text-orange-600" },
            { label: "Toxic", value: summary.toxic, color: "text-red-600" },
            { label: "Avg Score", value: summary.avgScore, color: "text-purple-600" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-q-border bg-q-card p-3 text-center">
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-xs text-q-muted">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {summary && summary.removeCount > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
          <p className="text-sm font-semibold text-red-700 dark:text-red-400">⚠️ {summary.removeCount} backlink{summary.removeCount > 1 ? "s" : ""} flagged for removal</p>
          <p className="mt-1 text-xs text-red-600 dark:text-red-300">These are toxic or poor quality links that may hurt your SEO. Review them below and consider removing or disavowing.</p>
        </div>
      )}

      {analysis.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {["all", "excellent", "good", "fair", "poor", "toxic"].map(g => (
            <button key={g} onClick={() => setGradeFilter(g)} className={`rounded-xl border px-3 py-1.5 text-xs font-medium transition capitalize ${gradeFilter === g ? "border-blue-400 bg-blue-50 text-blue-700 dark:bg-blue-500/10" : "border-q-border bg-q-card text-q-muted hover:bg-q-card-hover"}`}>
              {g} ({g === "all" ? analysis.length : analysis.filter(a => a.quality.grade === g).length})
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 && (
        <div className="rounded-2xl border border-q-border bg-q-card divide-y divide-q-border">
          {filtered.map(item => (
            <div key={item.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-q-text truncate max-w-sm">{item.url}</span>
                    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase ${GRADE_COLORS[item.quality.grade] || ""}`}>{item.quality.grade} ({item.quality.score})</span>
                    {item.da > 0 && <span className="text-xs font-bold text-q-muted">DA {item.da}</span>}
                    <span className={`inline-flex rounded-lg border px-2 py-0.5 text-[10px] font-semibold uppercase ${LINK_STATUS_COLORS[item.link_status] || ""}`}>{item.link_status}</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.quality.reasons.map((r, i) => (
                      <span key={i} className="rounded-lg bg-q-bg border border-q-border px-2 py-0.5 text-[10px] text-q-muted">{r}</span>
                    ))}
                  </div>
                  {(item.quality.action === "remove" || item.quality.action === "consider-removing") && (
                    <p className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400">Recommended: {item.quality.action === "remove" ? "🗑 Remove this backlink" : "⚠️ Consider removing"}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && analysis.length === 0 && (
        <div className="rounded-2xl border border-q-border bg-q-card p-12 text-center">
          <p className="text-3xl mb-3">📊</p>
          <p className="text-q-text font-semibold">Click "Run Analysis" to score all your tracked backlinks</p>
          <p className="mt-2 text-sm text-q-muted">The analyzer checks DA, link status, spam signals, and source type to grade each backlink.</p>
        </div>
      )}
    </div>
  );
}

// ── Tab 5: Directories ───────────────────────────────────────────────────────

function DirectoryTracker() {
  const [category, setCategory] = useState("All");
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const CATEGORIES = ["All", "Tools", "Developer", "AI Tools", "Social"];
  const filtered = DIRECTORIES.filter(d => category === "All" || d.category === category);

  return (
    <div className="space-y-6">
      <div><h2 className="text-xl font-bold text-q-text">📋 Directory Tracker</h2></div>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (<button key={cat} onClick={() => setCategory(cat)} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${category === cat ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted"}`}>{cat}</button>))}
      </div>
      <div className="rounded-2xl border border-q-border bg-q-card divide-y divide-q-border">
        {filtered.map(dir => {
          const status = statuses[dir.name] || "pending";
          return (
            <div key={dir.name} className="p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <a href={dir.url} target="_blank" rel="noopener" className="font-semibold text-sm text-q-text hover:text-blue-500 transition">{dir.name}</a>
                <span className={`text-xs font-bold ${dir.da >= 80 ? "text-emerald-600" : "text-amber-600"}`}>DA {dir.da}</span>
                <span className="text-xs text-q-muted">{dir.notes}</span>
              </div>
              <div className="flex gap-1.5">
                <a href={dir.submitUrl} target="_blank" rel="noopener" className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition">Submit →</a>
                {(["pending", "submitted", "approved"] as const).map(s => (
                  <button key={s} onClick={() => setStatuses(prev => ({ ...prev, [dir.name]: s }))} className={`rounded-xl border px-2 py-1.5 text-xs font-medium transition capitalize ${status === s ? "border-blue-400 bg-blue-50 text-blue-700" : "border-q-border bg-q-bg text-q-muted opacity-50 hover:opacity-100"}`}>{s}</button>
                ))}
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
  const [tab, setTab] = useState<"backlinks" | "suggestions" | "analysis" | "ping" | "directories">("backlinks");

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 flex-wrap">
        {[
          { key: "backlinks" as const, label: "🔗 My Backlinks" },
          { key: "suggestions" as const, label: "🤖 AI Suggestions" },
          { key: "analysis" as const, label: "📊 Quality Analysis" },
          { key: "ping" as const, label: "📡 Ping" },
          { key: "directories" as const, label: "📋 Directories" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${tab === t.key ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
            {t.label}
          </button>
        ))}
      </nav>
      {tab === "backlinks" && <MyBacklinks />}
      {tab === "suggestions" && <AISuggestions />}
      {tab === "analysis" && <QualityAnalysis />}
      {tab === "ping" && <PingDashboard />}
      {tab === "directories" && <DirectoryTracker />}
    </div>
  );
}
