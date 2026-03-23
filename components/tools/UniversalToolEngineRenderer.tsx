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

  return <GenericTool title={title} description={description} />;
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