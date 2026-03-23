"use client";

import { useEffect, useState } from "react";

type RequestItem = {
  id: number;
  requested_name: string;
  requested_category: "tool" | "calculator" | "ai-tool";
  description: string;
  requester_name: string | null;
  requester_email: string | null;
  ai_summary: string | null;
  ai_verdict: "build-now" | "needs-engine" | "not-recommended" | "pending";
  recommended_category: "tool" | "calculator" | "ai-tool" | null;
  recommended_engine: string | null;
  status: "pending" | "reviewed" | "implemented" | "rejected";
  created_public_slug: string | null;
  mode: "request" | "report" | null;
  ref_slug: string | null;
  report_type: string | null;
  admin_note?: string | null;
  created_at?: string | null;
};

type Tab = "all" | "requests" | "reports" | "pending" | "implemented" | "rejected";

const STATUS_COLORS: Record<string, string> = {
  pending: "border-amber-300 bg-amber-50 text-amber-700",
  reviewed: "border-blue-300 bg-blue-50 text-blue-700",
  implemented: "border-green-300 bg-green-50 text-green-700",
  rejected: "border-red-300 bg-red-50 text-red-700",
};

const VERDICT_COLORS: Record<string, string> = {
  "build-now": "border-green-300 bg-green-50 text-green-700",
  "needs-engine": "border-amber-300 bg-amber-50 text-amber-700",
  "not-recommended": "border-red-300 bg-red-50 text-red-700",
  pending: "border-q-border bg-q-bg text-q-muted",
};

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${color}`}>
      {text}
    </span>
  );
}

export default function AdminRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [adminNote, setAdminNote] = useState<Record<number, string>>({});
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/tool-requests", { cache: "no-store" });
      const data = await res.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(item: RequestItem, status: RequestItem["status"]) {
    setUpdatingId(item.id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/update-request-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, status, admin_note: adminNote[item.id] || "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage(`✓ ${item.requested_name} marked as ${status}`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function createFromRequest(item: RequestItem) {
    if (!item.recommended_category) return;
    setCreatingId(item.id);
    setMessage("");
    try {
      const res = await fetch("/api/admin/create-tool", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: item.requested_name,
          category: item.recommended_category,
          requestId: item.id,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Create failed.");
      setMessage(data.alreadyExists ? `Already exists: ${data.path}` : `✓ Created: ${data.path}`);
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Create failed.");
    } finally {
      setCreatingId(null);
    }
  }

  function copyEmail(item: RequestItem) {
    const text = `Hi ${item.requester_name || "there"},\n\nThank you for your ${item.mode === "report" ? "report" : "request"} regarding "${item.requested_name}" on QuickFnd.\n\n${item.status === "implemented" ? "We have implemented this tool." : item.status === "rejected" ? "After review, we are unable to add this at this time." : "We are reviewing your submission."}\n\nThanks,\nQuickFnd Team`;
    navigator.clipboard.writeText(text);
    setMessage("✓ Email template copied to clipboard");
  }

  const filtered = items.filter((item) => {
    if (activeTab === "requests") return item.mode !== "report";
    if (activeTab === "reports") return item.mode === "report";
    if (activeTab === "pending") return item.status === "pending";
    if (activeTab === "implemented") return item.status === "implemented";
    if (activeTab === "rejected") return item.status === "rejected";
    return true;
  });

  const counts = {
    all: items.length,
    requests: items.filter((i) => i.mode !== "report").length,
    reports: items.filter((i) => i.mode === "report").length,
    pending: items.filter((i) => i.status === "pending").length,
    implemented: items.filter((i) => i.status === "implemented").length,
    rejected: items.filter((i) => i.status === "rejected").length,
  };

  const tabs: { key: Tab; label: string; urgent?: boolean }[] = [
    { key: "pending", label: `Pending (${counts.pending})`, urgent: counts.pending > 0 },
    { key: "reports", label: `Reports (${counts.reports})` },
    { key: "requests", label: `Requests (${counts.requests})` },
    { key: "implemented", label: `Implemented (${counts.implemented})` },
    { key: "rejected", label: `Rejected (${counts.rejected})` },
    { key: "all", label: `All (${counts.all})` },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-q-text">Requests & Reports</h2>
            <p className="mt-2 text-sm text-q-muted">
              Manage tool requests and reports from users. Use the workflow below to review,
              create, or reject each item. Reply templates available for user communication.
            </p>
          </div>
          <button
            onClick={load}
            className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[
            { label: "Total", count: counts.all, color: "text-q-text" },
            { label: "Pending", count: counts.pending, color: counts.pending > 0 ? "text-amber-600" : "text-q-muted" },
            { label: "Requests", count: counts.requests, color: "text-blue-600" },
            { label: "Reports", count: counts.reports, color: counts.reports > 0 ? "text-red-600" : "text-q-muted" },
            { label: "Built", count: counts.implemented, color: "text-green-600" },
            { label: "Rejected", count: counts.rejected, color: "text-q-muted" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-q-border bg-q-bg p-3 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.count}</div>
              <div className="mt-1 text-xs text-q-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Message */}
      {message && (
        <div className="rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text">
          {message}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
              activeTab === tab.key
                ? "border-blue-400 bg-blue-600 text-white"
                : tab.urgent
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-q-border bg-q-card text-q-text hover:bg-q-card-hover"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items */}
      {loading ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-sm text-q-muted">
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-q-border bg-q-card p-8 text-center text-sm text-q-muted">
          No items in this category.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((item) => {
            const isReport = item.mode === "report";
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-q-card ${
                  isReport ? "border-red-200" : "border-q-border"
                }`}
                style={isReport ? { borderColor: "rgba(239,68,68,0.2)" } : undefined}
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-q-text">{item.requested_name}</span>
                      {isReport && <Badge text="Report" color="border-red-300 bg-red-50 text-red-700" />}
                      <Badge text={item.requested_category} color="border-q-border bg-q-bg text-q-muted" />
                      <Badge text={item.status} color={STATUS_COLORS[item.status] ?? "border-q-border bg-q-bg text-q-muted"} />
                      {item.ai_verdict && item.ai_verdict !== "pending" && (
                        <Badge text={item.ai_verdict} color={VERDICT_COLORS[item.ai_verdict] ?? ""} />
                      )}
                    </div>

                    <p className="mt-2 text-sm text-q-muted line-clamp-2">{item.description}</p>

                    {item.ref_slug && (
                      <p className="mt-1 text-xs text-q-muted">
                        Tool reported:{" "}
                        <a
                          href={`/${item.requested_category === "calculator" ? "calculators" : item.requested_category === "ai-tool" ? "ai-tools" : "tools"}/${item.ref_slug}`}
                          target="_blank"
                          className="font-medium text-blue-500 underline"
                        >
                          /{item.ref_slug}
                        </a>
                      </p>
                    )}

                    {item.created_at && (
                      <p className="mt-1 text-xs text-q-muted">
                        {new Date(item.created_at).toLocaleDateString("en-GB", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="shrink-0 rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted transition hover:bg-q-card-hover"
                  >
                    {isExpanded ? "Collapse ↑" : "Expand ↓"}
                  </button>
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-q-border p-5 space-y-5">

                    {/* Full description */}
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-q-muted mb-1">Full Description</div>
                      <p className="text-sm text-q-text leading-6">{item.description}</p>
                    </div>

                    {/* AI Assessment */}
                    {item.ai_summary && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4"
                        style={{ borderColor: "rgba(37,99,235,0.15)", background: "rgba(37,99,235,0.04)" }}>
                        <div className="text-xs font-semibold uppercase tracking-wide text-blue-700 mb-1">AI Assessment</div>
                        <p className="text-sm text-q-text">{item.ai_summary}</p>
                        {item.recommended_engine && (
                          <p className="mt-1 text-xs text-q-muted">
                            Recommended engine: <span className="font-mono text-q-text">{item.recommended_engine}</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Requester info */}
                    {(item.requester_name || item.requester_email) && (
                      <div className="flex flex-wrap gap-4 text-sm">
                        {item.requester_name && (
                          <span className="text-q-muted">Name: <strong className="text-q-text">{item.requester_name}</strong></span>
                        )}
                        {item.requester_email && (
                          <span className="text-q-muted">
                            Email: <a href={`mailto:${item.requester_email}`} className="font-medium text-blue-500">{item.requester_email}</a>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Admin note */}
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wide text-q-muted mb-1">
                        Admin Note (internal)
                      </label>
                      <textarea
                        value={adminNote[item.id] ?? item.admin_note ?? ""}
                        onChange={(e) => setAdminNote((n) => ({ ...n, [item.id]: e.target.value }))}
                        placeholder="Internal note about this request or report..."
                        rows={2}
                        className="w-full rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text placeholder-q-muted focus:border-blue-400 focus:outline-none"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      {/* Build from request */}
                      {!isReport && item.status !== "implemented" && item.ai_verdict === "build-now" && item.recommended_category && (
                        <button
                          onClick={() => createFromRequest(item)}
                          disabled={creatingId === item.id}
                          className="rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-500 disabled:opacity-60"
                        >
                          {creatingId === item.id ? "Building..." : "🔨 Build This Tool"}
                        </button>
                      )}

                      {/* Status actions */}
                      {item.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateStatus(item, "reviewed")}
                            disabled={updatingId === item.id}
                            className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-60"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() => updateStatus(item, "rejected")}
                            disabled={updatingId === item.id}
                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {item.status === "reviewed" && (
                        <>
                          <button
                            onClick={() => updateStatus(item, "implemented")}
                            disabled={updatingId === item.id}
                            className="rounded-xl border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:bg-green-100 disabled:opacity-60"
                          >
                            Mark Implemented
                          </button>
                          <button
                            onClick={() => updateStatus(item, "rejected")}
                            disabled={updatingId === item.id}
                            className="rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:opacity-60"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {(item.status === "rejected" || item.status === "implemented") && (
                        <button
                          onClick={() => updateStatus(item, "pending")}
                          disabled={updatingId === item.id}
                          className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted transition hover:bg-q-card-hover disabled:opacity-60"
                        >
                          Reopen
                        </button>
                      )}

                      {/* Email template */}
                      {item.requester_email && (
                        <button
                          onClick={() => copyEmail(item)}
                          className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm text-q-muted transition hover:bg-q-card-hover"
                        >
                          📋 Copy Reply Template
                        </button>
                      )}

                      {/* View live tool */}
                      {item.created_public_slug && (
                        <a
                          href={`/tools/${item.created_public_slug}`}
                          target="_blank"
                          className="rounded-xl border border-blue-300 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                        >
                          View Live Tool →
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}