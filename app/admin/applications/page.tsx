"use client";

import { useCallback, useEffect, useState } from "react";

type Application = {
  id: number;
  name: string;
  email: string;
  title: string;
  location: string;
  years_experience: number;
  topic_area: string;
  linkedin?: string;
  twitter?: string;
  bio: string;
  writing_sample_url?: string;
  topic_pitch: string;
  why_quickfnd: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at?: string;
  rejection_reason?: string;
};

function timeAgo(d: string) {
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 3600) return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  approved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  rejected: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
};

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionPending, setActionPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/applications?status=${filter}`, { cache: "no-store" });
      const data = await res.json();
      setApps(data.applications || []);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function approve(id: number) {
    setActionPending(true);
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "approved" }),
    });
    setActionPending(false);
    load();
  }

  async function reject(id: number) {
    if (!rejectReason.trim()) return;
    setActionPending(true);
    await fetch("/api/admin/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "rejected", rejection_reason: rejectReason }),
    });
    setRejecting(null);
    setRejectReason("");
    setActionPending(false);
    load();
  }

  const pendingCount = apps.filter(a => a.status === "pending").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Author Applications</h1>
          <p className="mt-1 text-sm text-q-muted">
            {pendingCount > 0 ? `${pendingCount} pending review` : "No pending applications"} ·{" "}
            <a href="/write-for-us" target="_blank" rel="noopener" className="text-blue-500 hover:text-blue-400">
              View public page →
            </a>
          </p>
        </div>
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition ${filter === s ? "bg-q-primary text-white" : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"}`}>
              {s}
            </button>
          ))}
          <button onClick={load} className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">↻</button>
        </div>
      </div>

      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        {loading ? (
          <div className="px-6 py-8 text-sm text-q-muted">Loading...</div>
        ) : apps.length === 0 ? (
          <div className="px-6 py-8 text-sm text-q-muted">No {filter} applications.</div>
        ) : (
          <div className="divide-y divide-q-border">
            {apps.map(app => (
              <div key={app.id} className="p-6">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-q-text">{app.name}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLORS[app.status]}`}>{app.status}</span>
                      <span className="text-xs text-q-muted">{app.topic_area}</span>
                      <span className="text-xs text-q-muted">· {app.location}</span>
                      <span className="text-xs text-q-muted">· {app.years_experience}y exp</span>
                    </div>
                    <div className="mt-1 flex gap-3 text-xs text-q-muted">
                      <span>{app.email}</span>
                      <span>· {timeAgo(app.submitted_at)}</span>
                      {app.linkedin && <a href={app.linkedin} target="_blank" rel="noopener" className="text-blue-500 hover:text-blue-400">LinkedIn</a>}
                      {app.twitter && <span className="text-blue-500">{app.twitter}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setExpanded(expanded === app.id ? null : app.id)}
                      className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">
                      {expanded === app.id ? "Collapse" : "Read Full"}
                    </button>
                    {app.status === "pending" && (
                      <>
                        <button onClick={() => approve(app.id)} disabled={actionPending}
                          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-60">
                          Approve
                        </button>
                        <button onClick={() => setRejecting(app.id)}
                          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/5">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expanded === app.id && (
                  <div className="mt-5 space-y-4 rounded-2xl border border-q-border bg-q-bg p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-1">Bio</p>
                      <p className="text-sm text-q-muted leading-6">{app.bio}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-1">Topic Pitch</p>
                      <p className="text-sm text-q-muted leading-6">{app.topic_pitch}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-1">Why QuickFnd</p>
                      <p className="text-sm text-q-muted leading-6">{app.why_quickfnd}</p>
                    </div>
                    {app.writing_sample_url && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-1">Writing Sample</p>
                        <a href={app.writing_sample_url} target="_blank" rel="noopener" className="text-sm text-blue-500 hover:text-blue-400 break-all">
                          {app.writing_sample_url}
                        </a>
                      </div>
                    )}
                    {app.rejection_reason && (
                      <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-500/20 dark:bg-red-500/5">
                        <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-1">Rejection Reason</p>
                        <p className="text-sm text-q-muted">{app.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Rejection form */}
                {rejecting === app.id && (
                  <div className="mt-4 space-y-3 rounded-2xl border border-red-200 bg-red-50/40 p-4 dark:border-red-500/20 dark:bg-red-500/5">
                    <p className="text-sm font-medium text-q-text">Rejection reason (shown to applicant):</p>
                    <textarea
                      value={rejectReason}
                      onChange={e => setRejectReason(e.target.value)}
                      rows={3}
                      placeholder="Thank you for applying. Unfortunately..."
                      className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text outline-none focus:border-red-400/60 transition resize-y"
                    />
                    <div className="flex gap-3">
                      <button onClick={() => reject(app.id)} disabled={!rejectReason.trim() || actionPending}
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