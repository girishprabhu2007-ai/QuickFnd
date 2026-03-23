"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RequestToolClient() {
  const params = useSearchParams();

  const mode = params.get("mode") || "request";
  const category = params.get("category") || "tool";
  const ref = params.get("ref") || "";
  const name = params.get("name") || "";

  const [requestedName, setRequestedName] = useState(name || "");
  const [requestedCategory, setRequestedCategory] = useState(category);
  const [description, setDescription] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterEmail, setRequesterEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submitRequest() {
    if (!requestedName.trim() || !description.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/tool-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          ref,
          requested_name: requestedName,
          requested_category: requestedCategory,
          description,
          requester_name: requesterName,
          requester_email: requesterEmail,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to submit request.");
      }

      setMessage(
        mode === "report"
          ? "Thanks — your report has been submitted."
          : "Thanks — your request has been submitted."
      );

      setDescription("");
      setRequesterName("");
      setRequesterEmail("");

      if (mode !== "report") {
        setRequestedName("");
        setRequestedCategory("tool");
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to submit request."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            {mode === "report" ? "Report a tool" : "Request a tool"}
          </h1>

          <p className="mt-4 text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {mode === "report"
              ? "Tell us what is wrong with this page so we can review, repair, improve, or remove it."
              : "Tell us what tool, calculator, or AI utility you want to see next. Your request will be reviewed and scored for buildability."}
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                {mode === "report" ? "Tool name" : "Tool name"}
              </label>
              <input
                value={requestedName}
                onChange={(e) => setRequestedName(e.target.value)}
                placeholder="Example: SEO audit checklist generator"
                className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                Type
              </label>
              <select
                value={requestedCategory}
                onChange={(e) => setRequestedCategory(e.target.value)}
                className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
              >
                <option value="tool">Tool</option>
                <option value="calculator">Calculator</option>
                <option value="ai-tool">AI Tool</option>
              </select>
            </div>

            {ref ? (
              <div className="rounded-xl border border-q-border bg-q-bg p-3 text-sm text-q-muted">
                Reference slug: <span className="font-medium text-q-text">{ref}</span>
              </div>
            ) : null}

            <div>
              <label className="mb-2 block text-sm font-medium text-q-text">
                {mode === "report" ? "What is wrong with it?" : "What should it do?"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  mode === "report"
                    ? "Describe the bug, wrong output, poor quality, duplicate behavior, or other issue."
                    : "Describe the use case, inputs, outputs, or why this would be useful."
                }
                className="min-h-[160px] w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-q-text">
                  Your name
                </label>
                <input
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-q-text">
                  Email
                </label>
                <input
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="Optional"
                  className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
                />
              </div>
            </div>

            <button
              onClick={submitRequest}
              disabled={loading || !requestedName.trim() || !description.trim()}
              className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Submitting..."
                : mode === "report"
                ? "Submit Report"
                : "Submit Request"}
            </button>

            {message ? (
              <div className="rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text">
                {message}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}