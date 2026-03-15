"use client";

import { useState } from "react";

type Props = {
  toolSlug: string;
  toolName: string;
};

function getPlaceholder(toolSlug: string) {
  switch (toolSlug) {
    case "ai-email-writer":
      return "Example: Write a polite follow-up email after a client meeting about pricing and next steps.";
    case "ai-prompt-generator":
      return "Example: Create a prompt to generate a landing page hero section for a SaaS startup.";
    case "ai-blog-outline-generator":
      return "Example: Create a blog outline on how small businesses can use AI for customer support.";
    case "notion-ai":
      return "Example: Turn my meeting notes into a clean Notion summary with action items and deadlines.";
    default:
      return "Describe what you want the AI tool to generate...";
  }
}

export default function AIToolEngineClient({ toolSlug, toolName }: Props) {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          toolSlug,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      setResult(data.result || "");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Generation failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-q-text md:text-3xl">
            {toolName}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
            Enter your request below and generate a result instantly with
            OpenAI.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-q-text">
            Your request
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={getPlaceholder(toolSlug)}
            className="min-h-[220px] w-full rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text outline-none transition focus:border-blue-400"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : "Generate"}
          </button>

          <button
            onClick={() => {
              setPrompt("");
              setResult("");
              setError("");
            }}
            className="rounded-xl border border-q-border bg-q-bg px-5 py-3 text-sm font-semibold text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
          >
            Reset
          </button>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="rounded-2xl border border-q-border bg-q-bg p-5 md:p-6">
            <h3 className="text-lg font-semibold text-q-text">Result</h3>
            <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-q-muted md:text-base">
              {result}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}