"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import CurrencyConverterClient from "@/components/tools/CurrencyConverterClient";
import { getToolEnginePreset } from "@/lib/tool-engine-presets";
import {
  getEngineUISchema,
  type EngineUIField,
  type EngineUISchema,
} from "@/lib/engine-ui-schemas";

type Props = {
  item: PublicContentItem;
};

type Snippet = {
  id: string;
  title: string;
  code: string;
};

type SchemaResult = {
  output: string;
  error?: string;
  previewColor?: string;
};

type SchemaStateValue = string | number | boolean;
type SchemaState = Record<string, SchemaStateValue>;

function Workspace({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[30px] border border-q-border bg-q-card p-6 shadow-sm md:p-8">
      <div className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-500">
          Tool Workspace
        </div>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-q-text md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-7 text-q-muted md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ToolGrid({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

function InputStage({
  title = "Inputs",
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[24px] border border-q-border bg-q-bg p-5 shadow-sm">
      <div className="mb-4">
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
          {title}
        </div>
        {subtitle ? (
          <div className="mt-2 text-sm leading-6 text-q-muted">{subtitle}</div>
        ) : null}
      </div>
      {children}
    </div>
  );
}

function ResultStage({
  title = "Result",
  output,
  error,
  previewColor,
  placeholder = "No output yet.",
}: {
  title?: string;
  output: string;
  error?: string;
  previewColor?: string;
  placeholder?: string;
}) {
  return (
    <section className="rounded-[26px] border border-q-border bg-gradient-to-br from-q-card to-q-bg p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
            Output
          </div>
          <div className="mt-2 text-lg font-semibold text-q-text">{title}</div>
        </div>
        <span
          className={
            output
              ? "rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800"
              : error
              ? "rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700"
              : "rounded-full border border-q-border bg-q-bg px-3 py-1 text-xs font-medium text-q-muted"
          }
        >
          {output ? "Ready" : error ? "Needs attention" : "Waiting"}
        </span>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-7 text-red-700">
          {error}
        </div>
      ) : null}

      {previewColor ? (
        <div className="mb-4 rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
          <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
            Preview
          </div>
          <div
            className="h-20 rounded-xl border border-q-border"
            style={{ backgroundColor: previewColor }}
          />
        </div>
      ) : null}

      <div className="rounded-2xl border border-q-border bg-q-card p-5 shadow-sm">
        <textarea
          readOnly
          value={output}
          placeholder={placeholder}
          className={textareaClass("min-h-[180px]")}
        />
      </div>
    </section>
  );
}

function StatsGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>;
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-4 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight text-q-text">
        {value}
      </div>
    </div>
  );
}

function InsightCard({
  title,
  children,
  tone = "neutral",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-blue-50 text-slate-800"
      : tone === "green"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-900"
      : tone === "red"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-q-border bg-q-card text-q-text";

  return (
    <div className={`rounded-2xl border p-4 text-sm leading-7 ${toneClass}`}>
      <div className="font-semibold">{title}</div>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function actionButtonClass(primary = false) {
  return primary
    ? "rounded-2xl bg-q-primary px-5 py-3 text-sm font-semibold text-white shadow-sm transition duration-150 hover:-translate-y-0.5 hover:bg-q-primary-hover hover:shadow-md"
    : "rounded-2xl border border-q-border bg-q-card px-5 py-3 text-sm font-semibold text-q-text transition duration-150 hover:-translate-y-0.5 hover:bg-q-card-hover hover:shadow-sm disabled:opacity-50";
}

function inputClass() {
  return "w-full rounded-2xl border border-q-border bg-q-card p-4 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-white";
}

function textareaClass(minHeight: string) {
  return `w-full rounded-2xl border border-q-border bg-q-card p-4 text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-white ${minHeight}`;
}

function softPanelClass() {
  return "rounded-2xl border border-q-border bg-q-card p-4 shadow-sm";
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // ignore clipboard issues
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function unicodeToBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function base64ToUnicode(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

function asStringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const items = value.map((v) => String(v).trim()).filter(Boolean);
  return items.length ? items : fallback;
}

function titleCase(value: string) {
  return value.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

function escapeJsonString(value: string) {
  return JSON.stringify(value).slice(1, -1);
}

function unescapeJsonString(value: string) {
  return JSON.parse(`"${value.replace(/"/g, '\\"')}"`) as string;
}

function textToBinary(value: string) {
  return value
    .split("")
    .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
    .join(" ");
}

function binaryToText(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .map((binary) => String.fromCharCode(parseInt(binary, 2)))
    .join("");
}

function normalizeHex(value: string) {
  const raw = value.trim().replace("#", "");
  if (raw.length === 3) {
    return raw
      .split("")
      .map((c) => c + c)
      .join("");
  }
  return raw;
}

function hexToRgbObject(hex: string) {
  const normalized = normalizeHex(hex);
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    throw new Error("Invalid hex color.");
  }

  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);

  return { r, g, b };
}

function rgbToHexString(r: number, g: number, b: number) {
  const values = [r, g, b];
  for (const value of values) {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new Error("RGB values must be whole numbers between 0 and 255.");
    }
  }

  return `#${values.map((v) => v.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function simpleMd5(value: string) {
  let hash1 = 0x811c9dc5;
  let hash2 = 0x01000193;

  for (let i = 0; i < value.length; i += 1) {
    const char = value.charCodeAt(i);
    hash1 ^= char;
    hash1 = Math.imul(hash1, 16777619);
    hash2 ^= char + i;
    hash2 = Math.imul(hash2, 2246822519);
  }

  const a = (hash1 >>> 0).toString(16).padStart(8, "0");
  const b = (hash2 >>> 0).toString(16).padStart(8, "0");
  return `${a}${b}`;
}

async function sha256Hash(value: string) {
  const buffer = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function buildInitialSchemaState(
  family: string,
  config: Record<string, unknown>,
  schema: EngineUISchema
): SchemaState {
  if (family === "string-generator") {
    return {
      length: Number(config.defaultLength ?? 24),
      useUppercase: Boolean(config.includeUppercase ?? true),
      useLowercase: Boolean(config.includeLowercase ?? true),
      useNumbers: Boolean(config.includeNumbers ?? true),
      useSymbols: Boolean(config.includeSymbols ?? false),
    };
  }

  if (family === "number-generator") {
    return {
      min: String(config.min ?? 1),
      max: String(config.max ?? 100),
    };
  }

  return schema.fields.reduce((acc, field) => {
    if (field.type === "checkbox") {
      acc[field.key] = false;
      return acc;
    }

    acc[field.key] = "";
    return acc;
  }, {} as SchemaState);
}

function renderSchemaField(
  field: EngineUIField,
  state: SchemaState,
  setState: React.Dispatch<React.SetStateAction<SchemaState>>
) {
  if (field.type === "checkbox") {
    return (
      <label
        key={field.key}
        className="flex items-center gap-2 rounded-2xl border border-q-border bg-q-card px-4 py-3 text-sm text-q-text shadow-sm"
      >
        <input
          type="checkbox"
          checked={Boolean(valueOr(state[field.key], false))}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              [field.key]: e.target.checked,
            }))
          }
        />
        {field.label}
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <div key={field.key}>
        <label className="mb-2 block text-sm font-medium text-q-text">{field.label}</label>
        <textarea
          value={String(valueOr(state[field.key], ""))}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              [field.key]: e.target.value,
            }))
          }
          placeholder={field.placeholder}
          rows={field.rows ?? 6}
          className={textareaClass("min-h-[160px]")}
        />
      </div>
    );
  }

  if (field.type === "range") {
    return (
      <div key={field.key}>
        <label className="mb-2 block text-sm font-medium text-q-text">
          {field.label}: {String(valueOr(state[field.key], ""))}
        </label>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={Number(valueOr(state[field.key], field.min ?? 0))}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              [field.key]: Number(e.target.value),
            }))
          }
          className="w-full"
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div key={field.key}>
        <label className="mb-2 block text-sm font-medium text-q-text">{field.label}</label>
        <select
          value={String(valueOr(state[field.key], ""))}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              [field.key]: e.target.value,
            }))
          }
          className={inputClass()}
        >
          {(field.options || []).map((option) => (
            <option key={`${field.key}-${option.value}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div key={field.key}>
      <label className="mb-2 block text-sm font-medium text-q-text">{field.label}</label>
      <input
        type={field.type}
        value={String(valueOr(state[field.key], ""))}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            [field.key]: e.target.value,
          }))
        }
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        step={field.step}
        className={inputClass()}
      />
    </div>
  );
}

function valueOr<T>(value: T | undefined, fallback: T) {
  return value === undefined ? fallback : value;
}

function runSchemaEngine(
  family: string,
  config: Record<string, unknown>,
  state: SchemaState
): SchemaResult {
  try {
    if (family === "string-generator") {
      const mode = String(config.mode || "random-string");

      if (mode === "uuid") {
        if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
          return { output: crypto.randomUUID() };
        }

        return {
          output: "",
          error: "UUID generation is not supported in this browser.",
        };
      }

      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      let chars = "";
      if (Boolean(state.useUppercase)) chars += upper;
      if (Boolean(state.useLowercase)) chars += lower;
      if (Boolean(state.useNumbers)) chars += numbers;
      if (Boolean(state.useSymbols)) chars += symbols;

      if (!chars) {
        return {
          output: "",
          error: "Select at least one character set.",
        };
      }

      const length = Number(state.length || 0);
      let next = "";

      for (let i = 0; i < length; i += 1) {
        next += chars[Math.floor(Math.random() * chars.length)];
      }

      return { output: next };
    }

    if (family === "codec") {
      const input = String(state.input || "");
      const mode = String(config.mode || "base64-encode");

      if (mode === "base64-encode") return { output: unicodeToBase64(input) };
      if (mode === "base64-decode") return { output: base64ToUnicode(input.trim()) };
      if (mode === "url-encode") return { output: encodeURIComponent(input) };
      if (mode === "url-decode") return { output: decodeURIComponent(input.trim()) };

      return { output: "" };
    }

    if (family === "number-generator") {
      const minNum = Number(state.min);
      const maxNum = Number(state.max);

      if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum > maxNum) {
        return { output: "", error: "Invalid range." };
      }

      const allowDecimal = Boolean(config.allowDecimal ?? false);
      const decimalPlaces = Number(config.decimalPlaces ?? 2);
      const random = Math.random() * (maxNum - minNum) + minNum;

      return {
        output: allowDecimal ? random.toFixed(decimalPlaces) : String(Math.floor(random)),
      };
    }

    if (family === "unit-converter") {
      const value = Number(state.input);
      if (!Number.isFinite(value)) {
        return { output: "", error: "Enter a valid number." };
      }

      const multiplier = Number(config.multiplier ?? 1);
      const precision = Number(config.precision ?? 4);
      const toUnit = String(config.toUnit || "");

      return {
        output: `${(value * multiplier).toFixed(precision)} ${toUnit}`.trim(),
      };
    }

    if (family === "color-tools") {
      const input = String(state.input || "");
      const mode = String(config.mode || "hex-to-rgb");

      if (mode === "hex-to-rgb") {
        const rgb = hexToRgbObject(input);
        return {
          output: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
          previewColor: `#${normalizeHex(input)}`,
        };
      }

      const parts = input.split(",").map((part) => Number(part.trim()));
      if (parts.length !== 3) {
        return {
          output: "",
          error: "Invalid RGB input. Use format like 255, 99, 71",
        };
      }

      const hex = rgbToHexString(parts[0], parts[1], parts[2]);
      return {
        output: hex,
        previewColor: hex,
      };
    }

    if (family === "developer-converters") {
      const input = String(state.input || "");
      const mode = String(config.mode || "text-to-binary");

      if (mode === "text-to-binary") return { output: textToBinary(input) };

      if (mode === "binary-to-text") {
        if (!/^[01\s]+$/.test(input.trim())) {
          return { output: "", error: "Invalid binary input." };
        }
        return { output: binaryToText(input) };
      }

      if (mode === "json-escape") return { output: escapeJsonString(input) };
      if (mode === "json-unescape") return { output: unescapeJsonString(input) };

      return { output: "" };
    }

    return { output: "" };
  } catch {
    return {
      output: "",
      error: "Invalid input for this tool.",
    };
  }
}

function SchemaDrivenToolCard({
  title,
  config,
  family,
  schema,
}: {
  title: string;
  config: Record<string, unknown>;
  family: string;
  schema: EngineUISchema;
}) {
  const [state, setState] = useState<SchemaState>(() =>
    buildInitialSchemaState(family, config, schema)
  );
  const [result, setResult] = useState<SchemaResult>({ output: "" });

  function run() {
    setResult(runSchemaEngine(family, config, state));
  }

  const checkboxFields = schema.fields.filter((field) => field.type === "checkbox");
  const nonCheckboxFields = schema.fields.filter((field) => field.type !== "checkbox");

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage
            subtitle={
              family === "unit-converter"
                ? `Convert ${String(config.fromUnit || "unit")} to ${String(
                    config.toUnit || "unit"
                  )}.`
                : "Adjust the inputs and run the tool."
            }
          >
            <div className="space-y-4">
              {nonCheckboxFields.map((field) => renderSchemaField(field, state, setState))}

              {checkboxFields.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {checkboxFields.map((field) => renderSchemaField(field, state, setState))}
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <button onClick={run} className={actionButtonClass(true)}>
                  {schema.action.label}
                </button>
                <button
                  onClick={() => copyText(result.output)}
                  disabled={!result.output}
                  className={actionButtonClass(false)}
                >
                  {schema.action.copyLabel || "Copy"}
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <ResultStage
            title="Tool output"
            output={result.output}
            error={result.error}
            previewColor={result.previewColor}
            placeholder={schema.outputPlaceholder || "Output"}
          />
        }
      />
    </Workspace>
  );
}

function StrengthChecker({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const [input, setInput] = useState("");

  const minLength = Number(config.minLength ?? 8);
  const rules = asStringArray(config.scoringRules, [
    "length",
    "uppercase",
    "lowercase",
    "number",
    "symbol",
  ]);

  const result = useMemo(() => {
    const password = input || "";
    const checks = {
      length: password.length >= minLength,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };

    const enabled = rules.filter((rule) => rule in checks);
    const passed = enabled.filter((rule) => checks[rule as keyof typeof checks]).length;
    const score = enabled.length ? Math.round((passed / enabled.length) * 100) : 0;

    let label = "Very Weak";
    if (score >= 85) label = "Strong";
    else if (score >= 60) label = "Good";
    else if (score >= 40) label = "Medium";
    else if (score >= 20) label = "Weak";

    return { checks, passed, total: enabled.length, score, label };
  }, [input, minLength, rules]);

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Paste or type a password to evaluate its strength.">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type or paste a password to check"
              className={textareaClass("min-h-[120px]")}
            />

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {rules.map((rule) => {
                const passed = result.checks[rule as keyof typeof result.checks] ?? false;
                return (
                  <div key={rule} className={softPanelClass()}>
                    <div className="text-sm capitalize text-q-muted">{rule}</div>
                    <div className="mt-2 text-base font-medium text-q-text">
                      {passed ? "Passed" : "Missing"}
                    </div>
                  </div>
                );
              })}
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-4">
            <StatsGrid>
              <StatCard label="Strength" value={result.label} />
              <StatCard label="Score" value={`${result.score}%`} />
              <StatCard label="Rules Passed" value={`${result.passed}/${result.total}`} />
            </StatsGrid>

            <InsightCard title="Minimum Length" tone="neutral">
              {minLength}
            </InsightCard>

            <InsightCard title="Current Length" tone="blue">
              {input.length}
            </InsightCard>
          </section>
        }
      />
    </Workspace>
  );
}

function TextFormatter({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const mode = String(config.mode || "json");
  const allowMinify = Boolean(config.allowMinify ?? true);

  function formatValue(pretty: boolean) {
    const raw = input.trim();

    if (!raw) {
      setOutput("");
      setError("Please enter content first.");
      return;
    }

    if (mode === "json") {
      try {
        const parsed = JSON.parse(raw);
        setOutput(pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
        setError("");
      } catch {
        setOutput("");
        setError("Invalid JSON. Please check your input.");
      }
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
      return;
    } catch {
      setOutput(raw.split("\n").map((line) => line.trimEnd()).join("\n"));
      setError("");
    }
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Paste content, then format or minify it.">
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === "json"
                    ? 'Paste JSON here, for example: {"name":"QuickFnd"}'
                    : "Paste code or JSON here"
                }
                className={textareaClass("min-h-[220px]")}
              />

              <div className="flex flex-wrap gap-3">
                <button onClick={() => formatValue(true)} className={actionButtonClass(true)}>
                  Format
                </button>
                {allowMinify ? (
                  <button onClick={() => formatValue(false)} className={actionButtonClass(false)}>
                    Minify
                  </button>
                ) : null}
                <button
                  onClick={() => copyText(output)}
                  disabled={!output}
                  className={actionButtonClass(false)}
                >
                  Copy Output
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <ResultStage
            title="Formatted output"
            output={output}
            error={error}
            placeholder="Formatted output"
          />
        }
      />
    </Workspace>
  );
}

function TextAnalyzer({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const [text, setText] = useState("");
  const wordsPerMinute = Number(config.readingWordsPerMinute ?? 200);

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;
    const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / wordsPerMinute)) : 0;

    return { words, characters, charactersNoSpaces, paragraphs, readingMinutes };
  }, [text, wordsPerMinute]);

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Paste or write text to analyze its length and reading stats.">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type text here"
              className={textareaClass("min-h-[260px]")}
            />
          </InputStage>
        }
        right={
          <section className="space-y-4">
            <StatsGrid>
              <StatCard label="Words" value={stats.words} />
              <StatCard label="Characters" value={stats.characters} />
              <StatCard label="No Spaces" value={stats.charactersNoSpaces} />
              <StatCard label="Paragraphs" value={stats.paragraphs} />
              <StatCard label="Read Time" value={`${stats.readingMinutes} min`} />
            </StatsGrid>
          </section>
        }
      />
    </Workspace>
  );
}

function TextTransformer({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<Record<string, string>>({});

  const modes = asStringArray(config.modes, ["lowercase", "uppercase", "titlecase", "slug"]);

  function runTransform() {
    const result: Record<string, string> = {};

    if (modes.includes("lowercase")) result.lowercase = input.toLowerCase();
    if (modes.includes("uppercase")) result.uppercase = input.toUpperCase();
    if (modes.includes("titlecase")) result.titlecase = titleCase(input);
    if (modes.includes("slug")) result.slug = slugify(input);
    if (modes.includes("trim")) result.trim = input.trim();

    setOutput(result);
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Transform the same text into multiple formats with one click.">
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to transform"
                className={textareaClass("min-h-[180px]")}
              />

              <div className="flex flex-wrap gap-3">
                <button onClick={runTransform} className={actionButtonClass(true)}>
                  Transform Text
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-4">
            {Object.entries(output).length === 0 ? (
              <InsightCard title="Result" tone="neutral">
                Run the transformer to see output variations.
              </InsightCard>
            ) : (
              Object.entries(output).map(([key, value]) => (
                <div key={key} className={softPanelClass()}>
                  <div className="mb-2 text-sm text-q-muted">{key}</div>
                  <div className="break-words text-sm text-q-text">{value}</div>
                </div>
              ))
            )}
          </section>
        }
      />
    </Workspace>
  );
}

function SnippetManager({ title }: { title: string }) {
  const [snippetTitle, setSnippetTitle] = useState("");
  const [code, setCode] = useState("");
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    try {
      if (typeof window === "undefined") {
        return [];
      }

      const stored = window.localStorage.getItem("quickfnd-snippets");
      if (!stored) {
        return [];
      }

      const parsed = JSON.parse(stored) as Snippet[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem("quickfnd-snippets", JSON.stringify(snippets));
    } catch {
      // ignore storage issues
    }
  }, [snippets]);

  function saveSnippet() {
    if (!snippetTitle.trim() || !code.trim()) return;

    const next: Snippet = {
      id: `${Date.now()}`,
      title: snippetTitle.trim(),
      code,
    };

    setSnippets((prev) => [next, ...prev]);
    setSnippetTitle("");
    setCode("");
  }

  function deleteSnippet(id: string) {
    setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Save reusable snippets in local storage for quick access.">
            <div className="space-y-4">
              <input
                value={snippetTitle}
                onChange={(e) => setSnippetTitle(e.target.value)}
                placeholder="Snippet title"
                className={inputClass()}
              />
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste snippet code"
                className="min-h-[180px] w-full rounded-2xl border border-q-border bg-q-card p-4 font-mono text-q-text outline-none transition duration-150 placeholder:text-q-muted focus:border-blue-400/60 focus:bg-white"
              />
              <button onClick={saveSnippet} className={actionButtonClass(true)}>
                Save Snippet
              </button>
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-3">
            {snippets.length === 0 ? (
              <InsightCard title="Saved snippets" tone="neutral">
                No snippets saved yet.
              </InsightCard>
            ) : (
              snippets.map((snippet) => (
                <div key={snippet.id} className={softPanelClass()}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-medium text-q-text">{snippet.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyText(snippet.code)}
                        className="rounded-lg border border-q-border bg-q-card px-3 py-1 text-sm text-q-text hover:bg-q-card-hover"
                      >
                        Copy
                      </button>
                      <button
                        onClick={() => deleteSnippet(snippet.id)}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-700 hover:opacity-90"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-xl border border-q-border bg-white p-3 text-sm text-q-text">
                    {snippet.code}
                  </pre>
                </div>
              ))
            )}
          </section>
        }
      />
    </Workspace>
  );
}

function RegexTools({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const mode = String(config.mode || "test");
  const defaultFlags = String(config.flags || "g");

  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState(defaultFlags);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [matches, setMatches] = useState<string[]>([]);

  function runRegex() {
    try {
      const regex = new RegExp(pattern, flags);
      const sourceText = String(text || "");

      if (mode === "extract") {
        const list = Array.from(sourceText.matchAll(regex)).map((match) => match[0]);
        setMatches(list);
        setSummary(`Found ${list.length} match(es).`);
        setError("");
        return;
      }

      const list = Array.from(sourceText.matchAll(regex)).map((match) => match[0]);
      setMatches(list);
      setSummary(
        regex.test(sourceText)
          ? `Pattern matched. Total matches: ${list.length}.`
          : "No matches found."
      );
      setError("");
    } catch {
      setMatches([]);
      setSummary("");
      setError("Invalid regular expression or flags.");
    }
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Test a pattern against input text or extract matches.">
            <div className="space-y-4">
              <input
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="Regex pattern, for example: \\b\\w+@\\w+\\.\\w+\\b"
                className={inputClass()}
              />

              <input
                value={flags}
                onChange={(e) => setFlags(e.target.value)}
                placeholder="Flags, for example: gmi"
                className={inputClass()}
              />

              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste text to test against the regex"
                className={textareaClass("min-h-[200px]")}
              />

              <div className="flex flex-wrap gap-3">
                <button onClick={runRegex} className={actionButtonClass(true)}>
                  {mode === "extract" ? "Extract Matches" : "Test Regex"}
                </button>
                <button
                  onClick={() => copyText(matches.join("\n"))}
                  disabled={matches.length === 0}
                  className={actionButtonClass(false)}
                >
                  Copy Matches
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-4">
            {error ? (
              <InsightCard title="Regex error" tone="red">
                {error}
              </InsightCard>
            ) : null}

            {summary ? (
              <InsightCard title="Summary" tone="blue">
                {summary}
              </InsightCard>
            ) : (
              <InsightCard title="Summary" tone="neutral">
                Run the regex tool to see matching results.
              </InsightCard>
            )}

            {matches.length > 0
              ? matches.map((match, index) => (
                  <div key={`${match}-${index}`} className={softPanelClass()}>
                    <div className="text-sm text-q-muted">Match {index + 1}</div>
                    <div className="mt-2 break-words text-q-text">{match}</div>
                  </div>
                ))
              : null}
          </section>
        }
      />
    </Workspace>
  );
}

function HashTools({
  title,
  config,
}: {
  title: string;
  config: Record<string, unknown>;
}) {
  const mode = String(config.mode || "sha256");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  async function generateHash() {
    if (!input) {
      setError("Please enter text first.");
      setOutput("");
      return;
    }

    setWorking(true);
    setError("");

    try {
      if (mode === "sha256") {
        const hash = await sha256Hash(input);
        setOutput(hash);
      } else {
        setOutput(simpleMd5(input));
      }
    } catch {
      setOutput("");
      setError("Failed to generate hash.");
    } finally {
      setWorking(false);
    }
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Generate a hash from the provided text input.">
            <div className="space-y-4">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter text to hash"
                className={textareaClass("min-h-[180px]")}
              />

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={generateHash}
                  disabled={working}
                  className={actionButtonClass(true)}
                >
                  {working ? "Generating..." : "Generate Hash"}
                </button>
                <button
                  onClick={() => copyText(output)}
                  disabled={!output}
                  className={actionButtonClass(false)}
                >
                  Copy Hash
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <ResultStage
            title="Hash output"
            output={output}
            error={error}
            placeholder="Hash output"
          />
        }
      />
    </Workspace>
  );
}

function TimestampTools({ title }: { title: string }) {
  const [unixInput, setUnixInput] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [unixOutput, setUnixOutput] = useState("");
  const [dateOutput, setDateOutput] = useState("");
  const [error, setError] = useState("");

  function fromUnix() {
    try {
      const raw = Number(unixInput.trim());
      if (!Number.isFinite(raw)) {
        throw new Error();
      }

      const milliseconds = unixInput.trim().length <= 10 ? raw * 1000 : raw;
      const date = new Date(milliseconds);

      if (Number.isNaN(date.getTime())) {
        throw new Error();
      }

      setDateOutput(date.toISOString());
      setError("");
    } catch {
      setDateOutput("");
      setError("Invalid Unix timestamp.");
    }
  }

  function toUnix() {
    try {
      const date = new Date(dateInput);
      if (Number.isNaN(date.getTime())) {
        throw new Error();
      }

      setUnixOutput(String(Math.floor(date.getTime() / 1000)));
      setError("");
    } catch {
      setUnixOutput("");
      setError("Invalid date value.");
    }
  }

  function useNow() {
    const now = new Date();
    setDateInput(now.toISOString().slice(0, 16));
    setUnixOutput(String(Math.floor(now.getTime() / 1000)));
    setDateOutput(now.toISOString());
    setError("");
  }

  return (
    <Workspace title={title}>
      <div className="grid gap-6 xl:grid-cols-2">
        <InputStage title="Unix Timestamp To Date" subtitle="Convert Unix timestamps into ISO dates.">
          <div className="space-y-3">
            <input
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              placeholder="Enter Unix timestamp"
              className={inputClass()}
            />
            <div className="flex flex-wrap gap-3">
              <button onClick={fromUnix} className={actionButtonClass(true)}>
                Convert To Date
              </button>
              <button
                onClick={() => copyText(dateOutput)}
                disabled={!dateOutput}
                className={actionButtonClass(false)}
              >
                Copy Date
              </button>
            </div>
            <textarea
              readOnly
              value={dateOutput}
              placeholder="ISO date output"
              className={textareaClass("min-h-[100px]")}
            />
          </div>
        </InputStage>

        <InputStage title="Date To Unix Timestamp" subtitle="Convert a selected date and time into Unix seconds.">
          <div className="space-y-3">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className={inputClass()}
            />
            <div className="flex flex-wrap gap-3">
              <button onClick={toUnix} className={actionButtonClass(true)}>
                Convert To Unix
              </button>
              <button onClick={useNow} className={actionButtonClass(false)}>
                Use Current Time
              </button>
              <button
                onClick={() => copyText(unixOutput)}
                disabled={!unixOutput}
                className={actionButtonClass(false)}
              >
                Copy Unix
              </button>
            </div>
            <textarea
              readOnly
              value={unixOutput}
              placeholder="Unix timestamp output"
              className={textareaClass("min-h-[100px]")}
            />
          </div>
        </InputStage>

        {error ? (
          <div className="xl:col-span-2">
            <InsightCard title="Timestamp error" tone="red">
              {error}
            </InsightCard>
          </div>
        ) : null}
      </div>
    </Workspace>
  );
}

function GenericTool({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Workspace title={title} description={description}>
      <InsightCard title="Tool ready" tone="neutral">
        This utility is available as an indexable QuickFnd tool entry.
      </InsightCard>
    </Workspace>
  );
}


// ─── QR Code Generator ────────────────────────────────────────────────────────
function QRGenerator({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [qrSrc, setQrSrc] = useState("");
  const [size, setSize] = useState("256");
  const [copied, setCopied] = useState(false);

  function generate() {
    if (!input.trim()) return;
    const encoded = encodeURIComponent(input.trim());
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&format=png&margin=10`;
    setQrSrc(url);
  }

  async function downloadQR() {
    if (!qrSrc) return;
    const a = document.createElement("a");
    a.href = qrSrc;
    a.download = "qrcode.png";
    a.click();
  }

  async function copyLink() {
    await copyText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Enter a URL, text, phone number, or any content to encode into a QR code.">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-q-text">Content to encode</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="https://example.com or any text..."
                  rows={4}
                  className={textareaClass("min-h-[120px]")}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-q-text">Size</label>
                <select
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className={inputClass()}
                >
                  <option value="128">128×128 — Small</option>
                  <option value="256">256×256 — Medium</option>
                  <option value="512">512×512 — Large</option>
                  <option value="1024">1024×1024 — High Resolution</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={generate} disabled={!input.trim()} className={actionButtonClass(true)}>
                  Generate QR Code
                </button>
                {qrSrc && (
                  <button onClick={downloadQR} className={actionButtonClass(false)}>
                    Download PNG
                  </button>
                )}
                <button onClick={copyLink} disabled={!input.trim()} className={actionButtonClass(false)}>
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            </div>
          </InputStage>
        }
        right={
          <section className="rounded-[26px] border border-q-border bg-q-card p-5 shadow-sm">
            <div className="mb-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted">Output</div>
              <div className="mt-2 text-lg font-semibold text-q-text">QR Code</div>
            </div>
            {qrSrc ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={qrSrc}
                  alt="Generated QR code"
                  className="rounded-2xl border border-q-border bg-white p-3"
                  style={{ width: "200px", height: "200px", imageRendering: "pixelated" }}
                />
                <p className="text-center text-xs text-q-muted break-all">{input.slice(0, 60)}{input.length > 60 ? "..." : ""}</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-q-border bg-q-bg p-8 text-center text-sm text-q-muted">
                Enter content and click Generate to create your QR code
              </div>
            )}
          </section>
        }
      />
    </Workspace>
  );
}

// ─── Color Picker ─────────────────────────────────────────────────────────────
function ColorPicker({ title }: { title: string }) {
  const [hex, setHex] = useState("#3b82f6");
  const [pickerHex, setPickerHex] = useState("#3b82f6");

  const rgb = useMemo(() => {
    try {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    } catch { return null; }
  }, [hex]);

  const hsl = useMemo(() => {
    if (!rgb) return null;
    const r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }, [rgb]);

  function handlePickerChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPickerHex(e.target.value);
    setHex(e.target.value.toUpperCase());
  }

  function handleHexInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setHex(val);
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) setPickerHex(val);
  }

  const textColor = rgb && (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 128 ? "#000" : "#fff";

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Pick a color visually or enter a HEX value to get all color formats.">
            <div className="space-y-4">
              {/* Visual picker */}
              <div
                className="flex h-32 w-full items-center justify-center rounded-2xl border border-q-border transition-colors"
                style={{ backgroundColor: pickerHex }}
              >
                <span className="text-2xl font-bold" style={{ color: textColor }}>{hex.toUpperCase()}</span>
              </div>

              <div className="flex gap-3">
                <input
                  type="color"
                  value={pickerHex}
                  onChange={handlePickerChange}
                  className="h-12 w-16 cursor-pointer rounded-xl border border-q-border bg-q-card"
                  title="Click to open color picker"
                />
                <input
                  type="text"
                  value={hex}
                  onChange={handleHexInput}
                  placeholder="#3b82f6"
                  className={`flex-1 ${inputClass()} font-mono`}
                />
              </div>

              <div className="grid grid-cols-6 gap-2">
                {["#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#8b5cf6","#ec4899","#06b6d4","#000000","#6b7280","#d1d5db","#ffffff"].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setHex(c.toUpperCase()); setPickerHex(c); }}
                    className="h-8 rounded-lg border border-q-border transition hover:scale-110"
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-4">
            {[
              { label: "HEX", value: hex.toUpperCase(), copyVal: hex.toUpperCase() },
              { label: "RGB", value: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "—", copyVal: rgb ? `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` : "" },
              { label: "RGB Values", value: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "—", copyVal: rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : "" },
              { label: "HSL", value: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "—", copyVal: hsl ? `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` : "" },
              { label: "CSS Variable", value: rgb ? `--color: ${hex.toUpperCase()};` : "—", copyVal: rgb ? `--color: ${hex.toUpperCase()};` : "" },
              { label: "Tailwind-style", value: rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},1)` : "—", copyVal: rgb ? `rgba(${rgb.r},${rgb.g},${rgb.b},1)` : "" },
            ].map(({ label, value, copyVal }) => (
              <div key={label} className={softPanelClass() + " flex items-center justify-between gap-3"}>
                <div>
                  <div className="text-xs text-q-muted">{label}</div>
                  <div className="mt-1 font-mono text-sm text-q-text">{value}</div>
                </div>
                <button
                  onClick={() => copyText(copyVal)}
                  disabled={!copyVal}
                  className="shrink-0 rounded-lg border border-q-border bg-q-bg px-3 py-1 text-xs text-q-muted transition hover:bg-q-card-hover disabled:opacity-40"
                >
                  Copy
                </button>
              </div>
            ))}
          </section>
        }
      />
    </Workspace>
  );
}

// ─── Markdown Editor ──────────────────────────────────────────────────────────
function MarkdownEditor({ title }: { title: string }) {
  const [markdown, setMarkdown] = useState(`# Hello World

Welcome to the **QuickFnd Markdown Editor**.

## Features
- Real-time preview
- Copy HTML output
- Supports standard Markdown

### Code Example
\`\`\`
const hello = "world";
\`\`\`

> Blockquotes work too.

---

Write your markdown on the left, see the preview on the right.
`);

  const html = useMemo(() => {
    // Simple markdown to HTML converter
    let result = markdown
      .replace(/^#{6}\s(.+)$/gm, "<h6>$1</h6>")
      .replace(/^#{5}\s(.+)$/gm, "<h5>$1</h5>")
      .replace(/^#{4}\s(.+)$/gm, "<h4>$1</h4>")
      .replace(/^#{3}\s(.+)$/gm, "<h3>$1</h3>")
      .replace(/^#{2}\s(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#{1}\s(.+)$/gm, "<h1>$1</h1>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/```[\s\S]*?```/g, (match) => `<pre><code>${match.slice(3, -3).trim()}</code></pre>`)
      .replace(/^>\s(.+)$/gm, "<blockquote>$1</blockquote>")
      .replace(/^---$/gm, "<hr/>")
      .replace(/^\*\s(.+)$/gm, "<li>$1</li>")
      .replace(/^-\s(.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
            .split("\n\n").join("</p><p>")
      .replace(/^(?!<[h1-6|ul|li|blockquote|pre|hr])(.+)$/gm, "$1");
    return `<p>${result}</p>`;
  }, [markdown]);

  const wordCount = markdown.trim() ? markdown.trim().split(/\s+/).length : 0;

  return (
    <Workspace title={title}>
      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <InputStage title="Markdown Input" subtitle="Write or paste your Markdown here.">
            <div className="space-y-3">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="h-96 w-full rounded-2xl border border-q-border bg-q-card p-4 font-mono text-sm text-q-text outline-none transition placeholder:text-q-muted focus:border-blue-400/60"
                spellCheck={false}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-q-muted">{wordCount} words · {markdown.length} chars</span>
                <div className="flex gap-2">
                  <button onClick={() => setMarkdown("")} className={actionButtonClass(false)}>Clear</button>
                  <button onClick={() => copyText(html)} className={actionButtonClass(true)}>Copy HTML</button>
                </div>
              </div>
            </div>
          </InputStage>
        </div>

        <div>
          <div className="rounded-[24px] border border-q-border bg-q-bg p-5 shadow-sm h-full">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-q-muted mb-4">Preview</div>
            <div
              className="prose prose-sm max-w-none text-q-text"
              style={{
                lineHeight: "1.7",
              }}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        </div>
      </div>
    </Workspace>
  );
}

// ─── CSV to JSON ──────────────────────────────────────────────────────────────
function CSVtoJSON({ title }: { title: string }) {
  const [csv, setCsv] = useState(`name,age,city,email
Alice,28,Mumbai,alice@example.com
Bob,34,Delhi,bob@example.com
Charlie,25,Bangalore,charlie@example.com`);
  const [delimiter, setDelimiter] = useState(",");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [stats, setStats] = useState<{ rows: number; cols: number } | null>(null);

  function convert() {
    try {
      const lines = csv.trim().split("\n").filter(Boolean);
      if (lines.length < 2) throw new Error("Need at least a header row and one data row.");

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ""));
      const rows = lines.slice(1).map(line => {
        const values = line.split(delimiter).map(v => v.trim().replace(/^"|"$/g, ""));
        const obj: Record<string, string | number> = {};
        headers.forEach((h, i) => {
          const val = values[i] ?? "";
          obj[h] = isNaN(Number(val)) || val === "" ? val : Number(val);
        });
        return obj;
      });

      setOutput(JSON.stringify(rows, null, 2));
      setStats({ rows: rows.length, cols: headers.length });
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Conversion failed.");
      setOutput("");
      setStats(null);
    }
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Paste CSV data. The first row is treated as column headers.">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-q-text shrink-0">Delimiter:</label>
                <select value={delimiter} onChange={(e) => setDelimiter(e.target.value)} className={`w-40 ${inputClass()}`}>
                  <option value=",">Comma (,)</option>
                  <option value=";">Semicolon (;)</option>
                  <option value="\t">Tab</option>
                  <option value="|">Pipe (|)</option>
                </select>
              </div>
              <textarea
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder="name,age,city&#10;Alice,28,Mumbai&#10;Bob,34,Delhi"
                rows={10}
                className={textareaClass("min-h-[200px]") + " font-mono text-sm"}
              />
              <div className="flex gap-3">
                <button onClick={convert} className={actionButtonClass(true)}>Convert to JSON</button>
                <button onClick={() => copyText(output)} disabled={!output} className={actionButtonClass(false)}>Copy JSON</button>
              </div>
              {stats && (
                <div className="flex gap-3 text-xs text-q-muted">
                  <span>✓ {stats.rows} rows</span>
                  <span>✓ {stats.cols} columns</span>
                </div>
              )}
            </div>
          </InputStage>
        }
        right={
          <ResultStage
            title="JSON output"
            output={output}
            error={error}
            placeholder="JSON output will appear here after conversion"
          />
        }
      />
    </Workspace>
  );
}

// ─── IP Address Lookup ────────────────────────────────────────────────────────
function IPLookup({ title }: { title: string }) {
  const [ip, setIp] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");

  async function lookup() {
    const target = ip.trim() || "";
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const url = target ? `https://ipapi.co/${target}/json/` : "https://ipapi.co/json/";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Lookup failed. Check the IP address and try again.");
      const data = await res.json();

      if (data.error) throw new Error(data.reason || "IP not found.");

      setResult({
        "IP Address": data.ip || "—",
        "Country": data.country_name || "—",
        "Region": data.region || "—",
        "City": data.city || "—",
        "Postal Code": data.postal || "—",
        "Timezone": data.timezone || "—",
        "ISP / Organisation": data.org || "—",
        "Latitude": String(data.latitude || "—"),
        "Longitude": String(data.longitude || "—"),
        "Currency": data.currency_name ? `${data.currency_name} (${data.currency})` : "—",
        "Languages": data.languages || "—",
        "Calling Code": data.country_calling_code || "—",
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Enter an IP address to look it up, or leave blank to check your own IP.">
            <div className="space-y-4">
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && lookup()}
                placeholder="e.g. 8.8.8.8 (leave blank for your own IP)"
                className={inputClass()}
              />
              <div className="flex gap-3">
                <button onClick={lookup} disabled={loading} className={actionButtonClass(true)}>
                  {loading ? "Looking up..." : "Lookup IP"}
                </button>
                <button onClick={() => { setIp(""); setResult(null); setError(""); }} className={actionButtonClass(false)}>
                  My IP
                </button>
              </div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-3">
            {result ? (
              Object.entries(result).map(([key, value]) => (
                <div key={key} className={softPanelClass() + " flex items-center justify-between gap-3"}>
                  <div>
                    <div className="text-xs text-q-muted">{key}</div>
                    <div className="mt-0.5 text-sm font-medium text-q-text">{value}</div>
                  </div>
                  <button
                    onClick={() => copyText(value)}
                    className="shrink-0 rounded-lg border border-q-border bg-q-bg px-2.5 py-1 text-xs text-q-muted hover:bg-q-card-hover"
                  >
                    Copy
                  </button>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-q-border bg-q-card p-6 text-center text-sm text-q-muted">
                {loading ? "Looking up IP address..." : "Enter an IP address and click Lookup"}
              </div>
            )}
          </section>
        }
      />
    </Workspace>
  );
}

// ─── Robots.txt Generator ─────────────────────────────────────────────────────
function RobotsTxtGenerator({ title }: { title: string }) {
  const [rules, setRules] = useState([
    { userAgent: "*", allow: "/", disallow: "" },
  ]);
  const [sitemap, setSitemap] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [copied, setCopied] = useState(false);

  function addRule() {
    setRules((prev) => [...prev, { userAgent: "*", allow: "", disallow: "" }]);
  }
  function removeRule(i: number) {
    setRules((prev) => prev.filter((_, idx) => idx !== i));
  }
  function updateRule(i: number, key: "userAgent" | "allow" | "disallow", value: string) {
    setRules((prev) => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));
  }

  const output = [
    "# Generated by QuickFnd Robots.txt Generator",
    "# https://quickfnd.com/tools/robots-txt-generator",
    "",
    ...rules.flatMap((r) => {
      const lines = [`User-agent: ${r.userAgent || "*"}`];
      if (r.disallow) lines.push(`Disallow: ${r.disallow}`);
      if (r.allow) lines.push(`Allow: ${r.allow}`);
      if (crawlDelay) lines.push(`Crawl-delay: ${crawlDelay}`);
      lines.push("");
      return lines;
    }),
    sitemap ? `Sitemap: ${sitemap}` : "",
  ].filter((l, i, arr) => !(l === "" && arr[i - 1] === "")).join("\n").trim();

  function copy() {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Workspace title={title}>
      <ToolGrid
        left={
          <InputStage subtitle="Add rules for each bot. Use * for all bots. Leave Disallow blank to allow everything.">
            <div className="space-y-4">
              {rules.map((rule, i) => (
                <div key={i} className="rounded-2xl border border-q-border bg-q-bg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-widest text-q-muted">Rule {i + 1}</span>
                    {rules.length > 1 && (
                      <button onClick={() => removeRule(i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-q-muted">User-agent</label>
                    <input value={rule.userAgent} onChange={(e) => updateRule(i, "userAgent", e.target.value)}
                      placeholder="* (all bots) or Googlebot" className={inputClass()} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-q-muted">Disallow (leave blank to allow all)</label>
                    <input value={rule.disallow} onChange={(e) => updateRule(i, "disallow", e.target.value)}
                      placeholder="/admin/ or /private/" className={inputClass()} />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-q-muted">Allow (optional override)</label>
                    <input value={rule.allow} onChange={(e) => updateRule(i, "allow", e.target.value)}
                      placeholder="/public/" className={inputClass()} />
                  </div>
                </div>
              ))}
              <button onClick={addRule} className={actionButtonClass(false)}>+ Add Rule</button>
              <div>
                <label className="mb-1 block text-sm font-medium text-q-text">Sitemap URL (optional)</label>
                <input value={sitemap} onChange={(e) => setSitemap(e.target.value)}
                  placeholder="https://yoursite.com/sitemap.xml" className={inputClass()} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-q-text">Crawl-delay in seconds (optional)</label>
                <input type="number" value={crawlDelay} onChange={(e) => setCrawlDelay(e.target.value)}
                  placeholder="10" className={inputClass()} />
              </div>
            </div>
          </InputStage>
        }
        right={
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-q-text">Your robots.txt</span>
              <button onClick={copy} className={actionButtonClass(true)}>{copied ? "Copied!" : "Copy"}</button>
            </div>
            <pre className="rounded-2xl border border-q-border bg-q-bg p-4 text-xs font-mono text-q-text overflow-auto whitespace-pre-wrap min-h-[200px]">{output}</pre>
            <InsightCard title="How to use" tone="blue">
              Upload this file to your domain root as robots.txt — e.g. https://yoursite.com/robots.txt
            </InsightCard>
          </section>
        }
      />
    </Workspace>
  );
}

// ─── Open Graph Tester ────────────────────────────────────────────────────────
function OpenGraphTester({ title }: { title: string }) {
  const [ogTitle, setOgTitle] = useState("My Amazing Page");
  const [ogDesc, setOgDesc] = useState("This is the description that shows on social media when someone shares this link.");
  const [ogImage, setOgImage] = useState("https://via.placeholder.com/1200x630/3b82f6/ffffff?text=OG+Preview");
  const [ogUrl, setOgUrl] = useState("https://yoursite.com/page");
  const [ogSite, setOgSite] = useState("YourSite");
  const [copied, setCopied] = useState(false);

  const titleLen = ogTitle.length;
  const descLen = ogDesc.length;
  const titleOk = titleLen >= 30 && titleLen <= 60;
  const descOk = descLen >= 70 && descLen <= 160;

  const metatags = `<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content="${ogUrl}" />
<meta property="og:title" content="${ogTitle}" />
<meta property="og:description" content="${ogDesc}" />
<meta property="og:image" content="${ogImage}" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:url" content="${ogUrl}" />
<meta name="twitter:title" content="${ogTitle}" />
<meta name="twitter:description" content="${ogDesc}" />
<meta name="twitter:image" content="${ogImage}" />`;

  function copy() {
    navigator.clipboard.writeText(metatags);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Workspace title={title}>
      <div className="grid gap-6 xl:grid-cols-2">
        <InputStage subtitle="Fill in your Open Graph details to preview how your page appears on social media.">
          <div className="space-y-4">
            <div>
              <label className="mb-1 flex items-center justify-between text-sm font-medium text-q-text">
                <span>Title</span>
                <span className={`text-xs ${titleOk ? "text-emerald-500" : titleLen > 60 ? "text-red-500" : "text-q-muted"}`}>
                  {titleLen}/60 {titleOk ? "✓" : titleLen > 60 ? "too long" : ""}
                </span>
              </label>
              <input value={ogTitle} onChange={(e) => setOgTitle(e.target.value)}
                placeholder="Your page title" className={inputClass()} />
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-sm font-medium text-q-text">
                <span>Description</span>
                <span className={`text-xs ${descOk ? "text-emerald-500" : descLen > 160 ? "text-red-500" : "text-q-muted"}`}>
                  {descLen}/160 {descOk ? "✓" : descLen > 160 ? "too long" : ""}
                </span>
              </label>
              <textarea value={ogDesc} onChange={(e) => setOgDesc(e.target.value)}
                rows={3} placeholder="Page description for social sharing" className={textareaClass("min-h-[80px]")} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-q-text">Image URL</label>
              <input value={ogImage} onChange={(e) => setOgImage(e.target.value)}
                placeholder="https://yoursite.com/og-image.png (1200×630 recommended)" className={inputClass()} />
              <p className="mt-1 text-xs text-q-muted">Recommended size: 1200×630px, under 1MB</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-q-text">Page URL</label>
              <input value={ogUrl} onChange={(e) => setOgUrl(e.target.value)}
                placeholder="https://yoursite.com/page" className={inputClass()} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-q-text">Site Name</label>
              <input value={ogSite} onChange={(e) => setOgSite(e.target.value)}
                placeholder="Your Site Name" className={inputClass()} />
            </div>
          </div>
        </InputStage>

        <div className="space-y-4">
          {/* Twitter/X Card Preview */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2">Twitter / X Preview</div>
            <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
              {ogImage && (
                <div className="w-full h-40 bg-q-card overflow-hidden">
                  <img src={ogImage} alt="OG preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="p-3">
                <div className="text-xs text-q-muted">{ogUrl ? new URL(ogUrl.startsWith("http") ? ogUrl : "https://" + ogUrl).hostname : "yoursite.com"}</div>
                <div className="font-semibold text-q-text text-sm mt-0.5 line-clamp-2">{ogTitle || "Page Title"}</div>
                <div className="text-xs text-q-muted mt-1 line-clamp-2">{ogDesc || "Page description"}</div>
              </div>
            </div>
          </div>

          {/* Facebook Preview */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2">Facebook Preview</div>
            <div className="rounded-2xl border border-q-border bg-q-bg overflow-hidden">
              {ogImage && (
                <div className="w-full h-36 bg-q-card overflow-hidden">
                  <img src={ogImage} alt="Facebook OG preview" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="p-3 border-t border-q-border">
                <div className="text-xs uppercase text-q-muted">{ogSite || "YOURSITE"}</div>
                <div className="font-semibold text-q-text text-sm line-clamp-2">{ogTitle || "Page Title"}</div>
                <div className="text-xs text-q-muted line-clamp-2">{ogDesc || "Page description"}</div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={copy} className={actionButtonClass(true)}>{copied ? "Copied!" : "Copy Meta Tags"}</button>
          </div>
        </div>
      </div>
    </Workspace>
  );
}

type FamilyRendererProps = {
  title: string;
  description: string;
  config: Record<string, unknown>;
};

function renderByFamily({
  family,
  title,
  description,
  config,
}: FamilyRendererProps & {
  family: string;
}) {
  const schema = getEngineUISchema(family, config);

  if (family === "currency-converter") {
    return <CurrencyConverterClient />;
  }

  if (schema) {
    return (
      <SchemaDrivenToolCard
        title={title}
        config={config}
        family={family}
        schema={schema}
      />
    );
  }

  if (family === "strength-checker") {
    return <StrengthChecker title={title} config={config} />;
  }

  if (family === "text-formatter") {
    return <TextFormatter title={title} config={config} />;
  }

  if (family === "text-analyzer") {
    return <TextAnalyzer title={title} config={config} />;
  }

  if (family === "text-transformer") {
    return <TextTransformer title={title} config={config} />;
  }

  if (family === "snippet-manager") {
    return <SnippetManager title={title} />;
  }

  if (family === "regex-tools") {
    return <RegexTools title={title} config={config} />;
  }

  if (family === "hash-tools") {
    return <HashTools title={title} config={config} />;
  }

  if (family === "timestamp-tools") {
    return <TimestampTools title={title} />;
  }

  if (family === "qr-generator") {
    return <QRGenerator title={title} />;
  }

  if (family === "color-picker") {
    return <ColorPicker title={title} />;
  }

  if (family === "markdown-editor") {
    return <MarkdownEditor title={title} />;
  }

  if (family === "csv-to-json") {
    return <CSVtoJSON title={title} />;
  }

  if (family === "ip-lookup") {
    return <IPLookup title={title} />;
  }

  if (family === "cron-builder") {
    return <CronBuilder title={title} />;
  }

  if (family === "diff-checker") {
    return <DiffChecker title={title} />;
  }

  if (family === "jwt-decoder") {
    return <JWTDecoder title={title} />;
  }

  if (family === "lorem-ipsum-generator") {
    return <LoremIpsumGenerator title={title} />;
  }

  if (family === "number-base-converter") {
    return <NumberBaseConverter title={title} />;
  }

  if (family === "html-entity-encoder") {
    return <HTMLEntityEncoder title={title} />;
  }

  if (family === "string-escape-tool") {
    return <StringEscapeTool title={title} />;
  }

  if (family === "yaml-json-converter") {
    return <YAMLJSONConverter title={title} />;
  }

  if (family === "json-to-csv") {
    return <JSONtoCSV title={title} />;
  }

  if (family === "color-contrast-checker") {
    return <ColorContrastChecker title={title} />;
  }

  if (family === "robots-txt-generator") {
    return <RobotsTxtGenerator title={title} />;
  }

  if (family === "open-graph-tester") {
    return <OpenGraphTester title={title} />;
  }

  return <GenericTool title={title} description={description} />;
}

// ─── Diff Checker ─────────────────────────────────────────────────────────────
function DiffChecker({ title }: { title: string }) {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diffs, setDiffs] = useState<{ type: "equal"|"add"|"remove"; text: string }[]>([]);

  function computeDiff() {
    const linesA = textA.split("\n");
    const linesB = textB.split("\n");
    const result: { type: "equal"|"add"|"remove"; text: string }[] = [];
    const maxLen = Math.max(linesA.length, linesB.length);
    for (let i = 0; i < maxLen; i++) {
      const a = linesA[i]; const b = linesB[i];
      if (a === b) result.push({ type: "equal", text: a ?? "" });
      else {
        if (a !== undefined) result.push({ type: "remove", text: a });
        if (b !== undefined) result.push({ type: "add", text: b });
      }
    }
    setDiffs(result);
  }
  const added = diffs.filter(d => d.type === "add").length;
  const removed = diffs.filter(d => d.type === "remove").length;
  return (
    <Workspace title={title}>
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {[["Original", textA, setTextA],["Modified", textB, setTextB]].map(([label, val, setter]) => (
          <div key={String(label)}>
            <label className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2 block">{String(label)}</label>
            <textarea value={String(val)} onChange={e => (setter as (v:string)=>void)(e.target.value)} rows={8}
              placeholder={`Paste ${String(label).toLowerCase()} text...`}
              className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-mono text-q-text resize-y focus:outline-none focus:ring-2 focus:ring-q-primary/40" />
          </div>
        ))}
      </div>
      <button onClick={computeDiff} className="rounded-2xl bg-q-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition">Compare Texts</button>
      {diffs.length > 0 && (
        <div className="mt-4">
          <div className="flex gap-4 text-xs mb-3"><span className="text-emerald-600">+ {added} added</span><span className="text-red-500">- {removed} removed</span></div>
          <div className="rounded-2xl border border-q-border bg-q-bg p-4 font-mono text-sm overflow-auto max-h-80">
            {diffs.map((d, i) => (
              <div key={i} className={`px-2 py-0.5 rounded ${d.type==="add"?"bg-emerald-50 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300":d.type==="remove"?"bg-red-50 text-red-800 dark:bg-red-500/10 dark:text-red-300":"text-q-muted"}`}>
                {d.type==="add"?"+ ":d.type==="remove"?"- ":"  "}{d.text||" "}
              </div>
            ))}
          </div>
        </div>
      )}
    </Workspace>
  );
}

// ─── JWT Decoder ──────────────────────────────────────────────────────────────
function JWTDecoder({ title }: { title: string }) {
  const [token, setToken] = useState("");
  const [header, setHeader] = useState<Record<string,unknown>|null>(null);
  const [payload, setPayload] = useState<Record<string,unknown>|null>(null);
  const [err, setErr] = useState("");

  function decode() {
    setErr(""); setHeader(null); setPayload(null);
    try {
      const parts = token.trim().split(".");
      if (parts.length !== 3) { setErr("Invalid JWT — must have 3 parts separated by dots"); return; }
      const dec = (s: string) => JSON.parse(atob(s.replace(/-/g,"+").replace(/_/g,"/")));
      setHeader(dec(parts[0])); setPayload(dec(parts[1]));
    } catch { setErr("Could not decode — check the token format"); }
  }

  const exp = payload && typeof payload === "object" ? (payload as Record<string,unknown>).exp : null;
  const expDate = exp ? new Date(Number(exp)*1000) : null;
  const isExpired = expDate ? expDate < new Date() : false;

  return (
    <Workspace title={title}>
      <textarea value={token} onChange={e => setToken(e.target.value)} rows={3}
        placeholder="Paste your JWT token here... eyJhbGciOiJIUzI1NiJ9..."
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-xs font-mono text-q-text resize-none focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-4" />
      <button onClick={decode} className="rounded-2xl bg-q-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition mb-4">Decode JWT</button>
      {err && <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-4 text-sm text-red-700 dark:text-red-400 mb-3">{err}</div>}
      {expDate && (
        <div className={`rounded-xl border px-4 py-3 text-sm mb-3 ${isExpired?"border-red-200 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400":"border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"}`}>
          {isExpired ? "⚠ Token expired:" : "✓ Token valid until:"} {expDate.toLocaleString()}
        </div>
      )}
      {header && payload && (
        <div className="grid gap-4">
          {[["Header", header],["Payload", payload]].map(([label, data]) => (
            <div key={String(label)}>
              <div className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2">{String(label)}</div>
              <pre className="rounded-xl border border-q-border bg-q-bg p-4 text-xs font-mono text-q-text overflow-auto">{JSON.stringify(data, null, 2)}</pre>
            </div>
          ))}
        </div>
      )}
    </Workspace>
  );
}

// ─── Lorem Ipsum Generator ────────────────────────────────────────────────────
const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident culpa officia deserunt mollit anim est laborum".split(" ");
function LoremIpsumGenerator({ title }: { title: string }) {
  const [count, setCount] = useState("3");
  const [unit, setUnit] = useState<"paragraphs"|"sentences"|"words">("paragraphs");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  function generate() {
    const n = Math.max(1, Math.min(Number(count)||3, 20));
    const rw = () => LOREM_WORDS[Math.floor(Math.random()*LOREM_WORDS.length)];
    const words = (len: number) => Array.from({length:len}, rw).join(" ");
    const sentence = () => { const w = words(Math.floor(Math.random()*10)+8); return w.charAt(0).toUpperCase()+w.slice(1)+"."; };
    const para = () => Array.from({length:Math.floor(Math.random()*4)+4}, sentence).join(" ");
    const result = unit==="words" ? words(n) : unit==="sentences" ? Array.from({length:n}, sentence).join(" ") : Array.from({length:n}, para).join("\n\n");
    setOutput(result);
  }
  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <Workspace title={title}>
      <div className="flex flex-wrap gap-3 mb-4">
        <input type="number" value={count} onChange={e=>setCount(e.target.value)} min="1" max="20"
          className="w-24 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text focus:outline-none focus:ring-2 focus:ring-q-primary/40" />
        <select value={unit} onChange={e=>setUnit(e.target.value as typeof unit)} className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
          <option value="paragraphs">Paragraphs</option>
          <option value="sentences">Sentences</option>
          <option value="words">Words</option>
        </select>
        <button onClick={generate} className="rounded-xl bg-q-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">Generate</button>
      </div>
      {output && (
        <div className="relative">
          <textarea value={output} readOnly rows={8} className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-muted resize-y" />
          <button onClick={copy} className="absolute top-3 right-3 rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{copied?"Copied!":"Copy"}</button>
        </div>
      )}
    </Workspace>
  );
}

// ─── Number Base Converter ────────────────────────────────────────────────────
function NumberBaseConverter({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [fromBase, setFromBase] = useState("10");
  const conv = (val: string, base: number) => {
    try { const n = parseInt(val.trim(), base); if (isNaN(n)) return null;
      return { decimal: n.toString(10), binary: n.toString(2), hex: n.toString(16).toUpperCase(), octal: n.toString(8) };
    } catch { return null; }
  };
  const result = input.trim() ? conv(input, Number(fromBase)) : null;
  return (
    <Workspace title={title}>
      <div className="flex flex-wrap gap-3 mb-4">
        <input value={input} onChange={e=>setInput(e.target.value)} placeholder="Enter number..."
          className="flex-1 rounded-xl border border-q-border bg-q-bg px-4 py-2.5 text-sm font-mono text-q-text focus:outline-none focus:ring-2 focus:ring-q-primary/40" />
        <select value={fromBase} onChange={e=>setFromBase(e.target.value)} className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
          <option value="10">Decimal (10)</option>
          <option value="2">Binary (2)</option>
          <option value="16">Hexadecimal (16)</option>
          <option value="8">Octal (8)</option>
        </select>
      </div>
      {result ? (
        <div className="grid grid-cols-2 gap-3">
          {([["Decimal","decimal","10"],["Binary","binary","2"],["Hexadecimal","hex","16"],["Octal","octal","8"]] as const).map(([label, key, base]) => (
            <div key={label} className={`rounded-xl border p-4 ${base===fromBase?"border-q-primary bg-q-primary/5":"border-q-border bg-q-bg"}`}>
              <div className="text-xs font-semibold text-q-muted mb-1">{label} (base {base})</div>
              <div className="font-mono text-lg font-bold text-q-text">{result[key]}</div>
            </div>
          ))}
        </div>
      ) : input.trim() ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">Invalid number for base {fromBase}</div> : null}
    </Workspace>
  );
}

// ─── HTML Entity Encoder ──────────────────────────────────────────────────────
function HTMLEntityEncoder({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"encode"|"decode">("encode");
  const [copied, setCopied] = useState(false);
  const encode = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const decode = (s: string) => s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"').replace(/&#39;/g,"'");
  const output = input ? (mode==="encode" ? encode(input) : decode(input)) : "";
  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <Workspace title={title}>
      <div className="flex gap-2 mb-4">
        {(["encode","decode"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${mode===m?"bg-q-primary text-white":"border border-q-border bg-q-bg text-q-muted hover:bg-q-card-hover"}`}>{m}</button>
        ))}
      </div>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={5}
        placeholder={mode==="encode"?"Enter text with < > & \" characters...":"Enter HTML entities like &lt; &gt; &amp;..."}
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-mono text-q-text resize-y focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-4" />
      {output && (
        <div className="relative">
          <textarea value={output} readOnly rows={5} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5 px-4 py-3 text-sm font-mono text-q-text resize-y" />
          <button onClick={copy} className="absolute top-3 right-3 rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{copied?"Copied!":"Copy"}</button>
        </div>
      )}
    </Workspace>
  );
}

// ─── String Escape Tool ───────────────────────────────────────────────────────
function StringEscapeTool({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [format, setFormat] = useState<"json"|"js"|"html"|"sql">("json");
  const [mode, setMode] = useState<"escape"|"unescape">("escape");
  const [copied, setCopied] = useState(false);
  const esc: Record<string,(s:string)=>string> = {
    json: s=>JSON.stringify(s).slice(1,-1),
    js: s=>s.replace(/\\/g,"\\\\").replace(/'/g,"\\'").replace(/\n/g,"\\n").replace(/\t/g,"\\t"),
    html: s=>s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"),
    sql: s=>s.replace(/'/g,"''"),
  };
  const unesc: Record<string,(s:string)=>string> = {
    json: s=>{ try { return JSON.parse(`"${s}"`); } catch { return s; } },
    js: s=>s.replace(/\\n/g,"\n").replace(/\\t/g,"\t").replace(/\\'/g,"'").replace(/\\\\/g,"\\"),
    html: s=>s.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&quot;/g,'"'),
    sql: s=>s.replace(/''/g,"'"),
  };
  const output = input ? (mode==="escape" ? esc[format]?.(input) : unesc[format]?.(input)) ?? input : "";
  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  return (
    <Workspace title={title}>
      <div className="flex flex-wrap gap-2 mb-4">
        {(["escape","unescape"] as const).map(m=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition ${mode===m?"bg-q-primary text-white":"border border-q-border bg-q-bg text-q-muted hover:bg-q-card-hover"}`}>{m}</button>
        ))}
        <select value={format} onChange={e=>setFormat(e.target.value as typeof format)} className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
          {["json","js","html","sql"].map(f=><option key={f} value={f}>{f.toUpperCase()}</option>)}
        </select>
      </div>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={4} placeholder="Enter string..."
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-mono text-q-text resize-y focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-4" />
      {output && (
        <div className="relative">
          <textarea value={output} readOnly rows={4} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5 px-4 py-3 text-sm font-mono text-q-text resize-y" />
          <button onClick={copy} className="absolute top-3 right-3 rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{copied?"Copied!":"Copy"}</button>
        </div>
      )}
    </Workspace>
  );
}

// ─── YAML ↔ JSON Converter ────────────────────────────────────────────────────
function YAMLJSONConverter({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<"yaml-to-json"|"json-to-yaml">("yaml-to-json");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function convert() {
    setError(""); setOutput("");
    try {
      if (mode==="json-to-yaml") {
        const obj = JSON.parse(input);
        const toYaml = (o: unknown, indent=0): string => {
          const pad = " ".repeat(indent);
          if (Array.isArray(o)) return o.map(v=>`${pad}- ${toYaml(v,indent+2).trimStart()}`).join("\n");
          if (o!==null && typeof o==="object") return Object.entries(o as Record<string,unknown>).map(([k,v])=>typeof v==="object"&&v!==null?`${pad}${k}:\n${toYaml(v,indent+2)}`:`${pad}${k}: ${v}`).join("\n");
          return String(o);
        };
        setOutput(toYaml(obj));
      } else {
        const lines = input.split("\n");
        const result: Record<string,unknown> = {};
        for (const line of lines) {
          const m = line.match(/^([\w\s-]+?):\s*(.*)$/);
          if (m) { const v=m[2].trim(); result[m[1].trim()] = v==="true"?true:v==="false"?false:!isNaN(Number(v))&&v!==""?Number(v):v; }
        }
        setOutput(JSON.stringify(result,null,2));
      }
    } catch(e) { setError(e instanceof Error ? e.message : "Invalid format"); }
  }
  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <Workspace title={title}>
      <div className="flex gap-2 mb-4">
        {([["yaml-to-json","YAML → JSON"],["json-to-yaml","JSON → YAML"]] as const).map(([m,label])=>(
          <button key={m} onClick={()=>setMode(m)} className={`rounded-xl px-4 py-2 text-sm font-medium transition ${mode===m?"bg-q-primary text-white":"border border-q-border bg-q-bg text-q-muted hover:bg-q-card-hover"}`}>{label}</button>
        ))}
      </div>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={6}
        placeholder={mode==="yaml-to-json"?"name: John\nage: 30\ncity: London":'{"name":"John","age":30}'}
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-mono text-q-text resize-y focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-3" />
      <button onClick={convert} className="rounded-xl bg-q-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition mb-4">Convert</button>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 mb-3">{error}</div>}
      {output && (
        <div className="relative">
          <textarea value={output} readOnly rows={6} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5 px-4 py-3 text-sm font-mono text-q-text resize-y" />
          <button onClick={copy} className="absolute top-3 right-3 rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{copied?"Copied!":"Copy"}</button>
        </div>
      )}
    </Workspace>
  );
}

// ─── JSON to CSV ──────────────────────────────────────────────────────────────
function JSONtoCSV({ title }: { title: string }) {
  const [input, setInput] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function convert() {
    setError(""); setOutput("");
    try {
      const data = JSON.parse(input);
      const arr = Array.isArray(data) ? data : [data];
      const keys = Array.from(new Set(arr.flatMap((o: unknown) => Object.keys((o as Record<string,unknown>)||{}))));
      const escape = (v: string) => v.includes(delimiter)||v.includes('"')||v.includes('\n') ? `"${v.replace(/"/g,'""')}"` : v;
      const rows = [keys.join(delimiter), ...arr.map((o: unknown) => keys.map(k=>escape(String(((o as Record<string,unknown>)[k])??''))).join(delimiter))];
      setOutput(rows.join("\n"));
    } catch(e) { setError("Invalid JSON: "+(e instanceof Error?e.message:"parse error")); }
  }
  function copy() { navigator.clipboard.writeText(output); setCopied(true); setTimeout(()=>setCopied(false),2000); }

  return (
    <Workspace title={title}>
      <textarea value={input} onChange={e=>setInput(e.target.value)} rows={6}
        placeholder={'[{"name":"Alice","age":30},{"name":"Bob","age":25}]'}
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-sm font-mono text-q-text resize-y focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-3" />
      <div className="flex gap-3 mb-4">
        <select value={delimiter} onChange={e=>setDelimiter(e.target.value)} className="rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm text-q-text">
          <option value=",">Comma (,)</option>
          <option value=";">Semicolon (;)</option>
          <option value="|">Pipe (|)</option>
        </select>
        <button onClick={convert} className="rounded-xl bg-q-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition">Convert to CSV</button>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 mb-3">{error}</div>}
      {output && (
        <div className="relative">
          <textarea value={output} readOnly rows={6} className="w-full rounded-2xl border border-emerald-200 bg-emerald-50/40 dark:border-emerald-500/20 dark:bg-emerald-500/5 px-4 py-3 text-sm font-mono text-q-text resize-y" />
          <button onClick={copy} className="absolute top-3 right-3 rounded-lg border border-q-border bg-q-card px-3 py-1.5 text-xs font-medium text-q-text hover:bg-q-card-hover transition">{copied?"Copied!":"Copy"}</button>
        </div>
      )}
    </Workspace>
  );
}

// ─── Color Contrast Checker ───────────────────────────────────────────────────
function ColorContrastChecker({ title }: { title: string }) {
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  function lum(hex: string) {
    const r=parseInt(hex.slice(1,3),16)/255, g=parseInt(hex.slice(3,5),16)/255, b=parseInt(hex.slice(5,7),16)/255;
    const l=(c: number)=>c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4);
    return 0.2126*l(r)+0.7152*l(g)+0.0722*l(b);
  }
  const safeHex = (h: string) => /^#[0-9A-Fa-f]{6}$/.test(h) ? h : "#000000";
  const L1=lum(safeHex(fg)), L2=lum(safeHex(bg));
  const ratio=(Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05);
  return (
    <Workspace title={title}>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {([["Foreground (text)",fg,setFg],["Background",bg,setBg]] as const).map(([label,val,setter])=>(
          <div key={label}>
            <label className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2 block">{label}</label>
            <div className="flex gap-2 items-center">
              <input type="color" value={val} onChange={e=>setter(e.target.value)} className="h-10 w-16 rounded-lg border border-q-border cursor-pointer" />
              <input type="text" value={val} onChange={e=>setter(e.target.value)} className="flex-1 rounded-xl border border-q-border bg-q-bg px-3 py-2 text-sm font-mono text-q-text" />
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-q-border overflow-hidden mb-4" style={{backgroundColor:bg,color:fg,padding:"2rem",textAlign:"center"}}>
        <div style={{fontSize:"1.5rem",fontWeight:700}}>Sample Heading Text</div>
        <div style={{fontSize:"1rem",marginTop:"0.5rem"}}>Sample body text at normal size</div>
        <div style={{fontSize:"0.75rem",marginTop:"0.25rem"}}>Small text sample for accessibility testing</div>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {([["AA Normal",ratio>=4.5,"4.5:1"],["AA Large",ratio>=3,"3:1"],["AAA Normal",ratio>=7,"7:1"]] as const).map(([label,pass,req])=>(
          <div key={label} className={`rounded-xl border p-4 text-center ${pass?"border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5":"border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5"}`}>
            <div className={`text-xl font-bold ${pass?"text-emerald-600 dark:text-emerald-400":"text-red-500"}`}>{pass?"Pass":"Fail"}</div>
            <div className="text-xs font-semibold text-q-text mt-1">{label}</div>
            <div className="text-xs text-q-muted">{req} required</div>
          </div>
        ))}
      </div>
      <div className="text-center text-sm text-q-muted">Contrast ratio: <span className="font-bold text-q-text">{ratio.toFixed(2)}:1</span></div>
    </Workspace>
  );
}

// ─── Cron Expression Builder ──────────────────────────────────────────────────
function CronBuilder({ title }: { title: string }) {
  const [expr, setExpr] = useState("0 9 * * 1-5");
  const PRESETS = [["Every minute","* * * * *"],["Every hour","0 * * * *"],["Daily 9am","0 9 * * *"],["Weekdays 9am","0 9 * * 1-5"],["Every Sunday","0 0 * * 0"],["1st of month","0 0 1 * *"]];
  function explain(cron: string) {
    const p = cron.trim().split(/\s+/);
    if (p.length!==5) return "Needs 5 fields: minute hour day month weekday";
    const [min,hr,dom,mon,dow]=p;
    const dowMap: Record<string,string> = {"0":"Sunday","1":"Monday","2":"Tuesday","3":"Wednesday","4":"Thursday","5":"Friday","6":"Saturday"};
    const fHr = hr==="*"?"every hour":`${hr}:00`;
    const fMin = min==="*"?"every minute":`minute ${min}`;
    const fDow = dow==="*"?"":dow.includes("-")?`on ${dow.split("-").map(d=>dowMap[d]||d).join(" to ")}`:` on ${dow.split(",").map(d=>dowMap[d]||d).join(" & ")}`;
    const fDom = dom==="*"?"every day":`day ${dom}`;
    const fMon = mon==="*"?"":"in month "+mon;
    return [fHr,fMin,fDow||fDom,fMon].filter(Boolean).join(", ")+".";
  }
  const explanation = expr.trim().split(/\s+/).length===5 ? explain(expr) : "Enter a valid 5-part cron expression";
  return (
    <Workspace title={title}>
      <input value={expr} onChange={e=>setExpr(e.target.value)} placeholder="0 9 * * 1-5"
        className="w-full rounded-2xl border border-q-border bg-q-bg px-4 py-3 text-lg font-mono text-q-text focus:outline-none focus:ring-2 focus:ring-q-primary/40 mb-4" />
      <div className="rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted mb-4">
        <span className="font-semibold text-q-text">Runs: </span>{explanation}
      </div>
      <div className="grid grid-cols-5 gap-2 mb-4">
        {["Minute\n0-59","Hour\n0-23","Day\n1-31","Month\n1-12","Weekday\n0-6"].map((label,i)=>{
          const parts=expr.trim().split(/\s+/);
          return (<div key={i} className="rounded-xl border border-q-border bg-q-bg p-2 text-center">
            <div className="font-mono text-sm font-bold text-q-primary">{parts[i]||"?"}</div>
            <div className="text-xs text-q-muted whitespace-pre-line mt-1">{label}</div>
          </div>);
        })}
      </div>
      <div className="text-xs font-semibold uppercase tracking-widest text-q-muted mb-2">Presets</div>
      <div className="grid grid-cols-2 gap-2">
        {PRESETS.map(([label,val])=>(
          <button key={val} onClick={()=>setExpr(val)} className="rounded-xl border border-q-border bg-q-bg px-3 py-2.5 text-left hover:bg-q-card-hover transition">
            <div className="text-xs font-medium text-q-text">{label}</div>
            <div className="text-xs font-mono text-q-muted">{val}</div>
          </button>
        ))}
      </div>
    </Workspace>
  );
}

export default function UniversalToolEngineRenderer({ item }: Props) {
  const preset = getToolEnginePreset(item);

  return renderByFamily({
    family: preset.family,
    title: preset.title,
    description: preset.description,
    config: preset.config,
  });
}