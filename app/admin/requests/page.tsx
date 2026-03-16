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
};

export default function AdminRequestsPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setLoading(true);

    try {
      const res = await fetch("/api/admin/tool-requests", { cache: "no-store" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : { items: [] };

      if (!res.ok) {
        throw new Error(data?.error || "Failed to load requests.");
      }

      setItems(Array.isArray(data.items) ? data.items : []);
    } catch (error) {
      console.error("loadRequests error:", error);
      setMessage(
        error instanceof Error ? error.message : "Failed to load requests."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function createFromRequest(item: RequestItem) {
    if (!item.recommended_category) return;

    setCreatingId(item.id);
    setMessage("");

    try {
      const res = await fetch("/api/admin/create-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea: item.requested_name,
          category: item.recommended_category,
          requestId: item.id,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to create from request.");
      }

      setMessage(
        data.alreadyExists
          ? `Already exists: ${data.path}`
          : `Created successfully: ${data.path}`
      );

      await loadRequests();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create from request."
      );
    } finally {
      setCreatingId(null);
    }
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">User tool requests</h2>
      <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
        Review requests submitted by users and decide which ones should become live pages.
      </p>

      {message ? (
        <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text">
          {message}
        </div>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-6 text-q-muted">
          Loading requests...
        </div>
      ) : items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-6 text-q-muted">
          No requests yet.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-q-border bg-q-bg p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-semibold text-q-text">
                      {item.requested_name}
                    </h3>
                    <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs uppercase tracking-wide text-q-muted">
                      {item.requested_category}
                    </span>
                    <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs uppercase tracking-wide text-q-muted">
                      {item.ai_verdict}
                    </span>
                    <span className="rounded-full border border-q-border bg-q-card px-3 py-1 text-xs uppercase tracking-wide text-q-muted">
                      {item.status}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-7 text-q-muted">
                    {item.description}
                  </p>

                  {item.ai_summary ? (
                    <p className="mt-4 text-sm leading-7 text-q-muted">
                      <span className="font-medium text-q-text">AI review:</span>{" "}
                      {item.ai_summary}
                    </p>
                  ) : null}

                  {item.created_public_slug ? (
                    <p className="mt-3 text-sm text-blue-600">
                      Created slug: {item.created_public_slug}
                    </p>
                  ) : null}
                </div>

                <div className="shrink-0">
                  {item.status !== "implemented" &&
                  item.ai_verdict === "build-now" &&
                  item.recommended_category ? (
                    <button
                      onClick={() => createFromRequest(item)}
                      disabled={creatingId === item.id}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                    >
                      {creatingId === item.id ? "Creating..." : "Create From Request"}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}