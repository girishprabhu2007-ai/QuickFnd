"use client";

import { useState } from "react";

export default function AdminGeneratePage() {
  const [idea, setIdea] = useState("");
  const [category, setCategory] = useState("tool");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleCreate() {
    if (!idea.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/create-tool", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idea,
          category,
        }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to create tool.");
      }

      setMessage(
        data.alreadyExists
          ? `Already exists: ${data.path}`
          : `Created successfully: ${data.path}`
      );
      setIdea("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to create tool."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">Generate one item</h2>
      <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
        Create a single live tool, calculator, or AI tool. Unsupported ideas are blocked so you do not publish empty placeholder pages by mistake.
      </p>

      <div className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-q-text">
            Idea
          </label>
          <input
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Example: AI meta description generator"
            className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-q-text">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none transition focus:border-blue-400"
          >
            <option value="tool">Tool</option>
            <option value="calculator">Calculator</option>
            <option value="ai-tool">AI Tool</option>
          </select>
        </div>

        <button
          onClick={handleCreate}
          disabled={loading || !idea.trim()}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>

        {message ? (
          <div className="rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text">
            {message}
          </div>
        ) : null}
      </div>
    </section>
  );
}