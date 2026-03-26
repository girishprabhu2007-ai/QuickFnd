"use client";

import React, { useEffect, useState } from "react";

type Comment = {
  id: number;
  post_slug: string;
  author_name: string;
  author_title?: string;
  author_id?: string;
  content: string;
  is_author_reply: boolean;
  created_at: string;
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function initials(name: string): string {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

type Props = { postSlug: string; authorId?: string | null };

export default function BlogInteractions({ postSlug, authorId }: Props) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [likePending, setLikePending] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Load likes count from localStorage
  useEffect(() => {
    const key = `liked_${postSlug}`;
    setLiked(localStorage.getItem(key) === "1");
  }, [postSlug]);

  // Load comments
  useEffect(() => {
    fetch(`/api/blog/comment?post_slug=${encodeURIComponent(postSlug)}`)
      .then(r => r.json())
      .then(d => { setComments(d.comments || []); setCommentsLoading(false); })
      .catch(() => setCommentsLoading(false));
  }, [postSlug]);

  async function toggleLike() {
    if (likePending) return;
    setLikePending(true);
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(c => newLiked ? c + 1 : Math.max(0, c - 1));
    localStorage.setItem(`liked_${postSlug}`, newLiked ? "1" : "0");
    try {
      const res = await fetch("/api/blog/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_slug: postSlug, action: newLiked ? "like" : "unlike" }),
      });
      const data = await res.json();
      if (data.likes_count !== undefined) setLikesCount(data.likes_count);
    } catch { /* silent */ }
    finally { setLikePending(false); }
  }

  async function submitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !commentText.trim()) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/blog/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_slug: postSlug, author_name: name, author_email: email || undefined, content: commentText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSubmitted(true);
      setCommentText("");
      setEmail("");
      // Optimistically add the comment to the list
      if (data.comment) setComments(prev => [...prev, data.comment]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Like button */}
      <div className="flex items-center gap-4 rounded-2xl border border-q-border bg-q-card px-6 py-4">
        <button
          onClick={toggleLike}
          disabled={likePending}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
            liked
              ? "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
              : "border border-q-border bg-q-bg text-q-muted hover:text-red-500 hover:border-red-200"
          }`}
        >
          <span className="text-lg">{liked ? "❤️" : "🤍"}</span>
          <span>{liked ? "Liked" : "Like this article"}</span>
          {likesCount > 0 && <span className="ml-1 text-xs">· {likesCount}</span>}
        </button>
        <p className="text-sm text-q-muted">Found this helpful? Give it a like to let the author know.</p>
      </div>

      {/* Comments section */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-q-text">
          Discussion
          {comments.length > 0 && <span className="ml-2 text-base font-normal text-q-muted">({comments.length})</span>}
        </h2>

        {/* Comment form */}
        <div className="rounded-2xl border border-q-border bg-q-card p-6">
          <h3 className="text-sm font-semibold text-q-text mb-4">Leave a comment</h3>
          {submitted ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400">
              ✓ Comment posted! The author may reply shortly.
            </div>
          ) : (
            <form onSubmit={submitComment} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-q-muted">Name *</label>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)} required
                    placeholder="Your name"
                    className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-q-muted">Email (optional)</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-q-muted">Comment *</label>
                <textarea
                  value={commentText} onChange={e => setCommentText(e.target.value)} required
                  rows={4} placeholder="Share your thoughts, ask a question, or add something the article missed..."
                  className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-blue-400/60 transition resize-y"
                />
              </div>
              {submitError && <p className="text-sm text-red-600">{submitError}</p>}
              <button
                type="submit" disabled={submitting || !name.trim() || !commentText.trim()}
                className="rounded-xl bg-q-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </form>
          )}
        </div>

        {/* Comments list */}
        {commentsLoading ? (
          <p className="text-sm text-q-muted">Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-q-muted">No comments yet — be the first to start the discussion.</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div
                key={comment.id}
                className={`rounded-2xl border p-5 ${
                  comment.is_author_reply
                    ? "border-blue-200/60 bg-blue-50/40 dark:border-blue-500/20 dark:bg-blue-500/5"
                    : "border-q-border bg-q-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    comment.is_author_reply ? "bg-blue-600 text-white" : "bg-q-bg border border-q-border text-q-muted"
                  }`}>
                    {initials(comment.author_name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-q-text">{comment.author_name}</span>
                      {comment.is_author_reply && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                          Author
                        </span>
                      )}
                      {comment.author_title && comment.is_author_reply && (
                        <span className="text-xs text-q-muted">{comment.author_title}</span>
                      )}
                      <span className="text-xs text-q-muted">{timeAgo(comment.created_at)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-q-muted">{comment.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}