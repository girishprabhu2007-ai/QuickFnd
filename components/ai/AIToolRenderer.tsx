"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";

type AIToolConfig = {
  task?: string;
  tone?: string;
  toneOptions?: string[];
  outputType?: string;
};

type RunResponse = {
  success?: boolean;
  output?: string;
  error?: string;
};

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-3 text-q-text outline-none placeholder:text-q-muted";
}

function textareaClass(minHeight = "min-h-[160px]") {
  return `w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted ${minHeight}`;
}

function cardClass() {
  return "rounded-2xl border border-q-border bg-q-card p-6";
}

function panelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
}

function toConfig(value: unknown): AIToolConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as AIToolConfig;
}

function getTaskMeta(task: string, itemName: string) {
  switch (task) {
    case "email":
      return {
        title: itemName,
        inputLabel: "What should the email be about?",
        inputPlaceholder:
          "Example: Write a polite follow-up email to a client after a product demo.",
        actionLabel: "Generate Email",
        outputLabel: "Generated email",
        audiencePlaceholder: "Client, hiring manager, support lead",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "long"],
      };

    case "outline":
      return {
        title: itemName,
        inputLabel: "What topic do you want outlined?",
        inputPlaceholder:
          "Example: Build a blog outline for 'How to launch a SaaS in 2026'.",
        actionLabel: "Generate Outline",
        outputLabel: "Generated outline",
        audiencePlaceholder: "Beginners, founders, marketers",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "detailed"],
      };

    case "summarization":
      return {
        title: itemName,
        inputLabel: "Paste text to summarize",
        inputPlaceholder:
          "Paste a paragraph, article excerpt, notes, or research text here.",
        actionLabel: "Generate Summary",
        outputLabel: "Generated summary",
        audiencePlaceholder: "Executives, students, general audience",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["brief", "medium", "detailed"],
      };

    case "rewrite":
      return {
        title: itemName,
        inputLabel: "Paste text to rewrite",
        inputPlaceholder:
          "Paste content you want rewritten for clarity, tone, or style.",
        actionLabel: "Rewrite Text",
        outputLabel: "Rewritten result",
        audiencePlaceholder: "Customers, readers, developers",
        supportsAudience: true,
        supportsLength: false,
        lengthOptions: [],
      };

    default:
      return {
        title: itemName,
        inputLabel: "Enter your prompt or text",
        inputPlaceholder:
          "Describe what you want the AI tool to generate or transform.",
        actionLabel: "Generate",
        outputLabel: "Generated output",
        audiencePlaceholder: "General audience",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "long"],
      };
  }
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // ignore clipboard issues
  }
}

export default function AIToolRenderer({ item }: { item: PublicContentItem }) {
  const config = toConfig(item.engine_config);
  const task = String(config.task || "text-generation").trim().toLowerCase();
  const outputType = String(config.outputType || "text").trim().toLowerCase();

  const toneOptions = useMemo(() => {
    const fromConfig = Array.isArray(config.toneOptions)
      ? config.toneOptions.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    if (fromConfig.length > 0) {
      return fromConfig;
    }

    return ["professional", "friendly", "clear", "persuasive", "casual"];
  }, [config.toneOptions]);

  const meta = getTaskMeta(task, item.name);

  const [input, setInput] = useState("");
  const [tone, setTone] = useState(String(config.tone || toneOptions[0] || "professional"));
  const [audience, setAudience] = useState("");
  const [length, setLength] = useState(meta.lengthOptions[1] || meta.lengthOptions[0] || "");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRun() {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          config: {
            task,
            tone,
            outputType,
            audience,
            length,
            extraInstructions,
          },
        }),
      });

      const data = (await res.json()) as RunResponse;

      if (!res.ok || !data.success) {
        throw new Error(data.error || "AI tool execution failed.");
      }

      setOutput(String(data.output || ""));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={cardClass()}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-q-text">{meta.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-q-muted">
            This AI tool runs a reusable OpenAI engine with task-specific controls.
            The interface adapts to the selected AI workflow instead of showing the same generic form.
          </p>
        </div>

        <div className="grid min-w-[220px] gap-3 sm:grid-cols-2 md:grid-cols-1">
          <div className={panelClass()}>
            <div className="text-xs uppercase tracking-wide text-q-muted">Task</div>
            <div className="mt-2 text-sm font-medium capitalize text-q-text">
              {task.replace(/-/g, " ")}
            </div>
          </div>
          <div className={panelClass()}>
            <div className="text-xs uppercase tracking-wide text-q-muted">Output type</div>
            <div className="mt-2 text-sm font-medium capitalize text-q-text">
              {outputType.replace(/-/g, " ")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              {meta.inputLabel}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={meta.inputPlaceholder}
              className={textareaClass("min-h-[220px]")}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-q-text">
              Extra instructions
            </label>
            <textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="Optional: add extra requirements, style notes, or constraints."
              className={textareaClass("min-h-[100px]")}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRun}
              disabled={loading || !input.trim()}
              className="rounded-xl bg-q-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-q-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating..." : meta.actionLabel}
            </button>

            <button
              onClick={() => copyText(output)}
              disabled={!output}
              className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-semibold text-q-text transition hover:bg-q-card-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              Copy Output
            </button>

            <button
              onClick={() => {
                setInput("");
                setOutput("");
                setError("");
                setExtraInstructions("");
              }}
              className="rounded-xl border border-q-border bg-q-bg px-5 py-2.5 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
            >
              Reset
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <div className={panelClass()}>
            <div className="mb-2 text-sm font-medium text-q-text">{meta.outputLabel}</div>
            <div className="min-h-[180px] whitespace-pre-wrap text-sm leading-7 text-q-text">
              {output || "Your generated result will appear here."}
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className={panelClass()}>
            <div className="mb-2 text-sm font-medium text-q-text">Tone</div>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className={inputClass()}
            >
              {toneOptions.map((option) => (
                <option key={option} value={option}>
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {meta.supportsAudience ? (
            <div className={panelClass()}>
              <div className="mb-2 text-sm font-medium text-q-text">Audience</div>
              <input
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                placeholder={meta.audiencePlaceholder}
                className={inputClass()}
              />
            </div>
          ) : null}

          {meta.supportsLength ? (
            <div className={panelClass()}>
              <div className="mb-2 text-sm font-medium text-q-text">Length</div>
              <select
                value={length}
                onChange={(e) => setLength(e.target.value)}
                className={inputClass()}
              >
                {meta.lengthOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className={panelClass()}>
            <div className="text-xs uppercase tracking-wide text-q-muted">Tips</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              <li>• Be specific in your input to get better output.</li>
              <li>• Use extra instructions to shape structure or style.</li>
              <li>• Try different tones for noticeably different results.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}