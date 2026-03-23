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
  actionLabel: string;
  outputLabel: string;
  helperText: string;
  examples: string[];
  checklist: string[];
};

type EmailOutputParts = {
  subject: string;
  body: string;
};

const GENERIC_TASK_VALUES = new Set([
  "",
  "text-generation",
  "text generation",
  "general",
  "default",
]);

const GENERIC_OUTPUT_VALUES = new Set([
  "",
  "text",
  "general",
  "default",
]);

function inputClass() {
  return "w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-q-card";
}

function textareaClass(minHeight = "min-h-[160px]") {
  return `w-full rounded-2xl border border-q-border bg-q-bg px-4 py-4 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-q-card ${minHeight}`;
}

function cardClass() {
  return "rounded-[30px] border border-q-border bg-q-card p-6 shadow-sm md:p-8";
}

function panelClass() {
  return "rounded-2xl border border-q-border bg-q-bg p-4";
}

function elevatedPanelClass() {
  return "rounded-[24px] border border-q-border bg-q-bg p-5 shadow-sm";
}

function softInfoClass() {
  return "rounded-2xl border border-blue-200/70 bg-blue-50/80 p-4 text-sm text-slate-700";
}

function successHintClass() {
  return "rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900";
}

function badgeClass() {
  return "rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium uppercase tracking-wide text-q-muted";
}

function labelClass() {
  return "mb-2 block text-sm font-medium text-q-text";
}

function outputShellClass() {
  return "rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6";
}

function outputInnerClass() {
  return "rounded-2xl border border-q-border bg-q-card p-4 text-sm leading-7 text-q-text";
}

function copyButtonClass() {
  return "rounded-xl border border-q-border bg-q-bg px-3 py-2 text-xs font-semibold text-q-text transition duration-150 hover:-translate-y-0.5 hover:bg-q-card-hover hover:shadow-sm";
}

function primaryButtonClass() {
  return "rounded-2xl bg-q-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-q-primary-hover hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60";
}

function secondaryButtonClass() {
  return "rounded-2xl border border-q-border bg-q-bg px-5 py-3 text-sm font-semibold text-q-text transition duration-150 hover:-translate-y-0.5 hover:bg-q-card-hover hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60";
}

function sectionTitleClass() {
  return "text-xs font-semibold uppercase tracking-[0.18em] text-q-muted";
}

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function toConfig(value: unknown): AIToolConfig {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as AIToolConfig;
}

function inferTaskFromItem(item: PublicContentItem, config: AIToolConfig) {
  const configuredTask = normalize(config.task);

  if (configuredTask && !GENERIC_TASK_VALUES.has(configuredTask)) {
    return configuredTask;
  }

  const slug = String(item.slug || "").trim().toLowerCase();
  const name = String(item.name || "").trim().toLowerCase();

  if (slug.includes("email") || name.includes("email")) {
    return "email";
  }

  if (slug.includes("outline") || name.includes("outline")) {
    return "outline";
  }

  if (slug.includes("prompt") || name.includes("prompt")) {
    return "prompt-generator";
  }

  if (slug.includes("rewrite") || name.includes("rewrite")) {
    return "rewrite";
  }

  if (
    slug.includes("summary") ||
    slug.includes("summarize") ||
    name.includes("summary")
  ) {
    return "summarization";
  }

  return "text-generation";
}

function inferOutputTypeFromItem(
  item: PublicContentItem,
  config: AIToolConfig,
  task: string
) {
  const configuredOutputType = normalize(config.outputType);

  if (configuredOutputType && !GENERIC_OUTPUT_VALUES.has(configuredOutputType)) {
    return configuredOutputType;
  }

  const slug = String(item.slug || "").trim().toLowerCase();

  if (task === "email" || slug.includes("email")) {
    return "email";
  }

  if (task === "outline" || slug.includes("outline")) {
    return "outline";
  }

  if (task === "prompt-generator" || slug.includes("prompt")) {
    return "prompt";
  }

  return "text";
}

function getTaskMeta(task: string, itemName: string): TaskMeta {
  switch (task) {
    case "email":
      return {
        title: itemName,
        actionLabel: "Generate Email",
        outputLabel: "Generated email",
        helperText:
          "Create a send-ready email draft with clearer intent, better structure, and a stronger call to action.",
        examples: [
          "Client follow-up after demo",
          "Job application follow-up",
          "Customer support apology email",
        ],
        checklist: [
          "State the purpose clearly",
          "Mention the recipient context",
          "Add a specific next step",
        ],
      };

    case "outline":
      return {
        title: itemName,
        actionLabel: "Generate Outline",
        outputLabel: "Generated outline",
        helperText:
          "Create structured outlines for blog posts, landing pages, videos, lessons, and strategy documents.",
        examples: [
          "SEO audit guide outline",
          "YouTube tutorial script outline",
          "Beginner course structure",
        ],
        checklist: [
          "Name the topic clearly",
          "Mention the target audience",
          "Choose the right depth",
        ],
      };

    case "prompt-generator":
      return {
        title: itemName,
        actionLabel: "Generate Prompt",
        outputLabel: "Generated prompt",
        helperText:
          "Turn rough ideas into stronger prompts with context, constraints, and a clearer output format.",
        examples: [
          "Prompt for a product description generator",
          "Prompt for an SEO article brief",
          "Prompt for a Midjourney concept",
        ],
        checklist: [
          "Describe the outcome you want",
          "Mention the target AI or use case",
          "Add constraints or formatting needs",
        ],
      };

    case "summarization":
      return {
        title: itemName,
        actionLabel: "Generate Summary",
        outputLabel: "Generated summary",
        helperText:
          "Condense long text into a clearer summary for decisions, reading, revision, or reporting.",
        examples: [
          "Summarize meeting notes",
          "Executive summary for an article",
          "Condense research notes",
        ],
        checklist: [
          "Paste enough source text",
          "Mention the audience",
          "Choose the level of detail",
        ],
      };

    case "rewrite":
      return {
        title: itemName,
        actionLabel: "Rewrite Text",
        outputLabel: "Rewritten result",
        helperText:
          "Improve clarity, tone, persuasion, readability, or structure while keeping the original intent.",
        examples: [
          "Rewrite marketing copy more clearly",
          "Simplify a technical explanation",
          "Make an email more professional",
        ],
        checklist: [
          "Paste the original text",
          "Be explicit about the target tone",
          "Add extra constraints if needed",
        ],
      };

    default:
      return {
        title: itemName,
        actionLabel: "Generate",
        outputLabel: "Generated output",
        helperText:
          "Use this AI tool to generate, improve, or transform content with clearer instructions and constraints.",
        examples: [
          "Generate a draft from a short prompt",
          "Rewrite content for an audience",
          "Create a structured response",
        ],
        checklist: [
          "Be specific about the goal",
          "Mention audience and tone",
          "Add formatting requirements",
        ],
      };
  }
}

function buildPromptQualityHint(
  task: string,
  primaryText: string,
  secondarySignals: string[]
) {
  const length = primaryText.trim().length;
  const filledSignals = secondarySignals.filter(
    (value) => value.trim().length > 0
  ).length;

  if (task === "email") {
    if (length < 20) {
      return "Add more purpose and context for a stronger draft.";
    }
    if (filledSignals < 2) {
      return "Adding recipient, subject, or CTA will make the email more useful.";
    }
    return "This should generate a more tailored email draft.";
  }

  if (task === "outline") {
    if (length < 15) {
      return "Use a more specific topic so the outline is not too broad.";
    }
    if (filledSignals < 2) {
      return "Adding audience, goal, or depth will improve the outline.";
    }
    return "This should generate a more targeted outline.";
  }

  if (task === "prompt-generator") {
    if (length < 15) {
      return "Describe the end goal more clearly for a stronger prompt.";
    }
    if (filledSignals < 2) {
      return "Adding context, constraints, or output format will improve the prompt.";
    }
    return "This should generate a stronger, more usable prompt.";
  }

  if (task === "summarization") {
    if (length < 120) {
      return "Summaries work better with more source text.";
    }
    return "This looks like enough source material for a meaningful summary.";
  }

  if (task === "rewrite") {
    if (length < 40) {
      return "Rewrite tasks work better when you provide the full original text.";
    }
    return "You’ve provided enough text for a stronger rewrite.";
  }

  if (length < 30) {
    return "More specific inputs usually give better output.";
  }

  return "Your input has enough detail for a more useful response.";
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // ignore clipboard issues
  }
}

type EmailFormState = {
  subject: string;
  purpose: string;
  recipient: string;
  context: string;
  cta: string;
};

type OutlineFormState = {
  topic: string;
  audience: string;
  goal: string;
  depth: string;
  notes: string;
};

type PromptFormState = {
  goal: string;
  context: string;
  constraints: string;
  outputFormat: string;
};

function buildEmailInput(state: EmailFormState) {
  return [
    `Subject: ${state.subject}`,
    `Recipient: ${state.recipient}`,
    `Purpose: ${state.purpose}`,
    `Context: ${state.context}`,
    `Call to action: ${state.cta}`,
  ]
    .filter((line) => line.split(": ")[1]?.trim())
    .join("\n");
}

function buildOutlineInput(state: OutlineFormState) {
  return [
    `Topic: ${state.topic}`,
    `Audience: ${state.audience}`,
    `Goal: ${state.goal}`,
    `Depth: ${state.depth}`,
    `Notes: ${state.notes}`,
  ]
    .filter((line) => line.split(": ")[1]?.trim())
    .join("\n");
}

function buildPromptGeneratorInput(state: PromptFormState) {
  return [
    `Goal: ${state.goal}`,
    `Context: ${state.context}`,
    `Constraints: ${state.constraints}`,
    `Desired output format: ${state.outputFormat}`,
  ]
    .filter((line) => line.split(": ")[1]?.trim())
    .join("\n");
}

function parseEmailOutput(raw: string): EmailOutputParts | null {
  const text = String(raw || "").trim();
  if (!text) return null;

  const subjectMatch = text.match(/Subject:\s*(.+)/i);
  const bodyMatch = text.match(/Body:\s*([\s\S]+)/i);

  if (!subjectMatch && !bodyMatch) {
    return null;
  }

  return {
    subject: subjectMatch?.[1]?.trim() || "",
    body: bodyMatch?.[1]?.trim() || text,
  };
}

function renderOutlineLines(output: string) {
  return output
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.trim().length > 0);
}

function OutputHeader({
  label,
  ready,
  loading,
  hasError,
}: {
  label: string;
  ready: boolean;
  loading?: boolean;
  hasError?: boolean;
}) {
  const badgeClassName = loading
    ? "rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
    : hasError
    ? "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
    : ready
    ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
    : "rounded-full border border-q-border bg-q-card px-3 py-1 text-xs font-medium text-q-muted";

  const badgeLabel = loading
    ? "Generating"
    : hasError
    ? "Needs attention"
    : ready
    ? "Ready"
    : "Waiting for input";

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <div className={sectionTitleClass()}>Result stage</div>
        <div className="mt-2 text-lg font-semibold text-q-text">{label}</div>
      </div>
      <span className={badgeClassName}>{badgeLabel}</span>
    </div>
  );
}

function EmailOutputView({
  output,
  loading,
  error,
}: {
  output: string;
  loading?: boolean;
  error?: string;
}) {
  const parsed = parseEmailOutput(output);

  if (!output && !loading && !error) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated email" ready={false} />
        <div className={`min-h-[220px] ${outputInnerClass()}`}>
          Your generated result will appear here.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated email" ready={false} loading />
        <div className={`${outputInnerClass()} space-y-3`}>
          <div className="h-4 w-40 animate-pulse rounded bg-q-border" />
          <div className="h-4 w-full animate-pulse rounded bg-q-border" />
          <div className="h-4 w-[92%] animate-pulse rounded bg-q-border" />
          <div className="h-4 w-[85%] animate-pulse rounded bg-q-border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated email" ready={false} hasError />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!parsed) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated email" ready />
        <div className={`min-h-[220px] whitespace-pre-wrap ${outputInnerClass()}`}>
          {output}
        </div>
      </div>
    );
  }

  return (
    <div className={outputShellClass()}>
      <OutputHeader label="Generated email" ready />

      <div className="grid gap-4">
        <div className="rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-q-muted">
              Subject
            </div>
            <button
              onClick={() => copyText(parsed.subject)}
              className={copyButtonClass()}
            >
              Copy Subject
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-q-text">
            {parsed.subject || "No subject detected."}
          </div>
        </div>

        <div className="rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-q-muted">
              Body
            </div>
            <button
              onClick={() => copyText(parsed.body)}
              className={copyButtonClass()}
            >
              Copy Body
            </button>
          </div>
          <div className="whitespace-pre-wrap text-sm leading-7 text-q-text">
            {parsed.body || "No body detected."}
          </div>
        </div>
      </div>
    </div>
  );
}

function OutlineOutputView({
  output,
  loading,
  error,
}: {
  output: string;
  loading?: boolean;
  error?: string;
}) {
  const lines = renderOutlineLines(output);

  if (!output && !loading && !error) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated outline" ready={false} />
        <div className={`min-h-[220px] ${outputInnerClass()}`}>
          Your generated result will appear here.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated outline" ready={false} loading />
        <div className={`${outputInnerClass()} space-y-3`}>
          <div className="h-4 w-48 animate-pulse rounded bg-q-border" />
          <div className="h-4 w-full animate-pulse rounded bg-q-border" />
          <div className="h-4 w-[90%] animate-pulse rounded bg-q-border" />
          <div className="h-4 w-[82%] animate-pulse rounded bg-q-border" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={outputShellClass()}>
        <OutputHeader label="Generated outline" ready={false} hasError />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={outputShellClass()}>
      <OutputHeader label="Generated outline" ready />

      <div className="rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-q-muted">
            Outline
          </div>
          <button onClick={() => copyText(output)} className={copyButtonClass()}>
            Copy Outline
          </button>
        </div>

        <div className="space-y-3">
          {lines.map((line, index) => {
            const trimmed = line.trim();

            const isHeading =
              /^title:/i.test(trimmed) ||
              /^h2[:\s-]/i.test(trimmed) ||
              /^##\s/.test(trimmed);

            const isSubHeading =
              /^h3[:\s-]/i.test(trimmed) ||
              /^###\s/.test(trimmed);

            return (
              <div
                key={`${trimmed}-${index}`}
                className={
                  isHeading
                    ? "rounded-xl border border-blue-200/70 bg-blue-50/70 p-3 text-sm font-semibold text-slate-900"
                    : isSubHeading
                    ? "rounded-xl border border-q-border bg-q-bg p-3 text-sm font-medium text-q-text"
                    : "rounded-xl border border-q-border bg-q-bg p-3 text-sm leading-7 text-q-text"
                }
              >
                {trimmed}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PromptOutputView({
  output,
  loading,
  error,
}: {
  output: string;
  loading?: boolean;
  error?: string;
}) {
  return (
    <div className={outputShellClass()}>
      <OutputHeader
        label="Generated prompt"
        ready={Boolean(output)}
        loading={loading}
        hasError={Boolean(error)}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          {error}
        </div>
      ) : (
        <div className="rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-q-muted">
              Prompt
            </div>
            <button
              onClick={() => copyText(output)}
              disabled={!output}
              className={`${copyButtonClass()} disabled:cursor-not-allowed disabled:opacity-60`}
            >
              Copy Prompt
            </button>
          </div>

          <div className="min-h-[220px] whitespace-pre-wrap rounded-2xl border border-q-border bg-q-bg p-4 text-sm leading-7 text-q-text">
            {loading
              ? "Generating..."
              : output || "Your generated result will appear here."}
          </div>
        </div>
      )}
    </div>
  );
}

function GenericOutputView({
  output,
  label,
  loading,
  error,
}: {
  output: string;
  label: string;
  loading?: boolean;
  error?: string;
}) {
  return (
    <div className={outputShellClass()}>
      <OutputHeader
        label={label}
        ready={Boolean(output)}
        loading={loading}
        hasError={Boolean(error)}
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          {error}
        </div>
      ) : (
        <div className={`min-h-[220px] whitespace-pre-wrap ${outputInnerClass()}`}>
          {loading
            ? "Generating..."
            : output || "Your generated result will appear here."}
        </div>
      )}
    </div>
  );
}

export default function AIToolRenderer({
  item,
}: {
  item: PublicContentItem;
}) {
  const config = toConfig(item.engine_config);
  const task = inferTaskFromItem(item, config);
  const outputType = inferOutputTypeFromItem(item, config, task);
  const meta = getTaskMeta(task, item.name);

  const toneOptions = useMemo(() => {
    const fromConfig = Array.isArray(config.toneOptions)
      ? config.toneOptions
          .map((entry) => String(entry || "").trim())
          .filter(Boolean)
      : [];

    if (fromConfig.length > 0) {
      return fromConfig;
    }

    if (task === "email") return ["professional", "friendly", "persuasive"];
    if (task === "outline") return ["clear", "professional", "educational"];
    if (task === "prompt-generator") return ["clear", "precise", "creative"];

    return ["professional", "friendly", "clear", "persuasive", "casual"];
  }, [config.toneOptions, task]);

  const [tone, setTone] = useState(
    String(config.tone || toneOptions[0] || "professional")
  );
  const [length, setLength] = useState("medium");
  const [audience, setAudience] = useState("");
  const [extraInstructions, setExtraInstructions] = useState("");
  const [genericInput, setGenericInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailForm, setEmailForm] = useState<EmailFormState>({
    subject: "",
    purpose: "",
    recipient: "",
    context: "",
    cta: "",
  });

  const [outlineForm, setOutlineForm] = useState<OutlineFormState>({
    topic: "",
    audience: "",
    goal: "",
    depth: "medium",
    notes: "",
  });

  const [promptForm, setPromptForm] = useState<PromptFormState>({
    goal: "",
    context: "",
    constraints: "",
    outputFormat: "",
  });

  const primaryInput = useMemo(() => {
    if (task === "email") return buildEmailInput(emailForm);
    if (task === "outline") return buildOutlineInput(outlineForm);
    if (task === "prompt-generator") return buildPromptGeneratorInput(promptForm);
    return genericInput;
  }, [task, emailForm, outlineForm, promptForm, genericInput]);

  const promptHint = useMemo(() => {
    const secondarySignals =
      task === "email"
        ? [
            emailForm.subject,
            emailForm.recipient,
            emailForm.cta,
            extraInstructions,
          ]
        : task === "outline"
        ? [
            outlineForm.audience,
            outlineForm.goal,
            outlineForm.depth,
            extraInstructions,
          ]
        : task === "prompt-generator"
        ? [
            promptForm.context,
            promptForm.constraints,
            promptForm.outputFormat,
            extraInstructions,
          ]
        : [audience, extraInstructions, length];

    return buildPromptQualityHint(task, primaryInput, secondarySignals);
  }, [
    task,
    primaryInput,
    emailForm.subject,
    emailForm.recipient,
    emailForm.cta,
    outlineForm.audience,
    outlineForm.goal,
    outlineForm.depth,
    promptForm.context,
    promptForm.constraints,
    promptForm.outputFormat,
    audience,
    extraInstructions,
    length,
  ]);

  async function handleRun() {
    setLoading(true);
    setError("");
    setOutput("");

    try {
      const composedInput = [
        primaryInput,
        extraInstructions ? `Extra instructions: ${extraInstructions}` : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const res = await fetch("/api/ai/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: composedInput,
          config: {
            task,
            tone,
            outputType,
            audience: task === "outline" ? outlineForm.audience : audience,
            length: task === "outline" ? outlineForm.depth : length,
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

  function resetAll() {
    setGenericInput("");
    setAudience("");
    setLength("medium");
    setExtraInstructions("");
    setOutput("");
    setError("");
    setEmailForm({
      subject: "",
      purpose: "",
      recipient: "",
      context: "",
      cta: "",
    });
    setOutlineForm({
      topic: "",
      audience: "",
      goal: "",
      depth: "medium",
      notes: "",
    });
    setPromptForm({
      goal: "",
      context: "",
      constraints: "",
      outputFormat: "",
    });
  }

  const canRun = primaryInput.trim().length > 0;

  return (
    <section className={cardClass()}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex flex-wrap gap-2">
            <span className={badgeClass()}>{task.replace(/-/g, " ")}</span>
            <span className={badgeClass()}>{outputType.replace(/-/g, " ")}</span>
          </div>

          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-q-text md:text-3xl">
            {meta.title}
          </h2>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-q-muted md:text-base">
            {meta.helperText}
          </p>
        </div>

        <div className="grid min-w-[240px] gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Task</div>
            <div className="mt-2 text-sm font-semibold capitalize text-q-text">
              {task.replace(/-/g, " ")}
            </div>
          </div>

          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Output type</div>
            <div className="mt-2 text-sm font-semibold capitalize text-q-text">
              {outputType.replace(/-/g, " ")}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <div className={softInfoClass()}>
            <div className="font-medium text-slate-800">Prompt quality hint</div>
            <div className="mt-1">{promptHint}</div>
          </div>

          {task === "email" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Email subject</label>
                <input
                  value={emailForm.subject}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  placeholder="Follow-up after product demo"
                  className={inputClass()}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Recipient</label>
                <input
                  value={emailForm.recipient}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      recipient: e.target.value,
                    }))
                  }
                  placeholder="Client, hiring manager, support lead"
                  className={inputClass()}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Call to action</label>
                <input
                  value={emailForm.cta}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      cta: e.target.value,
                    }))
                  }
                  placeholder="Suggest a call next week"
                  className={inputClass()}
                />
              </div>

              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Purpose</label>
                <textarea
                  value={emailForm.purpose}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      purpose: e.target.value,
                    }))
                  }
                  placeholder="Explain why you are sending this email."
                  className={textareaClass("min-h-[120px]")}
                />
              </div>

              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Context</label>
                <textarea
                  value={emailForm.context}
                  onChange={(e) =>
                    setEmailForm((prev) => ({
                      ...prev,
                      context: e.target.value,
                    }))
                  }
                  placeholder="Add relevant background, timing, or previous conversation details."
                  className={textareaClass("min-h-[120px]")}
                />
              </div>
            </div>
          ) : task === "outline" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Topic</label>
                <input
                  value={outlineForm.topic}
                  onChange={(e) =>
                    setOutlineForm((prev) => ({
                      ...prev,
                      topic: e.target.value,
                    }))
                  }
                  placeholder="How to launch a SaaS in 2026"
                  className={inputClass()}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Audience</label>
                <input
                  value={outlineForm.audience}
                  onChange={(e) =>
                    setOutlineForm((prev) => ({
                      ...prev,
                      audience: e.target.value,
                    }))
                  }
                  placeholder="Founders, marketers, beginners"
                  className={inputClass()}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Depth</label>
                <select
                  value={outlineForm.depth}
                  onChange={(e) =>
                    setOutlineForm((prev) => ({
                      ...prev,
                      depth: e.target.value,
                    }))
                  }
                  className={inputClass()}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>

              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Goal</label>
                <input
                  value={outlineForm.goal}
                  onChange={(e) =>
                    setOutlineForm((prev) => ({
                      ...prev,
                      goal: e.target.value,
                    }))
                  }
                  placeholder="SEO article, lesson plan, landing page, video script"
                  className={inputClass()}
                />
              </div>

              <div className={`${panelClass()} md:col-span-2`}>
                <label className={labelClass()}>Notes or required sections</label>
                <textarea
                  value={outlineForm.notes}
                  onChange={(e) =>
                    setOutlineForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Mention sections, angles, keywords, or structure requirements."
                  className={textareaClass("min-h-[140px]")}
                />
              </div>
            </div>
          ) : task === "prompt-generator" ? (
            <div className="grid gap-4">
              <div className={panelClass()}>
                <label className={labelClass()}>Goal</label>
                <textarea
                  value={promptForm.goal}
                  onChange={(e) =>
                    setPromptForm((prev) => ({
                      ...prev,
                      goal: e.target.value,
                    }))
                  }
                  placeholder="Describe exactly what you want the prompt to help produce."
                  className={textareaClass("min-h-[120px]")}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Context</label>
                <textarea
                  value={promptForm.context}
                  onChange={(e) =>
                    setPromptForm((prev) => ({
                      ...prev,
                      context: e.target.value,
                    }))
                  }
                  placeholder="Add brand, audience, niche, domain knowledge, or use-case context."
                  className={textareaClass("min-h-[120px]")}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Constraints</label>
                <textarea
                  value={promptForm.constraints}
                  onChange={(e) =>
                    setPromptForm((prev) => ({
                      ...prev,
                      constraints: e.target.value,
                    }))
                  }
                  placeholder="Tone, banned words, style, length, formatting, or factual constraints."
                  className={textareaClass("min-h-[120px]")}
                />
              </div>

              <div className={panelClass()}>
                <label className={labelClass()}>Desired output format</label>
                <input
                  value={promptForm.outputFormat}
                  onChange={(e) =>
                    setPromptForm((prev) => ({
                      ...prev,
                      outputFormat: e.target.value,
                    }))
                  }
                  placeholder="Bullets, table, JSON, paragraph, headings"
                  className={inputClass()}
                />
              </div>
            </div>
          ) : (
            <div className={panelClass()}>
              <label className={labelClass()}>
                {task === "summarization"
                  ? "Paste text to summarize"
                  : task === "rewrite"
                  ? "Paste text to rewrite"
                  : "Enter your prompt or text"}
              </label>
              <textarea
                value={genericInput}
                onChange={(e) => setGenericInput(e.target.value)}
                placeholder={
                  task === "summarization"
                    ? "Paste a long paragraph, transcript, article, or notes here."
                    : task === "rewrite"
                    ? "Paste the original text you want rewritten."
                    : "Describe what you want the AI tool to generate, improve, or transform."
                }
                className={textareaClass("min-h-[220px]")}
              />
            </div>
          )}

          <div className={panelClass()}>
            <label className={labelClass()}>Extra instructions</label>
            <textarea
              value={extraInstructions}
              onChange={(e) => setExtraInstructions(e.target.value)}
              placeholder="Optional: add format, structure, style, constraints, or details you want the output to follow."
              className={textareaClass("min-h-[110px]")}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleRun}
              disabled={loading || !canRun}
              className={primaryButtonClass()}
            >
              {loading ? "Generating..." : meta.actionLabel}
            </button>

            <button
              onClick={() => copyText(output)}
              disabled={!output}
              className={secondaryButtonClass()}
            >
              Copy Output
            </button>

            <button onClick={resetAll} className={secondaryButtonClass()}>
              Reset
            </button>
          </div>

          {output ? (
            <div className={successHintClass()}>
              <div className="font-medium">How to use this result</div>
              <div className="mt-1">
                Review the output, refine the fields if needed, and rerun with
                stronger constraints if you want a tighter result.
              </div>
            </div>
          ) : null}

          {task === "email" ? (
            <EmailOutputView output={output} loading={loading} error={error} />
          ) : task === "outline" ? (
            <OutlineOutputView output={output} loading={loading} error={error} />
          ) : task === "prompt-generator" ? (
            <PromptOutputView output={output} loading={loading} error={error} />
          ) : (
            <GenericOutputView
              output={output}
              label={meta.outputLabel}
              loading={loading}
              error={error}
            />
          )}
        </div>

        <aside className="space-y-4">
          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Tone</div>
            <div className="mt-3">
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
          </div>

          {task !== "outline" &&
          task !== "email" &&
          task !== "prompt-generator" ? (
            <div className={elevatedPanelClass()}>
              <div className={sectionTitleClass()}>Audience</div>
              <div className="mt-3">
                <input
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="General audience"
                  className={inputClass()}
                />
              </div>
            </div>
          ) : null}

          {task !== "outline" ? (
            <div className={elevatedPanelClass()}>
              <div className={sectionTitleClass()}>Length</div>
              <div className="mt-3">
                <select
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className={inputClass()}
                >
                  <option value="short">Short</option>
                  <option value="medium">Medium</option>
                  <option value="long">Long</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          ) : null}

          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Examples</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              {meta.examples.map((example, index) => (
                <li key={`${example}-${index}`}>• {example}</li>
              ))}
            </ul>
          </div>

          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Better results checklist</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              {meta.checklist.map((entry, index) => (
                <li key={`${entry}-${index}`}>• {entry}</li>
              ))}
            </ul>
          </div>

          <div className={elevatedPanelClass()}>
            <div className={sectionTitleClass()}>Tips</div>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-q-muted">
              <li>• Stronger context usually improves output quality.</li>
              <li>• Use extra instructions to shape structure or tone.</li>
              <li>
                • Structured inputs usually produce better drafts than one vague
                prompt.
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}