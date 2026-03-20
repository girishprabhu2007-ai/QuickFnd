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

type TaskMeta = {
  title: string;
  inputLabel: string;
  inputPlaceholder: string;
  actionLabel: string;
  outputLabel: string;
  audiencePlaceholder: string;
  supportsAudience: boolean;
  supportsLength: boolean;
  lengthOptions: string[];
  helperText: string;
  examples: string[];
  checklist: string[];
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

function softInfoClass() {
  return "rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-slate-700";
}

function successHintClass() {
  return "rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900";
}

function toConfig(value: unknown): AIToolConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as AIToolConfig;
}

function getTaskMeta(task: string, itemName: string): TaskMeta {
  switch (task) {
    case "email":
      return {
        title: itemName,
        inputLabel: "What should the email be about?",
        inputPlaceholder:
          "Example: Write a polite follow-up email to a client after a product demo. Mention pricing, next steps, and suggest a call next week.",
        actionLabel: "Generate Email",
        outputLabel: "Generated email",
        audiencePlaceholder: "Client, hiring manager, support lead",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "long"],
        helperText:
          "Best for follow-ups, outreach, support replies, internal updates, and formal communication drafts.",
        examples: [
          "Follow up after a sales demo",
          "Write a polite job application follow-up",
          "Draft a customer support apology email",
        ],
        checklist: [
          "State the purpose clearly",
          "Mention the recipient context",
          "Add a clear next step or CTA",
        ],
      };

    case "outline":
      return {
        title: itemName,
        inputLabel: "What topic do you want outlined?",
        inputPlaceholder:
          "Example: Build a blog outline for 'How to launch a SaaS in 2026' for founders and product teams.",
        actionLabel: "Generate Outline",
        outputLabel: "Generated outline",
        audiencePlaceholder: "Beginners, founders, marketers",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "detailed"],
        helperText:
          "Best for blog posts, landing pages, lesson plans, strategy docs, videos, and presentation structures.",
        examples: [
          "Blog outline for SEO audit process",
          "Video script outline for YouTube tutorial",
          "Course outline for beginner designers",
        ],
        checklist: [
          "Name the topic clearly",
          "Mention target audience",
          "Mention desired depth or structure",
        ],
      };

    case "summarization":
      return {
        title: itemName,
        inputLabel: "Paste text to summarize",
        inputPlaceholder:
          "Paste a long paragraph, meeting notes, article excerpt, transcript, or research text here.",
        actionLabel: "Generate Summary",
        outputLabel: "Generated summary",
        audiencePlaceholder: "Executives, students, general audience",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["brief", "medium", "detailed"],
        helperText:
          "Best for notes, transcripts, reports, articles, user research, docs, and decision summaries.",
        examples: [
          "Summarize meeting notes into action points",
          "Turn an article into executive summary bullets",
          "Condense research notes for revision",
        ],
        checklist: [
          "Paste complete source text",
          "Mention who the summary is for",
          "Choose the right detail level",
        ],
      };

    case "rewrite":
      return {
        title: itemName,
        inputLabel: "Paste text to rewrite",
        inputPlaceholder:
          "Paste text you want rewritten for clarity, tone, readability, persuasion, or simplification.",
        actionLabel: "Rewrite Text",
        outputLabel: "Rewritten result",
        audiencePlaceholder: "Customers, readers, developers",
        supportsAudience: true,
        supportsLength: false,
        lengthOptions: [],
        helperText:
          "Best for polishing copy, improving clarity, changing tone, simplifying text, or making content more persuasive.",
        examples: [
          "Rewrite marketing copy to sound clearer",
          "Simplify technical explanation for beginners",
          "Make an email more professional",
        ],
        checklist: [
          "Paste the original text",
          "Be explicit about the desired tone",
          "Add any constraints in extra instructions",
        ],
      };

    default:
      return {
        title: itemName,
        inputLabel: "Enter your prompt or text",
        inputPlaceholder:
          "Describe what you want the AI tool to generate, improve, or transform.",
        actionLabel: "Generate",
        outputLabel: "Generated output",
        audiencePlaceholder: "General audience",
        supportsAudience: true,
        supportsLength: true,
        lengthOptions: ["short", "medium", "long"],
        helperText:
          "This is a flexible AI workflow for content generation and transformation.",
        examples: [
          "Generate a draft from a short prompt",
          "Rewrite content for a specific audience",
          "Create a structured response from rough notes",
        ],
        checklist: [
          "Be specific about the goal",
          "Mention audience and tone",
          "Add extra instructions if format matters",
        ],
      };
  }
}

function buildPromptQualityHint(
  task: string,
  input: string,
  audience: string,
  extraInstructions: string
) {
  const hasAudience = audience.trim().length > 0;
  const hasExtra = extraInstructions.trim().length > 0;
  const inputLength = input.trim().length;

  if (task === "email") {
    if (inputLength < 40) {
      return "Add more context about the recipient, purpose, and desired outcome for a better email draft.";
    }
    if (!hasAudience) {
      return "Adding the recipient type usually improves the tone and structure of the generated email.";
    }
    if (!hasExtra) {
      return "Add extra instructions if you want a specific CTA, structure, or level of formality.";
    }
    return "Your prompt has enough detail for a more tailored email draft.";
  }

  if (task === "outline") {
    if (inputLength < 25) {
      return "Mention the topic more specifically so the outline is not too broad.";
    }
    if (!hasAudience) {
      return "Adding a target audience usually makes the outline more useful and better scoped.";
    }
    return "Your outline prompt should produce a more targeted structure.";
  }

  if (task === "summarization") {
    if (inputLength < 120) {
      return "Summaries work better with enough source text. Try pasting a fuller passage.";
    }
    if (!hasAudience) {
      return "Add the audience if you want the summary tuned for executives, students, or general readers.";
    }
    return "This looks like enough source material for a meaningful summary.";
  }

  if (task === "rewrite") {
    if (inputLength < 40) {
      return "Rewrite tasks work better when you provide the full original text, not just a fragment.";
    }
    if (!hasExtra) {
      return "Add extra instructions if you want the rewrite to be clearer, shorter, friendlier, or more persuasive.";
    }
    return "You’ve given enough content to produce a stronger rewrite.";
  }

  if (inputLength < 30) {
    return "More specific prompts usually give better output.";
  }

  return "Your prompt has enough detail for a more useful response.";
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

  const promptHint = useMemo(() => {
    return buildPromptQualityHint(task, input, audience, extraInstructions);
  }, [task, input, audience, extraInstructions]);

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
            {meta.helperText}
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
          <div className={softInfoClass()}>
            <div className="font-medium text-slate-800">Prompt quality hint</div>
            <div className="mt-1">{promptHint}</div>
          </div>

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
              placeholder="Optional: add format, structure, style, constraints, or details you want the output to follow."
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

          {output ? (
            <div className={successHintClass()}>
              <div className="font-medium">How to use this result</div>
              <div className="mt-1">
                Review the output, refine the input if needed, and rerun with stronger constraints if you want a tighter draft.
              </div>
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
            <div className="text-xs uppercase tracking-wide text-q-muted">Examples</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              {meta.examples.map((example, index) => (
                <li key={`${example}-${index}`}>• {example}</li>
              ))}
            </ul>
          </div>

          <div className={panelClass()}>
            <div className="text-xs uppercase tracking-wide text-q-muted">Better results checklist</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              {meta.checklist.map((item, index) => (
                <li key={`${item}-${index}`}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className={panelClass()}>
            <div className="text-xs uppercase tracking-wide text-q-muted">Tips</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              <li>• Stronger context usually improves output quality.</li>
              <li>• Use extra instructions to shape structure or tone.</li>
              <li>• Try a different tone if the first draft feels off.</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}