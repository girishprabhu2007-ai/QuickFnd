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
    return engine?.title || toolName;
  }, [engine, toolName]);

  function normalizeResult(raw: any): ToolEngineRunResult {
    if (!raw) return { output: "" };

    // password strength special handling
    if ("score" in raw && "label" in raw) {
      return {
        output: raw.label,
        meta: [
          { label: "Strength", value: raw.label },
          { label: "Score", value: raw.score },
        ],
      };
    }

    return raw;
  }

  function handleRun() {
    if (!engine) return;

    const raw = engine.run(input);
    const normalized = normalizeResult(raw);
    setResult(normalized);
  }

  async function copyOutput() {
    if (!result?.output) return;

    try {
      await navigator.clipboard.writeText(result.output);
    } catch {}
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

      <p className="mt-3 text-sm text-q-muted">{engine.description}</p>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={engine.inputPlaceholder}
        className="mt-4 w-full rounded-2xl border border-q-border p-4"
      />

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleRun}
          className="rounded-xl bg-q-primary px-4 py-2 text-white"
        >
          {engine.actionLabel}
        </button>

        <button
          onClick={copyOutput}
          disabled={!result?.output}
          className="rounded-xl border px-4 py-2"
        >
          Copy
        </button>
      </div>

      {result?.meta && (
        <div className="mt-4 grid gap-3">
          {result.meta.map((m) => (
            <div key={m.label}>
              {m.label}: {m.value}
            </div>
          ))}
        </div>
      )}

      <textarea
        readOnly
        value={result?.output || ""}
        className="mt-4 w-full rounded-2xl border p-4"
      />
    </section>
  );
}