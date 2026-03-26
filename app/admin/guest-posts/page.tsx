"use client";

import { useCallback, useEffect, useState } from "react";

type GuestPost = {
  id: number;
  contributor_name: string;
  contributor_email: string;
  title: string;
  slug: string;
  category: string;
  target_keyword: string;
  excerpt: string;
  content: string;
  tool_slug?: string;
  ai_score: number;
  ai_feedback: string;
  status: "pending_editorial" | "approved" | "rejected" | "published";
  submitted_at: string;
  rejection_reason?: string;
};

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 70) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
}

function scoreBg(score: number) {
  if (score >= 80) return "bg-emerald-50 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20";
  if (score >= 70) return "bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20";
  return "bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20";
}

export default function AdminGuestPostsPage() {
  const [posts, setPosts] = useState<GuestPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending_editorial");
  const [previewing, setPreviewing] = useState<GuestPost | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [publishResult, setPublishResult] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/guest-posts?status=${filter}`, { cache: "no-store" });
      const data = await res.json();
      setPosts(data.posts || []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approveAndPublish(post: GuestPost) {
    setActionPending(true);
    try {
      const res = await fetch("/api/admin/guest-posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, action: "publish" }),
      });
      const data = await res.json();
      setPublishResult(prev => ({
        ...prev,
        [post.id]: data.success ? `✓ Published at /blog/${data.slug}` : `✗ ${data.error}`,
      }));
      if (data.success) load();
    } catch { setPublishResult(prev => ({ ...prev, [post.id]: "✗ Failed" })); }
    finally { setActionPending(false); }
  }

  async function rejectPost(id: number) {
    if (!rejectReason.trim()) return;
    setActionPending(true);
    await fetch("/api/admin/guest-posts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejected", rejection_reason: rejectReason }),
    });
    setRejecting(null);
    setRejectReason("");
    setActionPending(false);
    load();
  }

  const pendingCount = posts.filter(p => p.status === "pending_editorial").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Guest Post Review</h1>
          <p className="mt-1 text-sm text-q-muted">
            {pendingCount > 0 ? `${pendingCount} awaiting editorial review` : "Queue is clear"} ·{" "}
            <a href="/submit-article" target="_blank" rel="noopener" className="text-blue-500 hover:text-blue-400">Submission page →</a>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["pending_editorial", "approved", "rejected", "published"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === s ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
              {s.replace("_", " ")}
            </button>
          ))}
          <button onClick={load} className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">↻</button>
        </div>
      </div>

      {/* Review criteria reminder */}
      {filter === "pending_editorial" && (
        <div className="rounded-2xl border border-blue-200/60 bg-blue-50/40 px-5 py-3 text-sm text-q-muted dark:border-blue-500/20 dark:bg-blue-500/5">
          These articles passed AI review (score ≥ 70). Review for final quality, accuracy, and brand fit before publishing.
        </div>
      )}

      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-sm text-q-muted">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="px-6 py-8 text-sm text-q-muted">No {filter.replace("_", " ")} posts.</div>
        ) : (
          <div className="divide-y divide-q-border">
            {posts.map(post => (
              <div key={post.id} className="p-6 space-y-4">
                {/* Post header */}
                <div className="flex flex-wrap items-start gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-q-text truncate">{post.title}</h3>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-q-muted">
                      <span>By {post.contributor_name}</span>
                      <span>· {post.contributor_email}</span>
                      <span>· {post.category}</span>
                      <span>· 🎯 {post.target_keyword}</span>
                      {post.tool_slug && <span>· 🔧 {post.tool_slug}</span>}
                    </div>
                  </div>
                  {/* AI Score badge */}
                  <div className={`rounded-xl border px-4 py-2 text-center ${scoreBg(post.ai_score)}`}>
                    <div className={`text-2xl font-bold ${scoreColor(post.ai_score)}`}>{post.ai_score}</div>
                    <div className="text-xs text-q-muted">AI Score</div>
                  </div>
                </div>

                {/* AI feedback */}
                <div className="rounded-xl border border-q-border bg-q-bg px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-1">AI Review Feedback</p>
                  <p className="text-sm text-q-muted">{post.ai_feedback}</p>
                </div>

                {/* Excerpt */}
                <p className="text-sm text-q-muted italic">"{post.excerpt}"</p>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 items-center">
                  <button onClick={() => setPreviewing(previewing?.id === post.id ? null : post)}
                    className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-xs font-medium text-q-muted hover:text-q-text transition">
                    {previewing?.id === post.id ? "Close Preview" : "Preview Article"}
                  </button>
                  {post.status === "pending_editorial" && (
                    <>
                      <button onClick={() => approveAndPublish(post)} disabled={actionPending}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60">
                        Approve & Publish
                      </button>
                      <button onClick={() => setRejecting(post.id)}
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-600 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/5">
                        Reject
                      </button>
                    </>
                  )}
                  {publishResult[post.id] && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">{publishResult[post.id]}</span>
                  )}
                </div>

                {/* Article preview */}
                {previewing?.id === post.id && (
                  <div className="rounded-2xl border border-q-border bg-q-bg p-5 max-h-96 overflow-y-auto">
                    <pre className="text-xs text-q-muted whitespace-pre-wrap font-mono leading-5">{post.content.slice(0, 5000)}{post.content.length > 5000 ? "\n\n[... truncated for preview ...]" : ""}</pre>
                  </div>
                )}

                {/* Reject form */}
                {rejecting === post.id && (
                  <div className="rounded-2xl border border-red-200 bg-red-50/40 p-4 space-y-3 dark:border-red-500/20 dark:bg-red-500/5">
                    <p className="text-sm font-medium text-q-text">Rejection reason (shown to contributor):</p>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                      placeholder="Thank you for your submission. Unfortunately we can't publish this because..."
                      className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none resize-y"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => rejectPost(post.id)} disabled={!rejectReason.trim() || actionPending}
                        className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition disabled:opacity-60">
                        Confirm Reject
                      </button>
                      <button onClick={() => { setRejecting(null); setRejectReason(""); }}
                        className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-xs text-q-muted hover:text-q-text transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}