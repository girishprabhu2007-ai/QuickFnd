"use client";

import React, { useCallback, useEffect, useState } from "react";

type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  status: string;
  target_keyword: string | null;
  reading_time_minutes: number;
  published_at: string | null;
  created_at: string;
  source: string;
  tool_slug: string | null;
};

const STATUS_COLORS: Record<string, string> = {
  published: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  draft: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  archived: "bg-q-bg text-q-muted",
};

const SEED_TOPICS = [
  { keyword: "how to minify html online", tool_slug: "html-minifier", tool_name: "HTML Minifier" },
  { keyword: "how to validate email addresses in bulk", tool_slug: "email-validator", tool_name: "Email Validator" },
  { keyword: "how to generate css box shadow", tool_slug: "box-shadow-generator", tool_name: "Box Shadow Generator" },
  { keyword: "how to calculate emi for home loan india", tool_slug: "emi-calculator", tool_name: "EMI Calculator" },
  { keyword: "how to calculate gst india 2025", tool_slug: "gst-calculator", tool_name: "GST Calculator" },
  { keyword: "how to format json online", tool_slug: "json-formatter", tool_name: "JSON Formatter" },
  { keyword: "how to encode decode base64 online", tool_slug: "base64-encoder", tool_name: "Base64 Encoder" },
  { keyword: "how to generate qr code for free", tool_slug: "qr-generator", tool_name: "QR Generator" },
  { keyword: "how to calculate bmi online", tool_slug: "bmi-calculator", tool_name: "BMI Calculator" },
  { keyword: "complete guide to income tax calculation india fy 2025-26", tool_slug: "income-tax-calculator", tool_name: "Income Tax Calculator" },
];

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [genKeyword, setGenKeyword] = useState("");
  const [genToolSlug, setGenToolSlug] = useState("");
  const [genToolName, setGenToolName] = useState("");
  const [genResult, setGenResult] = useState<{ success: boolean; slug?: string; title?: string; error?: string } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("published");
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const qs = statusFilter !== "all" ? `?status=${statusFilter}` : "";
      const res = await fetch(`/api/admin/blog${qs}`, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPosts(data.posts || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  async function generate(keyword?: string, toolSlug?: string, toolName?: string) {
    const kw = keyword ?? genKeyword.trim();
    if (!kw) return;
    setGenerating(true);
    setGenResult(null);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: kw, tool_slug: (toolSlug ?? genToolSlug) || undefined, tool_name: (toolName ?? genToolName) || undefined, source: "manual" }),
      });
      const data = await res.json();
      setGenResult(data);
      if (data.success) { setGenKeyword(""); setGenToolSlug(""); setGenToolName(""); loadPosts(); }
    } catch (err) {
      setGenResult({ success: false, error: err instanceof Error ? err.message : "Failed" });
    } finally {
      setGenerating(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    await fetch("/api/admin/blog", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    loadPosts();
  }

  async function deletePost(id: number, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    await fetch(`/api/admin/blog?id=${id}`, { method: "DELETE" });
    loadPosts();
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Blog</h1>
          <p className="mt-1 text-sm text-q-muted">{total} total articles · Auto-published daily at 4am UTC</p>
        </div>
        <a href="/blog" target="_blank" rel="noopener" className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
          View Live Blog →
        </a>
      </div>

      {/* Generate Article */}
      <div className="rounded-2xl border border-q-border bg-q-card p-6 space-y-4">
        <h2 className="font-semibold text-q-text">Generate New Article</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            type="text" value={genKeyword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGenKeyword(e.target.value)}
            placeholder="Target keyword e.g. how to minify html online"
            className="sm:col-span-3 rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
          />
          <input
            type="text" value={genToolSlug} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGenToolSlug(e.target.value)}
            placeholder="Tool slug (optional) e.g. html-minifier"
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
          />
          <input
            type="text" value={genToolName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGenToolName(e.target.value)}
            placeholder="Tool name e.g. HTML Minifier"
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
          />
          <button onClick={() => generate()} disabled={!genKeyword.trim() || generating}
            className="rounded-xl bg-q-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60">
            {generating ? "Generating…" : "Generate Article"}
          </button>
        </div>
        {genResult && (
          <div className={`rounded-xl border px-4 py-3 text-sm ${genResult.success ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400" : "border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/5 dark:text-red-400"}`}>
            {genResult.success ? `✓ Published: "${genResult.title}" at /blog/${genResult.slug}` : `✗ ${genResult.error}`}
          </div>
        )}

        {/* Quick seeds */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-q-muted">Quick generate from seed topics</p>
          <div className="flex flex-wrap gap-2">
            {SEED_TOPICS.map(t => (
              <button key={t.keyword} onClick={() => generate(t.keyword, t.tool_slug, t.tool_name)} disabled={generating}
                className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-left text-xs text-q-muted hover:bg-q-card-hover hover:text-q-text transition disabled:opacity-60 max-w-[260px] truncate">
                {t.keyword}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts list */}
      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-q-border px-6 py-4">
          <h2 className="font-semibold text-q-text">Articles</h2>
          <div className="flex gap-2">
            {["all", "published", "draft", "archived"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${statusFilter === s ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
                {s}
              </button>
            ))}
            <button onClick={loadPosts} className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">↻</button>
          </div>
        </div>

        {error && <div className="px-6 py-3 text-sm text-red-600">{error}</div>}
        {loading ? (
          <div className="px-6 py-8 text-sm text-q-muted">Loading…</div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-8 text-sm text-q-muted">No articles yet. Generate your first one above.</div>
        ) : (
          <div className="divide-y divide-q-border">
            {posts.map(post => (
              <div key={post.id} className="flex flex-wrap items-start justify-between gap-3 px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[post.status] || ""}`}>{post.status}</span>
                    <span className="text-xs text-q-muted capitalize">{post.category.replace(/-/g, " ")}</span>
                    <span className="text-xs text-q-muted">{post.reading_time_minutes}min</span>
                    {post.source === "auto-pipeline" && <span className="text-xs text-q-muted">auto</span>}
                  </div>
                  <p className="font-medium text-q-text text-sm truncate">{post.title}</p>
                  <p className="text-xs text-q-muted mt-0.5 truncate">/blog/{post.slug}</p>
                  {post.target_keyword && <p className="text-xs text-blue-500 mt-0.5 truncate">🎯 {post.target_keyword}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {post.status === "published" && (
                    <a href={`/blog/${post.slug}`} target="_blank" rel="noopener"
                      className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">View</a>
                  )}
                  {post.status !== "published" && (
                    <button onClick={() => updateStatus(post.id, "published")}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition">Publish</button>
                  )}
                  {post.status === "published" && (
                    <button onClick={() => updateStatus(post.id, "archived")}
                      className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">Archive</button>
                  )}
                  <button onClick={() => deletePost(post.id, post.title)}
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}