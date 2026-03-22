"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export default function RequestToolPage() {
  const params = useSearchParams();

  const mode = params.get("mode") || "request";
  const category = params.get("category") || "";
  const ref = params.get("ref") || "";
  const name = params.get("name") || "";

  const [toolName, setToolName] = useState(name || "");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!description.trim()) {
      alert("Please enter details.");
      return;
    }

    setLoading(true);

    try {
      await fetch("/api/tool-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode,
          category,
          ref,
          name: toolName,
          description,
        }),
      });

      setSubmitted(true);
    } catch (err) {
      alert("Failed to submit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-q-bg px-4 py-10 text-q-text">
      <div className="mx-auto max-w-2xl rounded-3xl border border-q-border bg-q-card p-6 md:p-10">

        <h1 className="text-2xl font-bold md:text-3xl">
          {mode === "report" ? "Report a Tool" : "Request a Tool"}
        </h1>

        <p className="mt-2 text-sm text-q-muted">
          {mode === "report"
            ? "Help us improve by reporting issues or low-quality tools."
            : "Suggest a tool, calculator, or AI tool you want added."}
        </p>

        {submitted ? (
          <div className="mt-6 rounded-xl border border-green-300 bg-green-50 p-4 text-green-800">
            ✅ Submitted successfully. Thank you!
          </div>
        ) : (
          <div className="mt-6 space-y-5">

            <div>
              <label className="mb-1 block text-sm font-medium">
                {mode === "report" ? "Tool Name" : "Requested Tool Name"}
              </label>
              <input
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                className="w-full rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm outline-none"
                placeholder="Enter tool name"
              />
            </div>

            {ref ? (
              <div className="text-xs text-q-muted">
                Reference: {ref}
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-sm font-medium">
                {mode === "report"
                  ? "What is wrong with this tool?"
                  : "Describe the tool"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[140px] rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm outline-none"
                placeholder={
                  mode === "report"
                    ? "Explain the issue, bug, or low-quality behavior..."
                    : "Explain what the tool should do..."
                }
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-xl bg-q-primary px-4 py-3 text-sm font-semibold text-white hover:bg-q-primary-hover disabled:opacity-60"
            >
              {loading
                ? "Submitting..."
                : mode === "report"
                ? "Submit Report"
                : "Submit Request"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}