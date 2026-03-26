"use client";

import { useState } from "react";

const CATEGORIES = [
  { value: "how-to", label: "How-To Guide" },
  { value: "tools-guide", label: "Tools Guide" },
  { value: "calculator-guide", label: "Calculator Guide" },
  { value: "developer-guide", label: "Developer Guide" },
  { value: "finance-guide", label: "Finance Guide" },
  { value: "seo-guide", label: "SEO Guide" },
  { value: "comparison", label: "Comparison" },
  { value: "pillar", label: "Complete Guide / Pillar" },
];

type ReviewResult = {
  score: number;
  passed: boolean;
  feedback: string;
  breakdown: Record<string, { score: number; max: number; note: string }>;
};

export default function SubmitArticleForm() {
  const [form, setForm] = useState({
    contributor_email: "",
    contributor_name: "",
    title: "", slug: "",
    category: "how-to",
    target_keyword: "",
    excerpt: "",
    content: "",
    tool_slug: "",
  });
  const [reviewing, setReviewing] = useState(false);
  const [review, setReview] = useState<ReviewResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
    // Auto-generate slug from title
    if (key === "title") {
      setForm(f => ({
        ...f,
        title: value,
        slug: value.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 70),
      }));
    }
  }

  async function runAIReview() {
    if (!form.content || !form.title || !form.target_keyword) {
      setError("Title, target keyword, and content are required for review.");
      return;
    }
    setReviewing(true);
    setError("");
    setReview(null);
    try {
      const res = await fetch("/api/guest-post-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          target_keyword: form.target_keyword,
          category: form.category,
          excerpt: form.excerpt,
          tool_slug: form.tool_slug,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setReview(data.review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "AI review failed");
    } finally {
      setReviewing(false);
    }
  }

  async function submitArticle() {
    if (!review?.passed) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/guest-post-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, ai_score: review.score, ai_feedback: review.feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-8 text-center dark:border-emerald-500/20 dark:bg-emerald-500/5">
        <div className="text-4xl mb-4">✅</div>
        <h2 className="text-xl font-semibold text-q-text">Article submitted for editorial review!</h2>
        <p className="mt-2 text-sm text-q-muted">Your article passed AI review (score: {review?.score}/100) and is now in the editorial queue. We'll reach out within 3 business days.</p>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition placeholder:text-q-muted";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-q-muted mb-1.5";

  const wordCount = form.content.trim().split(/\s+/).filter(Boolean).length;
  const scoreColor = review ? (review.score >= 80 ? "text-emerald-600" : review.score >= 60 ? "text-amber-600" : "text-red-600") : "";

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8 space-y-6">
        <h2 className="font-semibold text-q-text">Your Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Your Name *</label>
            <input type="text" value={form.contributor_name} onChange={e => set("contributor_name", e.target.value)} required className={inputCls} placeholder="Full name" />
          </div>
          <div>
            <label className={labelCls}>Your Email *</label>
            <input type="email" value={form.contributor_email} onChange={e => set("contributor_email", e.target.value)} required className={inputCls} placeholder="Approved contributor email" />
          </div>
        </div>

        <h2 className="font-semibold text-q-text pt-2 border-t border-q-border">Article Details</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Title *</label>
            <input type="text" value={form.title} onChange={e => set("title", e.target.value)} required className={inputCls} placeholder="How to Calculate EMI for Your Home Loan in India" />
          </div>
          <div>
            <label className={labelCls}>URL Slug (auto-generated)</label>
            <input type="text" value={form.slug} onChange={e => set("slug", e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>Category *</label>
            <select value={form.category} onChange={e => set("category", e.target.value)} className={inputCls}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className={labelCls}>Target Keyword *</label>
            <input type="text" value={form.target_keyword} onChange={e => set("target_keyword", e.target.value)} required className={inputCls} placeholder="how to calculate emi home loan india" />
          </div>
          <div>
            <label className={labelCls}>Related QuickFnd Tool Slug</label>
            <input type="text" value={form.tool_slug} onChange={e => set("tool_slug", e.target.value)} className={inputCls} placeholder="emi-calculator" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Excerpt / Meta Description * <span className="normal-case font-normal text-q-muted">(140-160 chars)</span></label>
            <textarea value={form.excerpt} onChange={e => set("excerpt", e.target.value)} required rows={2} className={`${inputCls} resize-none`} placeholder="2 compelling sentences that include your keyword..." />
            <p className="mt-1 text-xs text-q-muted">{form.excerpt.length} / 160</p>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls}>Article Content * <span className="normal-case font-normal text-q-muted">(Markdown supported)</span></label>
            <span className={`text-xs font-medium ${wordCount >= 900 ? "text-emerald-600" : "text-amber-600"}`}>
              {wordCount} words {wordCount < 900 ? `(need ${900 - wordCount} more)` : "✓"}
            </span>
          </div>
          <textarea
            value={form.content}
            onChange={e => set("content", e.target.value)}
            required
            rows={20}
            className={`${inputCls} resize-y font-mono text-xs`}
            placeholder="## Introduction&#10;&#10;Write your article in Markdown...&#10;&#10;## Section Heading&#10;&#10;Your content here...&#10;&#10;## Another Section&#10;..."
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600 dark:text-red-400 px-1">{error}</p>}

      {/* AI Review result */}
      {review && (
        <div className={`rounded-2xl border p-6 ${review.passed ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5" : "border-red-200 bg-red-50/40 dark:border-red-500/20 dark:bg-red-500/5"}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-q-text">AI Content Review Result</h3>
            <div className={`text-3xl font-bold ${scoreColor}`}>{review.score}<span className="text-sm font-normal text-q-muted">/100</span></div>
          </div>
          <p className={`text-sm mb-4 ${review.passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
            {review.passed ? "✓ Passed — ready for editorial review" : "✗ Did not pass — please address the feedback below"}
          </p>
          <p className="text-sm text-q-muted mb-4">{review.feedback}</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {Object.entries(review.breakdown).map(([key, val]) => {
            const v = val as { score: number; max: number; note: string };
            return (
              <div key={key} className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-2">
                <span className="text-xs font-medium text-q-text capitalize">{key.replace(/_/g, " ")}</span>
                <span className={`text-xs font-semibold ${v.score >= v.max * 0.7 ? "text-emerald-600" : "text-red-500"}`}>
                  {v.score}/{v.max}
                </span>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button onClick={runAIReview} disabled={reviewing || !form.content || !form.title}
          className="rounded-xl border border-blue-300 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 hover:bg-blue-100 transition disabled:opacity-60 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
          {reviewing ? "Running AI Review..." : "Run AI Review First"}
        </button>
        {review?.passed && (
          <button onClick={submitArticle} disabled={submitting}
            className="rounded-xl bg-q-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60">
            {submitting ? "Submitting..." : "Submit for Editorial Review →"}
          </button>
        )}
      </div>

      <p className="text-xs text-q-muted">
        The AI review runs in ~15 seconds. If your article doesn't pass, revise based on the feedback and re-run the review before submitting.
      </p>
    </div>
  );
}