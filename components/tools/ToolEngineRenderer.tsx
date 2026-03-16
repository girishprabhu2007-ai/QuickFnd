"use client";

import { useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import {
  normalizeToolEngineConfig,
  resolveToolEngine,
} from "@/lib/tool-engine-registry";
import CurrencyConverterClient from "@/components/tools/CurrencyConverterClient";

type Props = {
  item: PublicContentItem;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted";
}

function textAreaClass(minHeight = "min-h-[140px]") {
  return `${minHeight} w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted`;
}

function panelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
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

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // ignore clipboard failures
  }
}

function unicodeToBase64(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

function base64ToUnicode(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

function buildTitleCase(value: string) {
  return value.replace(/\w\S*/g, (part) => {
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });
}

function renderPasswordStrength(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("password-strength-checker", item.engine_config);
  const title = String(config.title || item.name || "Password Strength Checker");
  const minLength = Number(config.minLength || 8);
  const checks = Array.isArray(config.checks)
    ? config.checks.map((value) => String(value))
    : ["length", "uppercase", "lowercase", "number", "symbol"];

  function PasswordStrengthView() {
    const [password, setPassword] = useState("");

    const analysis = useMemo(() => {
      const results = {
        length: password.length >= minLength,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /\d/.test(password),
        symbol: /[^A-Za-z0-9]/.test(password),
      };

      const enabledChecks = checks.filter((check) => check in results);
      const passed = enabledChecks.filter((check) => results[check as keyof typeof results]).length;
      const score = enabledChecks.length ? Math.round((passed / enabledChecks.length) * 100) : 0;

      let label = "Very Weak";
      if (score >= 80) label = "Strong";
      else if (score >= 60) label = "Good";
      else if (score >= 40) label = "Fair";
      else if (score >= 20) label = "Weak";

      return { results, passed, total: enabledChecks.length, score, label };
    }, [password]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Type or paste a password to check"
            className={textAreaClass("min-h-[120px]")}
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className={panelClass()}>
              <div className="text-sm text-q-muted">Strength</div>
              <div className="mt-2 text-2xl font-semibold text-q-text">{analysis.label}</div>
            </div>
            <div className={panelClass()}>
              <div className="text-sm text-q-muted">Score</div>
              <div className="mt-2 text-2xl font-semibold text-q-text">{analysis.score}%</div>
            </div>
            <div className={panelClass()}>
              <div className="text-sm text-q-muted">Rules Passed</div>
              <div className="mt-2 text-2xl font-semibold text-q-text">
                {analysis.passed}/{analysis.total}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className={panelClass()}>
              Minimum length: <strong>{minLength}</strong>
            </div>
            <div className={panelClass()}>
              Current length: <strong>{password.length}</strong>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {checks.map((check) => {
              const passed = analysis.results[check as keyof typeof analysis.results] ?? false;
              return (
                <div key={check} className={panelClass()}>
                  <div className="text-sm capitalize text-q-muted">{check}</div>
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

  return <PasswordStrengthView />;
}

function renderPasswordGenerator(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("password-generator", item.engine_config);
  const title = String(config.title || item.name || "Password Generator");
  const minLength = Number(config.minLength || 8);
  const maxLength = Number(config.maxLength || 64);
  const defaultLength = Number(config.defaultLength || 16);

  function PasswordGeneratorView() {
    const [length, setLength] = useState(defaultLength);
    const [useUppercase, setUseUppercase] = useState(Boolean(config.includeUppercase ?? true));
    const [useLowercase, setUseLowercase] = useState(Boolean(config.includeLowercase ?? true));
    const [useNumbers, setUseNumbers] = useState(Boolean(config.includeNumbers ?? true));
    const [useSymbols, setUseSymbols] = useState(Boolean(config.includeSymbols ?? true));
    const [password, setPassword] = useState("");

    function generate() {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      let source = "";
      if (useUppercase) source += upper;
      if (useLowercase) source += lower;
      if (useNumbers) source += numbers;
      if (useSymbols) source += symbols;

      if (!source) {
        setPassword("");
        return;
      }

      let next = "";
      for (let index = 0; index < length; index += 1) {
        next += source[Math.floor(Math.random() * source.length)];
      }

      setPassword(next);
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-q-muted">Length: {length}</label>
            <input
              type="range"
              min={minLength}
              max={maxLength}
              value={length}
              onChange={(event) => setLength(Number(event.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useUppercase} onChange={(event) => setUseUppercase(event.target.checked)} />Uppercase</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useLowercase} onChange={(event) => setUseLowercase(event.target.checked)} />Lowercase</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useNumbers} onChange={(event) => setUseNumbers(event.target.checked)} />Numbers</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useSymbols} onChange={(event) => setUseSymbols(event.target.checked)} />Symbols</label>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={generate} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Generate Password</button>
            <button onClick={() => copyText(password)} disabled={!password} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>

          <textarea readOnly value={password} placeholder="Generated password" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <PasswordGeneratorView />;
}

function renderJsonFormatter(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "JSON Formatter");

  function JsonFormatterView() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    function formatJson(pretty: boolean) {
      try {
        const parsed = JSON.parse(input);
        setOutput(pretty ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed));
        setError("");
      } catch {
        setOutput("");
        setError("Invalid JSON. Please check your input.");
      }
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder='Paste JSON here, for example: {"name":"QuickFnd"}' className={textAreaClass("min-h-[160px]")} />
          <div className="flex flex-wrap gap-3">
            <button onClick={() => formatJson(true)} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Format</button>
            <button onClick={() => formatJson(false)} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover">Minify</button>
            <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy Output</button>
          </div>
          {error ? <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <textarea readOnly value={output} placeholder="Formatted JSON output" className={textAreaClass("min-h-[200px]")} />
        </div>
      </Card>
    );
  }

  return <JsonFormatterView />;
}

function renderWordCounter(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("word-counter", item.engine_config);
  const title = String(config.title || item.name || "Word Counter");
  const readingWordsPerMinute = Number(config.readingWordsPerMinute || 200);

  function WordCounterView() {
    const [text, setText] = useState("");

    const stats = useMemo(() => {
      const trimmed = text.trim();
      const words = trimmed ? trimmed.split(/\s+/).length : 0;
      const characters = text.length;
      const charactersNoSpaces = text.replace(/\s/g, "").length;
      const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / readingWordsPerMinute)) : 0;

      return { words, characters, charactersNoSpaces, readingMinutes };
    }, [text]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="Paste or type text here" className={textAreaClass("min-h-[220px]")} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className={panelClass()}><div className="text-sm text-q-muted">Words</div><div className="mt-2 text-2xl font-semibold text-q-text">{stats.words}</div></div>
            <div className={panelClass()}><div className="text-sm text-q-muted">Characters</div><div className="mt-2 text-2xl font-semibold text-q-text">{stats.characters}</div></div>
            <div className={panelClass()}><div className="text-sm text-q-muted">No Spaces</div><div className="mt-2 text-2xl font-semibold text-q-text">{stats.charactersNoSpaces}</div></div>
            <div className={panelClass()}><div className="text-sm text-q-muted">Read Time</div><div className="mt-2 text-2xl font-semibold text-q-text">{stats.readingMinutes} min</div></div>
          </div>
        </div>
      </Card>
    );
  }

  return <WordCounterView />;
}

function renderUuidGenerator(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "UUID Generator");

  function UUIDGeneratorView() {
    const [result, setResult] = useState("");

    function generateUuid() {
      if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        setResult(crypto.randomUUID());
        return;
      }
      setResult("UUID generation is not supported in this browser.");
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button onClick={generateUuid} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Generate UUID</button>
            <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          <textarea readOnly value={result} placeholder="Generated UUID will appear here" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <UUIDGeneratorView />;
}

function renderSlugGenerator(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "Slug Generator");

  function SlugGeneratorView() {
    const [input, setInput] = useState("");
    const output = useMemo(() => slugify(input), [input]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text to convert into a URL slug" className={textAreaClass()} />
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover disabled:opacity-50">Copy Slug</button>
          <textarea readOnly value={output} placeholder="Slug output" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <SlugGeneratorView />;
}

function renderRandomStringGenerator(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("random-string-generator", item.engine_config);
  const title = String(config.title || item.name || "Random String Generator");
  const minLength = Number(config.minLength || 4);
  const maxLength = Number(config.maxLength || 128);
  const defaultLength = Number(config.defaultLength || 24);

  function RandomStringGeneratorView() {
    const [length, setLength] = useState(defaultLength);
    const [useUppercase, setUseUppercase] = useState(Boolean(config.includeUppercase ?? true));
    const [useLowercase, setUseLowercase] = useState(Boolean(config.includeLowercase ?? true));
    const [useNumbers, setUseNumbers] = useState(Boolean(config.includeNumbers ?? true));
    const [useSymbols, setUseSymbols] = useState(Boolean(config.includeSymbols ?? false));
    const [result, setResult] = useState("");

    function generate() {
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

      let source = "";
      if (useUppercase) source += upper;
      if (useLowercase) source += lower;
      if (useNumbers) source += numbers;
      if (useSymbols) source += symbols;

      if (!source) {
        setResult("");
        return;
      }

      let next = "";
      for (let index = 0; index < length; index += 1) {
        next += source[Math.floor(Math.random() * source.length)];
      }

      setResult(next);
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-q-muted">Length: {length}</label>
            <input type="range" min={minLength} max={maxLength} value={length} onChange={(event) => setLength(Number(event.target.value))} className="w-full" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useUppercase} onChange={(event) => setUseUppercase(event.target.checked)} />Uppercase</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useLowercase} onChange={(event) => setUseLowercase(event.target.checked)} />Lowercase</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useNumbers} onChange={(event) => setUseNumbers(event.target.checked)} />Numbers</label>
            <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={useSymbols} onChange={(event) => setUseSymbols(event.target.checked)} />Symbols</label>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={generate} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Generate String</button>
            <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          <textarea readOnly value={result} placeholder="Generated string will appear here" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <RandomStringGeneratorView />;
}

function renderBase64Encoder(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "Base64 Encoder");

  function Base64EncoderView() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    function encodeValue() {
      try {
        setOutput(unicodeToBase64(input));
        setError("");
      } catch {
        setOutput("");
        setError("Could not encode this text.");
      }
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text to encode" className={textAreaClass()} />
          <div className="flex flex-wrap gap-3">
            <button onClick={encodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Encode</button>
            <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          {error ? <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <textarea readOnly value={output} placeholder="Base64 output" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <Base64EncoderView />;
}

function renderBase64Decoder(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "Base64 Decoder");

  function Base64DecoderView() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    function decodeValue() {
      try {
        setOutput(base64ToUnicode(input));
        setError("");
      } catch {
        setOutput("");
        setError("Invalid Base64 input.");
      }
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter Base64 text to decode" className={textAreaClass()} />
          <div className="flex flex-wrap gap-3">
            <button onClick={decodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Decode</button>
            <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          {error ? <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <textarea readOnly value={output} placeholder="Decoded text" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <Base64DecoderView />;
}

function renderUrlEncoder(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "URL Encoder");

  function UrlEncoderView() {
    const [input, setInput] = useState("");
    const output = useMemo(() => {
      try {
        return encodeURIComponent(input);
      } catch {
        return "";
      }
    }, [input]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text to URL-encode" className={textAreaClass()} />
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover disabled:opacity-50">Copy Encoded Output</button>
          <textarea readOnly value={output} placeholder="Encoded output" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <UrlEncoderView />;
}

function renderUrlDecoder(item: PublicContentItem) {
  const title = String(item.engine_config?.title || item.name || "URL Decoder");

  function UrlDecoderView() {
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState("");

    function decodeValue() {
      try {
        setOutput(decodeURIComponent(input));
        setError("");
      } catch {
        setOutput("");
        setError("Invalid URL-encoded input.");
      }
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter URL-encoded text" className={textAreaClass()} />
          <div className="flex flex-wrap gap-3">
            <button onClick={decodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Decode</button>
            <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          {error ? <div className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
          <textarea readOnly value={output} placeholder="Decoded output" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <UrlDecoderView />;
}

function renderTextTransformer(item: PublicContentItem) {
  const resolved = resolveToolEngine(item);
  const title = String(resolved.config.title || item.name || resolved.definition.title);
  const modes = Array.isArray(resolved.config.modes)
    ? resolved.config.modes.map((value) => String(value))
    : ["lowercase", "uppercase", "titlecase", "slug"];

  function TextTransformerView() {
    const [input, setInput] = useState("");

    const output = useMemo(() => {
      const map: Record<string, string> = {
        lowercase: input.toLowerCase(),
        uppercase: input.toUpperCase(),
        titlecase: buildTitleCase(input),
        slug: slugify(input),
        "trim-lines": input.split("\n").map((line) => line.trim()).join("\n"),
      };

      return modes.map((mode) => ({ mode, value: map[mode] ?? input }));
    }, [input]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Enter text to transform" className={textAreaClass("min-h-[160px]")} />
          <div className="grid gap-4">
            {output.map((entry) => (
              <div key={entry.mode} className={panelClass()}>
                <div className="mb-2 text-sm capitalize text-q-muted">{entry.mode.replace(/-/g, " ")}</div>
                <div className="break-words text-sm text-q-text">{entry.value}</div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return <TextTransformerView />;
}

function renderNumberGenerator(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("number-generator", item.engine_config);
  const title = String(config.title || item.name || "Random Number Generator");
  const defaultMin = Number(config.min || 1);
  const defaultMax = Number(config.max || 100);
  const defaultAllowDecimal = Boolean(config.allowDecimal ?? false);
  const defaultDecimalPlaces = Number(config.decimalPlaces || 2);

  function NumberGeneratorView() {
    const [min, setMin] = useState(String(defaultMin));
    const [max, setMax] = useState(String(defaultMax));
    const [allowDecimal, setAllowDecimal] = useState(defaultAllowDecimal);
    const [result, setResult] = useState("");

    function generate() {
      const minValue = Number(min);
      const maxValue = Number(max);

      if (!Number.isFinite(minValue) || !Number.isFinite(maxValue) || minValue > maxValue) {
        setResult("Enter a valid minimum and maximum range.");
        return;
      }

      const random = Math.random() * (maxValue - minValue) + minValue;
      const next = allowDecimal
        ? random.toFixed(defaultDecimalPlaces)
        : String(Math.floor(random));

      setResult(next);
    }

    return (
      <Card title={title}>
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input type="number" value={min} onChange={(event) => setMin(event.target.value)} placeholder="Minimum" className={inputClass()} />
            <input type="number" value={max} onChange={(event) => setMax(event.target.value)} placeholder="Maximum" className={inputClass()} />
          </div>
          <label className="flex items-center gap-2 text-sm text-q-muted"><input type="checkbox" checked={allowDecimal} onChange={(event) => setAllowDecimal(event.target.checked)} />Allow decimals</label>
          <div className="flex flex-wrap gap-3">
            <button onClick={generate} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">Generate Number</button>
            <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">Copy</button>
          </div>
          <textarea readOnly value={result} placeholder="Generated number" className={textAreaClass("min-h-[110px]")} />
        </div>
      </Card>
    );
  }

  return <NumberGeneratorView />;
}

function renderUnitConverter(item: PublicContentItem) {
  const config = normalizeToolEngineConfig("unit-converter", item.engine_config);
  const title = String(config.title || item.name || "Unit Converter");
  const fromUnit = String(config.fromUnit || "meters");
  const toUnit = String(config.toUnit || "feet");
  const multiplier = Number(config.multiplier || 1);
  const precision = Number(config.precision || 4);

  function UnitConverterView() {
    const [input, setInput] = useState("");

    const output = useMemo(() => {
      const numeric = Number(input);
      if (!input || !Number.isFinite(numeric)) {
        return "";
      }
      return String((numeric * multiplier).toFixed(precision));
    }, [input]);

    return (
      <Card title={title}>
        <div className="space-y-4">
          <input type="number" value={input} onChange={(event) => setInput(event.target.value)} placeholder={`Enter value in ${fromUnit}`} className={inputClass()} />
          <div className={panelClass()}>
            {output ? (
              <div className="text-lg font-medium text-q-text">{input} {fromUnit} = {output} {toUnit}</div>
            ) : (
              <div className="text-sm text-q-muted">Enter a value to convert from {fromUnit} to {toUnit}.</div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return <UnitConverterView />;
}

function renderFallback(item: PublicContentItem) {
  return (
    <Card title={item.name}>
      <div className="space-y-3 text-sm text-q-muted">
        <p>This tool page exists, but its live engine has not been connected yet.</p>
        <p>Keep this item in the backlog until a reusable engine family is added.</p>
      </div>
    </Card>
  );
}

export default function ToolEngineRenderer({ item }: Props) {
  const resolved = resolveToolEngine(item);

  switch (resolved.engineType) {
    case "currency-converter":
      return <CurrencyConverterClient />;
    case "password-strength-checker":
      return renderPasswordStrength(item);
    case "password-generator":
      return renderPasswordGenerator(item);
    case "json-formatter":
      return renderJsonFormatter(item);
    case "word-counter":
      return renderWordCounter(item);
    case "uuid-generator":
      return renderUuidGenerator(item);
    case "slug-generator":
      return renderSlugGenerator(item);
    case "random-string-generator":
      return renderRandomStringGenerator(item);
    case "base64-encoder":
      return renderBase64Encoder(item);
    case "base64-decoder":
      return renderBase64Decoder(item);
    case "url-encoder":
      return renderUrlEncoder(item);
    case "url-decoder":
      return renderUrlDecoder(item);
    case "text-case-converter":
    case "text-transformer":
      return renderTextTransformer(item);
    case "number-generator":
      return renderNumberGenerator(item);
    case "unit-converter":
      return renderUnitConverter(item);
    default:
      return renderFallback(item);
  }
}