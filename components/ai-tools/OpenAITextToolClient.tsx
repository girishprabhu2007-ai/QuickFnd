"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  item: PublicContentItem;
};

type ToolConfig = {
  title?: string;
  intro?: string;
  placeholder?: string;
  buttonLabel?: string;
  systemPrompt?: string;
};

function getConfig(item: PublicContentItem): ToolConfig {
  const config = (item.engine_config || {}) as Record<string, unknown>;

  return {
    title: typeof config.title === "string" ? config.title : item.name,
    intro:
      typeof config.intro === "string"
        ? config.intro
        : "Describe what you want to generate and get a polished result instantly.",
    placeholder:
      typeof config.placeholder === "string"
        ? config.placeholder
        : "Enter your request...",
    buttonLabel:
      typeof config.buttonLabel === "string"
        ? config.buttonLabel
        : "Generate",
    systemPrompt:
      typeof config.systemPrompt === "string"
        ? config.systemPrompt
        : "You are a helpful AI assistant. Return useful, user-ready output.",
  };
}

export default function OpenAITextToolClient({ item }: Props) {
  const config = useMemo(() => getConfig(item), [item]);

  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toolSlug: item.slug,
          prompt,
          systemPrompt: config.systemPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate result.");
      }

      setResult(String(data.result || ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate result.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-q-text md:text-3xl">
            {config.title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
            {config.intro}
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
            placeholder={config.placeholder}
            className="min-h-[220px] w-full rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-text outline-none transition focus:border-blue-400"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generate}
            disabled={loading || !prompt.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating..." : config.buttonLabel}
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
        ) : (
          !loading && (
            <div className="rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
              Your generated result will appear here.
            </div>
          )
        )}
      </div>
    </section>
  );
}