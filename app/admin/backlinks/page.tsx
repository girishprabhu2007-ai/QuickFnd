"use client";

import { useState } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

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

// ── Directory Data ───────────────────────────────────────────────────────────

const DIRECTORIES: Directory[] = [
  // ── High DA Tool Directories ──
  { name: "Product Hunt", url: "https://www.producthunt.com", category: "Tools", da: 90, type: "free", submitUrl: "https://www.producthunt.com/posts/new", notes: "Launch as a product. Needs a good description, logo, tagline. Best launched on Tuesday morning PST.", status: "pending" },
  { name: "AlternativeTo", url: "https://alternativeto.net", category: "Tools", da: 85, type: "free", submitUrl: "https://alternativeto.net/software/add/", notes: "Add as alternative to SmallDev.tools, DevUtils, ToolsLayer. High traffic source.", status: "pending" },
  { name: "Hacker News Show HN", url: "https://news.ycombinator.com", category: "Developer", da: 90, type: "free", submitUrl: "https://news.ycombinator.com/submit", notes: "Post as 'Show HN: QuickFnd – Free browser-based tools for developers'. Best on weekday mornings.", status: "pending" },
  { name: "Reddit r/webdev", url: "https://reddit.com/r/webdev", category: "Developer", da: 91, type: "free", submitUrl: "https://reddit.com/r/webdev/submit", notes: "Share specific tools like JSON formatter, Regex Tester. Be genuinely helpful in comments first.", status: "pending" },
  { name: "Reddit r/sideprojects", url: "https://reddit.com/r/SideProject", category: "General", da: 91, type: "free", submitUrl: "https://reddit.com/r/SideProject/submit", notes: "Share your story — 'I built 62 free browser-based tools, here's what I learned'", status: "pending" },
  { name: "Dev.to", url: "https://dev.to", category: "Developer", da: 86, type: "free", submitUrl: "https://dev.to/new", notes: "Write an article: 'The tools I built that developers actually use'. Link to QuickFnd throughout.", status: "pending" },
  { name: "Indie Hackers", url: "https://www.indiehackers.com", category: "Startup", da: 78, type: "free", submitUrl: "https://www.indiehackers.com/post", notes: "Share revenue/traffic milestones. The community loves honest growth stories.", status: "pending" },
  { name: "BetaList", url: "https://betalist.com", category: "Startup", da: 72, type: "freemium", submitUrl: "https://betalist.com/submit", notes: "Free listing takes 1-3 weeks. Good for early adopter audience.", status: "pending" },
  { name: "SaaSHub", url: "https://www.saashub.com", category: "Tools", da: 68, type: "free", submitUrl: "https://www.saashub.com/submit", notes: "List as alternative to popular tools. Gets traffic from comparison searches.", status: "pending" },
  { name: "ToolFinder", url: "https://toolfinder.co", category: "Tools", da: 52, type: "free", submitUrl: "https://toolfinder.co/submit", notes: "Specifically for online tools. Very targeted traffic.", status: "pending" },
  { name: "Toolify.ai", url: "https://www.toolify.ai", category: "AI Tools", da: 58, type: "free", submitUrl: "https://www.toolify.ai/submit", notes: "For AI tools specifically. Submit the AI Tools section.", status: "pending" },
  { name: "There's An AI For That", url: "https://theresanaiforthat.com", category: "AI Tools", da: 72, type: "free", submitUrl: "https://theresanaiforthat.com/submit-ai/", notes: "Submit all AI tools individually. Each gets its own page = multiple backlinks.", status: "pending" },
  { name: "Futurepedia", url: "https://www.futurepedia.io", category: "AI Tools", da: 65, type: "free", submitUrl: "https://www.futurepedia.io/submit-tool", notes: "AI tools directory. High traffic from AI-curious users.", status: "pending" },
  { name: "GitHub Awesome Lists", url: "https://github.com/sindresorhus/awesome", category: "Developer", da: 96, type: "free", submitUrl: "https://github.com/explore", notes: "Submit PR to relevant awesome lists: awesome-web-tools, awesome-online-tools. DA96 backlink.", status: "pending" },
  { name: "Free For Dev", url: "https://free-for.dev", category: "Developer", da: 72, type: "free", submitUrl: "https://github.com/ripienaar/free-for-dev", notes: "GitHub repo listing free tools for developers. PR submission. Very high developer traffic.", status: "pending" },
  // ── Indian Finance Directories ──
  { name: "Moneycontrol Tools", url: "https://www.moneycontrol.com", category: "Finance India", da: 82, type: "free", submitUrl: "Contact via editorial", notes: "Reach out to editorial team to feature our calculators in their tools section.", status: "pending" },
  { name: "ET Money Blog", url: "https://www.etmoney.com/blog", category: "Finance India", da: 65, type: "free", submitUrl: "Guest post pitch", notes: "Pitch guest post about 'Free tools for Indian investors'. Link to our calculators.", status: "pending" },
  { name: "Groww Blog", url: "https://groww.in/blog", category: "Finance India", da: 68, type: "free", submitUrl: "Guest post pitch", notes: "Pitch 'How to calculate SIP returns using free tools'. Natural link to SIP calculator.", status: "pending" },
  // ── Blog Directories ──
  { name: "Blogarama", url: "https://www.blogarama.com", category: "Blog", da: 58, type: "free", submitUrl: "https://www.blogarama.com/add-blog", notes: "Submit the QuickFnd blog. Builds domain authority for blog section.", status: "pending" },
  { name: "AllTop", url: "https://alltop.com", category: "Blog", da: 72, type: "free", submitUrl: "https://alltop.com/submit-a-site", notes: "Topic-based blog directory. Submit under Technology, Finance, Programming.", status: "pending" },
  // ── Social Profiles (creates backlinks) ──
  { name: "Twitter / X", url: "https://twitter.com", category: "Social", da: 94, type: "free", submitUrl: "https://twitter.com/i/flow/signup", notes: "Create @QuickFnd account. Link to quickfnd.com in bio. Tweet each new tool.", status: "pending" },
  { name: "LinkedIn Page", url: "https://linkedin.com", category: "Social", da: 98, type: "free", submitUrl: "https://www.linkedin.com/company/setup/new/", notes: "Create company page. Link to quickfnd.com. Post about tools and calculators.", status: "pending" },
  { name: "Pinterest", url: "https://pinterest.com", category: "Social", da: 94, type: "free", submitUrl: "https://business.pinterest.com", notes: "Create tool screenshots as pins. Pin to boards like 'Developer Tools', 'Finance India'. Each pin = backlink.", status: "pending" },
  { name: "YouTube", url: "https://youtube.com", category: "Social", da: 100, type: "free", submitUrl: "https://studio.youtube.com", notes: "Short 2-min demo videos for each tool. Link in description. YouTube DA100 = powerful.", status: "pending" },
];

const CATEGORIES = ["All", "Tools", "Developer", "AI Tools", "Finance India", "Startup", "Blog", "Social", "General"];
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-q-bg text-q-muted border-q-border",
  submitted: "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
  approved: "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  rejected: "bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
};

function DABadge({ da }: { da: number }) {
  const color = da >= 80 ? "text-emerald-600" : da >= 60 ? "text-amber-600" : "text-blue-600";
  return <span className={`text-xs font-bold ${color}`}>DA {da}</span>;
}

function GitHubSubmitButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function submit() {
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/admin/github-submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const data = await res.json();
      if (!res.ok) setResult("✗ " + (data.error || "Failed"));
      else setResult(`✓ ${data.submitted} PRs created`);
    } catch { setResult("✗ Request failed"); }
    finally { setLoading(false); }
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={submit} disabled={loading}
        className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition disabled:opacity-60">
        {loading ? "Submitting PRs..." : "Auto-Submit to GitHub Lists"}
      </button>
      {result && <span className="text-xs text-q-muted">{result}</span>}
    </div>
  );
}

// ── IndexNow Ping Dashboard ──────────────────────────────────────────────────

function PingDashboard() {
  const [bulkPinging, setBulkPinging] = useState(false);
  const [bulkResult, setBulkResult] = useState<PingResult | null>(null);
  const [manualUrl, setManualUrl] = useState("");
  const [manualPinging, setManualPinging] = useState(false);
  const [manualResult, setManualResult] = useState("");
  const [sitemapPinging, setSitemapPinging] = useState(false);
  const [sitemapResult, setSitemapResult] = useState("");

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

  async function pingSitemap() {
    setSitemapPinging(true);
    setSitemapResult("");
    try {
      const res = await fetch("/api/admin/ping-sitemap");
      const data = await res.json() as { results: { engine: string; ok: boolean; status: number }[]; error?: string };
      if (!res.ok) { setSitemapResult(`✗ ${data.error || "Failed"}`); return; }
      const parts = data.results.map(r => `${r.engine}: ${r.ok ? "✓ Pinged" : `✗ ${r.status}`}`);
      setSitemapResult(parts.join(" · "));
    } catch (e) {
      setSitemapResult(`✗ ${e instanceof Error ? e.message : "Failed"}`);
    } finally { setSitemapPinging(false); }
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-q-text">📡 IndexNow Ping Dashboard</h2>
          <p className="mt-1 text-xs text-q-muted">Ping search engines to crawl your pages faster. IndexNow covers Bing, Yandex, DuckDuckGo, and Ecosia.</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">

        {/* Bulk ping all */}
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 text-lg">🌐</span>
            <div>
              <p className="font-semibold text-q-text text-sm">Bulk Ping All Pages</p>
              <p className="text-xs text-q-muted">Tools + Calcs + AI + Blog + Compare</p>
            </div>
          </div>
          <button onClick={bulkPing} disabled={bulkPinging}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-60">
            {bulkPinging ? "Pinging all engines..." : "Ping All Pages →"}
          </button>
          {bulkResult && (
            <div className={`rounded-xl border p-3 text-xs ${bulkResult.success ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"}`}>
              {bulkResult.success && bulkResult.summary ? (
                <>
                  <p className="font-semibold">✓ Submitted {bulkResult.summary.total_urls_submitted} URLs</p>
                  <p className="mt-1">{bulkResult.summary.tools} tools · {bulkResult.summary.calculators} calcs · {bulkResult.summary.ai_tools} AI · {bulkResult.summary.blog_posts} blog</p>
                  {bulkResult.duration_ms && <p className="mt-1 opacity-70">{(bulkResult.duration_ms / 1000).toFixed(1)}s</p>}
                  {bulkResult.summary.errors.length > 0 && (
                    <p className="mt-1 text-amber-600">Errors: {bulkResult.summary.errors.join(", ")}</p>
                  )}
                </>
              ) : (
                <p>✗ {bulkResult.error}</p>
              )}
            </div>
          )}
        </div>

        {/* Google sitemap ping */}
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 text-lg">🔍</span>
            <div>
              <p className="font-semibold text-q-text text-sm">Ping Google Sitemap</p>
              <p className="text-xs text-q-muted">Notify Google of sitemap changes</p>
            </div>
          </div>
          <button onClick={pingSitemap} disabled={sitemapPinging}
            className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60">
            {sitemapPinging ? "Pinging Google..." : "Ping Google Sitemap →"}
          </button>
          {sitemapResult && (
            <div className={`rounded-xl border p-3 text-xs ${sitemapResult.startsWith("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"}`}>
              {sitemapResult}
            </div>
          )}
        </div>

        {/* Manual URL ping */}
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 text-lg">🎯</span>
            <div>
              <p className="font-semibold text-q-text text-sm">Ping Single URL</p>
              <p className="text-xs text-q-muted">IndexNow for a specific page</p>
            </div>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={manualUrl}
              onChange={e => setManualUrl(e.target.value)}
              placeholder="/tools/json-formatter"
              className="flex-1 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-xs text-q-text outline-none focus:border-purple-400/60 transition"
            />
            <button onClick={manualPing} disabled={manualPinging || !manualUrl.trim()}
              className="shrink-0 rounded-xl bg-purple-600 px-3 py-2 text-xs font-semibold text-white hover:bg-purple-700 transition disabled:opacity-60">
              {manualPinging ? "..." : "Ping"}
            </button>
          </div>
          {manualResult && (
            <div className={`rounded-xl border p-3 text-xs ${manualResult.includes("✓") ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400"}`}>
              {manualResult}
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-q-border bg-q-card p-5">
        <h3 className="text-sm font-semibold text-q-text mb-3">Quick Reference Links</h3>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Google Search Console", url: "https://search.google.com/search-console?resource_id=https://quickfnd.com", icon: "🔍" },
            { label: "Bing Webmaster Tools", url: "https://www.bing.com/webmasters?siteUrl=https://quickfnd.com", icon: "🅱️" },
            { label: "Google PageSpeed", url: "https://pagespeed.web.dev/analysis?url=https://quickfnd.com", icon: "⚡" },
            { label: "Sitemap", url: "https://quickfnd.com/sitemap.xml", icon: "🗺️" },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener"
              className="flex items-center gap-2 rounded-xl border border-q-border bg-q-bg px-3 py-2.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">
              <span>{link.icon}</span>
              <span>{link.label}</span>
              <span className="ml-auto text-q-muted">↗</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function BacklinksPage() {
  const [activeSection, setActiveSection] = useState<"ping" | "backlinks">("ping");
  const [category, setCategory] = useState("All");
  const [statuses, setStatuses] = useState<Record<string, Directory["status"]>>({});
  const [search, setSearch] = useState("");

  function setStatus(name: string, status: Directory["status"]) {
    setStatuses(prev => ({ ...prev, [name]: status }));
  }

  const filtered = DIRECTORIES.filter(d =>
    (category === "All" || d.category === category) &&
    (search === "" || d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()))
  );

  const pending = DIRECTORIES.filter(d => (statuses[d.name] || d.status) === "pending").length;
  const submitted = DIRECTORIES.filter(d => (statuses[d.name] || d.status) === "submitted").length;
  const approved = DIRECTORIES.filter(d => (statuses[d.name] || d.status) === "approved").length;

  return (
    <div className="space-y-8">

      {/* Section Toggle */}
      <div className="flex gap-2">
        <button onClick={() => setActiveSection("ping")}
          className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${activeSection === "ping" ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
          📡 Ping Dashboard
        </button>
        <button onClick={() => setActiveSection("backlinks")}
          className={`rounded-2xl border px-5 py-3 text-sm font-medium transition ${activeSection === "backlinks" ? "border-q-primary bg-q-primary text-white" : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"}`}>
          🔗 Backlink Tracker
        </button>
      </div>

      {/* Ping Dashboard Section */}
      {activeSection === "ping" && <PingDashboard />}

      {/* Backlink Tracker Section */}
      {activeSection === "backlinks" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-q-text">Backlink Tracker</h1>
              <p className="mt-1 text-sm text-q-muted">
                {DIRECTORIES.length} directories · {pending} pending · {submitted} submitted · {approved} approved
              </p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)}
                className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition w-40" />
              <GitHubSubmitButton />
            </div>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "High DA (80+)", value: DIRECTORIES.filter(d => d.da >= 80).length, color: "text-emerald-600" },
              { label: "Free submissions", value: DIRECTORIES.filter(d => d.type === "free").length, color: "text-blue-600" },
              { label: "Approved", value: approved, color: "text-purple-600" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl border border-q-border bg-q-card p-4">
                <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-q-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setCategory(cat)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${category === cat ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
                {cat}
              </button>
            ))}
          </div>

          {/* Priority note */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/40 px-5 py-3 text-sm text-q-muted dark:border-amber-500/20 dark:bg-amber-500/5">
            <strong className="text-q-text">Recommended order:</strong> Start with GitHub Awesome Lists → Hacker News → Product Hunt → AlternativeTo → Dev.to → Reddit. These give the highest quality backlinks fastest.
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
            <div className="divide-y divide-q-border">
              {filtered.map(dir => {
                const status = statuses[dir.name] || dir.status;
                return (
                  <div key={dir.name} className="p-5 space-y-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <a href={dir.url} target="_blank" rel="noopener" className="font-semibold text-q-text hover:text-blue-500 transition">
                            {dir.name}
                          </a>
                          <DABadge da={dir.da} />
                          <span className="text-xs text-q-muted rounded-full border border-q-border px-2 py-0.5">{dir.category}</span>
                          <span className={`text-xs rounded-full border px-2 py-0.5 ${dir.type === "paid" ? "text-red-600 border-red-200 bg-red-50 dark:bg-red-500/10" : dir.type === "freemium" ? "text-amber-600 border-amber-200 bg-amber-50 dark:bg-amber-500/10" : "text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-500/10"}`}>
                            {dir.type}
                          </span>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-q-muted max-w-2xl">{dir.notes}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center shrink-0">
                        <a href={dir.submitUrl.startsWith("http") ? dir.submitUrl : "#"} target="_blank" rel="noopener"
                          className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400">
                          Submit →
                        </a>
                        {(["pending", "submitted", "approved", "rejected"] as const).map(s => (
                          <button key={s} onClick={() => setStatus(dir.name, s)}
                            className={`rounded-xl border px-2.5 py-1.5 text-xs font-medium transition capitalize ${status === s ? STATUS_COLORS[s] + " border opacity-100" : "border-q-border bg-q-bg text-q-muted opacity-50 hover:opacity-100"}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submission template */}
          <div className="rounded-2xl border border-q-border bg-q-card p-6">
            <h2 className="font-semibold text-q-text mb-4">Standard Submission Template</h2>
            <div className="space-y-2 text-sm text-q-muted bg-q-bg rounded-xl p-4 font-mono">
              <p><strong>Name:</strong> QuickFnd</p>
              <p><strong>URL:</strong> https://quickfnd.com</p>
              <p><strong>Tagline:</strong> Free browser-based tools, calculators & AI utilities. No install, no account.</p>
              <p><strong>Description:</strong> QuickFnd offers 200+ free tools that run entirely in your browser — JSON formatter, EMI calculator, password generator, SHA256 hasher, GST calculator, SIP calculator, and more. No signup required, works offline, and your data never leaves your device.</p>
              <p><strong>Category:</strong> Developer Tools / Online Utilities</p>
              <p><strong>Tags:</strong> free tools, developer tools, calculators, browser tools, no-signup</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
