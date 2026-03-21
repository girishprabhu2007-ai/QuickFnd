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

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6">
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted";
}

function textareaClass(minHeight: string) {
  return `w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted ${minHeight}`;
}

function softPanelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
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
  const value = state[field.key];

  if (field.type === "checkbox") {
    return (
      <label
        key={field.key}
        className="flex items-center gap-2 rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm text-q-text"
      >
        <input
          type="checkbox"
          checked={Boolean(value)}
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
          value={String(value ?? "")}
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
          {field.label}: {String(value ?? "")}
        </label>
        <input
          type="range"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={Number(value ?? field.min ?? 0)}
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
          value={String(value ?? "")}
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
        value={String(value ?? "")}
        onChange={(e) =>
          setState((prev) => ({
            ...prev,
            [field.key]:
              field.type === "number" ? e.target.value : e.target.value,
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
        output: allowDecimal
          ? random.toFixed(decimalPlaces)
          : String(Math.floor(random)),
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
    <Card title={title}>
      <div className="space-y-4">
        {family === "unit-converter" ? (
          <div className="text-sm text-q-muted">
            Convert {String(config.fromUnit || "unit")} to {String(config.toUnit || "unit")}
          </div>
        ) : null}

        {nonCheckboxFields.map((field) => renderSchemaField(field, state, setState))}

        {checkboxFields.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {checkboxFields.map((field) => renderSchemaField(field, state, setState))}
          </div>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <button
            onClick={run}
            className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
          >
            {schema.action.label}
          </button>
          <button
            onClick={() => copyText(result.output)}
            disabled={!result.output}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
          >
            {schema.action.copyLabel || "Copy"}
          </button>
        </div>

        {result.error ? (
          <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">
            {result.error}
          </div>
        ) : null}

        {result.previewColor ? (
          <div className={softPanelClass()}>
            <div className="mb-3 text-sm text-q-muted">Preview</div>
            <div
              className="h-20 rounded-xl border border-q-border"
              style={{ backgroundColor: result.previewColor }}
            />
          </div>
        ) : null}

        <textarea
          readOnly
          value={result.output}
          placeholder={schema.outputPlaceholder || "Output"}
          className={textareaClass("min-h-[120px]")}
        />
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type or paste a password to check"
          className={textareaClass("min-h-[120px]")}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Strength</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{result.label}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Score</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{result.score}%</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Rules Passed</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">
              {result.passed}/{result.total}
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Minimum Length</div>
            <div className="mt-2 text-lg font-semibold text-q-text">{minLength}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Current Length</div>
            <div className="mt-2 text-lg font-semibold text-q-text">{input.length}</div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
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
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            mode === "json"
              ? 'Paste JSON here, for example: {"name":"QuickFnd"}'
              : "Paste code or JSON here"
          }
          className={textareaClass("min-h-[180px]")}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => formatValue(true)}
            className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
          >
            Format
          </button>
          {allowMinify ? (
            <button
              onClick={() => formatValue(false)}
              className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover"
            >
              Minify
            </button>
          ) : null}
          <button
            onClick={() => copyText(output)}
            disabled={!output}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
          >
            Copy Output
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">
            {error}
          </div>
        ) : null}

        <textarea
          readOnly
          value={output}
          placeholder="Formatted output"
          className={textareaClass("min-h-[200px]")}
        />
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here"
          className={textareaClass("min-h-[220px]")}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Words</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{stats.words}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Characters</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{stats.characters}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">No Spaces</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">
              {stats.charactersNoSpaces}
            </div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Paragraphs</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{stats.paragraphs}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Read Time</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">
              {stats.readingMinutes} min
            </div>
          </div>
        </div>
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to transform"
          className={textareaClass("min-h-[160px]")}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={runTransform}
            className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
          >
            Transform Text
          </button>
        </div>

        <div className="grid gap-4">
          {Object.entries(output).map(([key, value]) => (
            <div key={key} className={softPanelClass()}>
              <div className="mb-2 text-sm text-q-muted">{key}</div>
              <div className="break-words text-sm text-q-text">{value}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
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
    <Card title={title}>
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
          className="min-h-[160px] w-full rounded-xl border border-q-border bg-q-bg p-4 font-mono text-q-text outline-none placeholder:text-q-muted"
        />
        <button
          onClick={saveSnippet}
          className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
        >
          Save Snippet
        </button>

        <div className="space-y-3">
          {snippets.length === 0 ? (
            <div className={`${softPanelClass()} text-sm text-q-muted`}>
              No snippets saved yet.
            </div>
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
                      className="rounded-lg border border-q-danger bg-q-danger-soft px-3 py-1 text-sm text-q-danger hover:opacity-90"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-lg border border-q-border bg-q-card p-3 text-sm text-q-text">
                  {snippet.code}
                </pre>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
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
    <Card title={title}>
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
          className={textareaClass("min-h-[180px]")}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={runRegex}
            className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
          >
            {mode === "extract" ? "Extract Matches" : "Test Regex"}
          </button>
          <button
            onClick={() => copyText(matches.join("\n"))}
            disabled={matches.length === 0}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
          >
            Copy Matches
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">
            {error}
          </div>
        ) : null}

        {summary ? (
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Result</div>
            <div className="mt-2 text-base font-medium text-q-text">{summary}</div>
          </div>
        ) : null}

        <div className="grid gap-3">
          {matches.length > 0
            ? matches.map((match, index) => (
                <div key={`${match}-${index}`} className={softPanelClass()}>
                  <div className="text-sm text-q-muted">Match {index + 1}</div>
                  <div className="mt-2 break-words text-q-text">{match}</div>
                </div>
              ))
            : null}
        </div>
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to hash"
          className={textareaClass("min-h-[160px]")}
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generateHash}
            disabled={working}
            className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover disabled:opacity-60"
          >
            {working ? "Generating..." : "Generate Hash"}
          </button>
          <button
            onClick={() => copyText(output)}
            disabled={!output}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
          >
            Copy Hash
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">
            {error}
          </div>
        ) : null}

        <textarea
          readOnly
          value={output}
          placeholder="Hash output"
          className={textareaClass("min-h-[140px]")}
        />
      </div>
    </Card>
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
    <Card title={title}>
      <div className="space-y-6">
        <div className={softPanelClass()}>
          <div className="mb-3 text-sm font-medium text-q-text">Unix Timestamp To Date</div>
          <div className="space-y-3">
            <input
              value={unixInput}
              onChange={(e) => setUnixInput(e.target.value)}
              placeholder="Enter Unix timestamp"
              className={inputClass()}
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={fromUnix}
                className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
              >
                Convert To Date
              </button>
              <button
                onClick={() => copyText(dateOutput)}
                disabled={!dateOutput}
                className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
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
        </div>

        <div className={softPanelClass()}>
          <div className="mb-3 text-sm font-medium text-q-text">Date To Unix Timestamp</div>
          <div className="space-y-3">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className={inputClass()}
            />
            <div className="flex flex-wrap gap-3">
              <button
                onClick={toUnix}
                className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover"
              >
                Convert To Unix
              </button>
              <button
                onClick={useNow}
                className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover"
              >
                Use Current Time
              </button>
              <button
                onClick={() => copyText(unixOutput)}
                disabled={!unixOutput}
                className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50"
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
        </div>

        {error ? (
          <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">
            {error}
          </div>
        ) : null}
      </div>
    </Card>
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
    <Card title={title}>
      <div className="rounded-xl border border-q-border bg-q-bg p-5 text-q-muted">
        {description}
      </div>
    </Card>
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