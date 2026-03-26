"use client";

import React, { useState } from "react";

const TOPICS = [
  "Developer Tools & Programming",
  "Personal Finance (India)",
  "Tax Planning & Compliance",
  "Investment & Wealth Building",
  "SEO & Digital Marketing",
  "UI/UX & CSS Design",
  "Cybersecurity",
  "Health & Wellness",
  "DevOps & Infrastructure",
  "Data Science & Analytics",
  "Other",
];

export default function WriteForUsForm() {
  const [form, setForm] = useState({
    name: "", email: "", title: "", location: "",
    years_experience: "", topic_area: "",
    linkedin: "", twitter: "",
    bio: "", writing_sample_url: "", topic_pitch: "",
    why_quickfnd: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.bio || !form.topic_pitch) {
      setError("Please fill all required fields.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/author-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
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
        <div className="text-4xl mb-4">🎉</div>
        <h2 className="text-xl font-semibold text-q-text">Application submitted!</h2>
        <p className="mt-2 text-sm text-q-muted max-w-md mx-auto">
          Thank you for applying. We review applications within 3–5 business days and will reach out to you at {form.email}.
        </p>
      </div>
    );
  }

  const inputCls = "w-full rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm text-q-text outline-none focus:border-blue-400/60 transition placeholder:text-q-muted";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-q-muted mb-1.5";

  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-xl font-semibold text-q-text mb-6">Contributor Application</h2>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal info */}
        <div>
          <h3 className="text-sm font-semibold text-q-text mb-4 pb-2 border-b border-q-border">About You</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Full Name *</label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Arjun Sharma" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="you@example.com" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Professional Title *</label>
              <input type="text" value={form.title} onChange={e => set("title", e.target.value)} required placeholder="Senior Developer, Finance Writer..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Location *</label>
              <input type="text" value={form.location} onChange={e => set("location", e.target.value)} required placeholder="Mumbai, India" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Years of Experience *</label>
              <input type="number" min="1" max="40" value={form.years_experience} onChange={e => set("years_experience", e.target.value)} required placeholder="5" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Primary Topic Area *</label>
              <select value={form.topic_area} onChange={e => set("topic_area", e.target.value)} required className={inputCls}>
                <option value="">Select a topic...</option>
                {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>LinkedIn Profile</label>
              <input type="url" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Twitter / X</label>
              <input type="text" value={form.twitter} onChange={e => set("twitter", e.target.value)} placeholder="@handle" className={inputCls} />
            </div>
          </div>
        </div>

        {/* Writing */}
        <div>
          <h3 className="text-sm font-semibold text-q-text mb-4 pb-2 border-b border-q-border">Your Writing</h3>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>Short Bio * <span className="normal-case font-normal text-q-muted">(2-4 sentences — this appears on your public author profile)</span></label>
              <textarea value={form.bio} onChange={e => set("bio", e.target.value)} required rows={3} placeholder="I've spent 7 years in financial planning and now write to make India's complex tax landscape understandable for salaried professionals..." className={`${inputCls} resize-y`} />
            </div>
            <div>
              <label className={labelCls}>Writing Sample URL</label>
              <input type="url" value={form.writing_sample_url} onChange={e => set("writing_sample_url", e.target.value)} placeholder="Link to an article, blog post, or portfolio..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Article Topic Pitch * <span className="normal-case font-normal text-q-muted">(describe 1-2 articles you'd write for QuickFnd)</span></label>
              <textarea value={form.topic_pitch} onChange={e => set("topic_pitch", e.target.value)} required rows={4} placeholder="I'd like to write 'How to calculate your HRA exemption step by step' — targeting salaried employees who overpay income tax by not claiming HRA correctly. I'd link to QuickFnd's HRA calculator throughout..." className={`${inputCls} resize-y`} />
            </div>
            <div>
              <label className={labelCls}>Why QuickFnd? *</label>
              <textarea value={form.why_quickfnd} onChange={e => set("why_quickfnd", e.target.value)} required rows={3} placeholder="Why do you want to write for us specifically?" className={`${inputCls} resize-y`} />
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={submitting}
          className="w-full rounded-xl bg-q-primary px-6 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60">
          {submitting ? "Submitting..." : "Submit Application"}
        </button>

        <p className="text-xs text-q-muted text-center">
          We review every application personally. No spam, no auto-rejections.
        </p>
      </form>
    </div>
  );
}