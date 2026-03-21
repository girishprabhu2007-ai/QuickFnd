"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  ToolEngineDefinition,
  ToolEngineRunResult,
} from "@/engines/types";
import { loadEngine } from "@/lib/engine-loader";

type Props = {
  engineType: string;
  toolName: string;
};

type PasswordLikeResult = {
  score?: unknown;
  label?: unknown;
};

function isPasswordLikeResult(value: unknown): value is PasswordLikeResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return "score" in record && "label" in record;
}

function normalizeResult(raw: unknown): ToolEngineRunResult {
  if (!raw || typeof raw !== "object") {
    return { output: "" };
  }

  if (isPasswordLikeResult(raw)) {
    const label = String(raw.label || "");
    const score = raw.score;

    return {
      output: label,
      meta: [
        { label: "Strength", value: label },
        {
          label: "Score",
          value:
            typeof score === "number" || typeof score === "string"
              ? score
              : "",
        },
      ],
    };
  }

  return raw as ToolEngineRunResult;
}

export default function DynamicToolEngineClient({
  engineType,
  toolName,
}: Props) {
  const [engine, setEngine] = useState<ToolEngineDefinition | null>(null);
  const [engineLoading, setEngineLoading] = useState(true);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ToolEngineRunResult | null>(null);

  useEffect(() => {
    let active = true;

    async function run() {
      setEngineLoading(true);
      const loadedEngine = await loadEngine(engineType);

      if (!active) return;

      setEngine(loadedEngine);
      setEngineLoading(false);
    }

    run();

    return () => {
      active = false;
    };
  }, [engineType]);

  const title = useMemo(() => {
    return engine?.title || engine?.name || toolName;
  }, [engine, toolName]);

  async function copyOutput() {
    if (!result?.output) {
      return;
    }

    try {
      await navigator.clipboard.writeText(result.output);
    } catch {
      // ignore clipboard failures
    }
  }

  function handleRun() {
    if (!engine) {
      return;
    }

    const rawResult = engine.run(input);
    setResult(normalizeResult(rawResult));
  }

  if (engineLoading) {
    return (
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">{toolName}</h2>
        <div className="mt-5 text-sm text-q-muted">Loading tool engine...</div>
      </section>
    );
  }

  if (!engine) {
    return (
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">{toolName}</h2>
        <div className="mt-5 text-sm text-q-muted">
          Engine not found for this tool.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{title}</h2>

      <p className="mt-3 text-sm leading-7 text-q-muted">
        {engine.description}
      </p>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-q-text">
          {engine.inputLabel}
        </label>

        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={engine.inputPlaceholder}
          className="min-h-[180px] w-full rounded-2xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={handleRun}
          className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white transition hover:bg-q-primary-hover"
        >
          {engine.actionLabel}
        </button>

        <button
          onClick={copyOutput}
          disabled={!result?.output}
          className="rounded-xl border border-q-border bg-q-bg px-4 py-2 font-medium text-q-text transition hover:bg-q-card-hover disabled:opacity-50"
        >
          Copy Output
        </button>
      </div>

      {result?.error ? (
        <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result?.meta && result.meta.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {result.meta.map((item) => (
            <div
              key={`${item.label}-${String(item.value)}`}
              className="rounded-xl border border-q-border bg-q-bg p-4"
            >
              <div className="text-sm text-q-muted">{item.label}</div>
              <div className="mt-2 text-lg font-semibold text-q-text">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-q-text">
          {engine.outputLabel}
        </label>

        <textarea
          readOnly
          value={result?.output || ""}
          placeholder="Output will appear here"
          className="min-h-[180px] w-full rounded-2xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted"
        />
      </div>
    </section>
  );
}