"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicContentItem } from "@/lib/content-pages";
import { inferEngineType } from "@/lib/engine-metadata";

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
    <section className="rounded-2xl border border-q-border bg-q-card p-6">
      <h2 className="text-xl font-semibold text-q-text">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // no-op
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

function inputClass() {
  return "w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted";
}

function textareaClass(minHeight: string) {
  return `w-full rounded-xl border border-q-border bg-q-bg p-4 text-q-text outline-none placeholder:text-q-muted ${minHeight}`;
}

function softPanelClass() {
  return "rounded-xl border border-q-border bg-q-bg p-4";
}

function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState("");

  function generatePassword() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";
    const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let chars = "";
    if (useUppercase) chars += upper;
    if (useLowercase) chars += lower;
    if (useNumbers) chars += numbers;
    if (useSymbols) chars += symbols;

    if (!chars) {
      setPassword("");
      return;
    }

    let next = "";
    for (let i = 0; i < length; i += 1) {
      next += chars[Math.floor(Math.random() * chars.length)];
    }

    setPassword(next);
  }

  return (
    <Card title="Password Generator">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-q-muted">Length: {length}</label>
          <input
            type="range"
            min={6}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} />
            Uppercase
          </label>
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} />
            Lowercase
          </label>
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
            Numbers
          </label>
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useSymbols} onChange={(e) => setUseSymbols(e.target.checked)} />
            Symbols
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={generatePassword} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Generate Password
          </button>
          <button onClick={() => copyText(password)} disabled={!password} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>

        <textarea
          readOnly
          value={password}
          placeholder="Your generated password will appear here"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function JsonFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  function formatJson() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError("");
    } catch {
      setError("Invalid JSON. Please check your input.");
      setOutput("");
    }
  }

  function minifyJson() {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch {
      setError("Invalid JSON. Please check your input.");
      setOutput("");
    }
  }

  return (
    <Card title="JSON Formatter">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Paste JSON here, for example: {"name":"QuickFnd"}'
          className={textareaClass("min-h-[160px]")}
        />

        <div className="flex flex-wrap gap-3">
          <button onClick={formatJson} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Format
          </button>
          <button onClick={minifyJson} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover">
            Minify
          </button>
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
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
          placeholder="Formatted JSON output"
          className={textareaClass("min-h-[200px]")}
        />
      </div>
    </Card>
  );
}

function WordCounter() {
  const [text, setText] = useState("");

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const readingMinutes = words > 0 ? Math.max(1, Math.ceil(words / 200)) : 0;

    return { words, characters, charactersNoSpaces, readingMinutes };
  }, [text]);

  return (
    <Card title="Word Counter">
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here"
          className={textareaClass("min-h-[220px]")}
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <div className="mt-2 text-2xl font-semibold text-q-text">{stats.charactersNoSpaces}</div>
          </div>
          <div className={softPanelClass()}>
            <div className="text-sm text-q-muted">Read Time</div>
            <div className="mt-2 text-2xl font-semibold text-q-text">{stats.readingMinutes} min</div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function UUIDGenerator() {
  const [result, setResult] = useState("");

  function generateUuid() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      setResult(crypto.randomUUID());
      return;
    }
    setResult("UUID generation is not supported in this browser.");
  }

  return (
    <Card title="UUID Generator">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <button onClick={generateUuid} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Generate UUID
          </button>
          <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        <textarea
          readOnly
          value={result}
          placeholder="Generated UUID will appear here"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function SlugGenerator() {
  const [input, setInput] = useState("");
  const output = useMemo(() => slugify(input), [input]);

  return (
    <Card title="Slug Generator">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to convert into a URL slug"
          className={textareaClass("min-h-[140px]")}
        />
        <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover disabled:opacity-50">
          Copy Slug
        </button>
        <textarea
          readOnly
          value={output}
          placeholder="Slug output"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function RandomStringGenerator() {
  const [length, setLength] = useState(24);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useLowercase, setUseLowercase] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [result, setResult] = useState("");

  function generateString() {
    const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lower = "abcdefghijklmnopqrstuvwxyz";
    const numbers = "0123456789";

    let chars = "";
    if (useUppercase) chars += upper;
    if (useLowercase) chars += lower;
    if (useNumbers) chars += numbers;

    if (!chars) {
      setResult("");
      return;
    }

    let next = "";
    for (let i = 0; i < length; i += 1) {
      next += chars[Math.floor(Math.random() * chars.length)];
    }

    setResult(next);
  }

  return (
    <Card title="Random String Generator">
      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm text-q-muted">Length: {length}</label>
          <input type="range" min={4} max={128} value={length} onChange={(e) => setLength(Number(e.target.value))} className="w-full" />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useUppercase} onChange={(e) => setUseUppercase(e.target.checked)} />
            Uppercase
          </label>
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useLowercase} onChange={(e) => setUseLowercase(e.target.checked)} />
            Lowercase
          </label>
          <label className="flex items-center gap-2 text-sm text-q-muted">
            <input type="checkbox" checked={useNumbers} onChange={(e) => setUseNumbers(e.target.checked)} />
            Numbers
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={generateString} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Generate String
          </button>
          <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>

        <textarea
          readOnly
          value={result}
          placeholder="Generated string will appear here"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function Base64Encoder() {
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
    <Card title="Base64 Encoder">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to encode"
          className={textareaClass("min-h-[140px]")}
        />
        <div className="flex flex-wrap gap-3">
          <button onClick={encodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Encode
          </button>
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        {error ? <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">{error}</div> : null}
        <textarea
          readOnly
          value={output}
          placeholder="Base64 output"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function Base64Decoder() {
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
    <Card title="Base64 Decoder">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter Base64 text to decode"
          className={textareaClass("min-h-[140px]")}
        />
        <div className="flex flex-wrap gap-3">
          <button onClick={decodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Decode
          </button>
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        {error ? <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">{error}</div> : null}
        <textarea
          readOnly
          value={output}
          placeholder="Decoded text"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function UrlEncoder() {
  const [input, setInput] = useState("");
  const output = useMemo(() => {
    try {
      return encodeURIComponent(input);
    } catch {
      return "";
    }
  }, [input]);

  return (
    <Card title="URL Encoder">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to URL-encode"
          className={textareaClass("min-h-[140px]")}
        />
        <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover disabled:opacity-50">
          Copy Encoded Output
        </button>
        <textarea
          readOnly
          value={output}
          placeholder="Encoded output"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function UrlDecoder() {
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
    <Card title="URL Decoder">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter URL-encoded text"
          className={textareaClass("min-h-[140px]")}
        />
        <div className="flex flex-wrap gap-3">
          <button onClick={decodeValue} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Decode
          </button>
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        {error ? <div className="rounded-xl border border-q-danger bg-q-danger-soft p-3 text-sm text-q-danger">{error}</div> : null}
        <textarea
          readOnly
          value={output}
          placeholder="Decoded output"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function TextCaseConverter() {
  const [input, setInput] = useState("");

  const output = useMemo(() => {
    return {
      lowercase: input.toLowerCase(),
      uppercase: input.toUpperCase(),
      titlecase: input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()),
      slug: slugify(input),
    };
  }, [input]);

  return (
    <Card title="Text Case Converter">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to transform"
          className={textareaClass("min-h-[160px]")}
        />
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

function CodeFormatter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  function formatCode() {
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      setOutput(JSON.stringify(parsed, null, 2));
      return;
    } catch {
      setOutput(trimmed.split("\n").map((line) => line.trimEnd()).join("\n"));
    }
  }

  return (
    <Card title="Code Formatter">
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste code or JSON here"
          className="min-h-[180px] w-full rounded-xl border border-q-border bg-q-bg p-4 font-mono text-q-text outline-none placeholder:text-q-muted"
        />
        <div className="flex flex-wrap gap-3">
          <button onClick={formatCode} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Format
          </button>
          <button onClick={() => copyText(output)} disabled={!output} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        <textarea
          readOnly
          value={output}
          placeholder="Formatted output"
          className="min-h-[180px] w-full rounded-xl border border-q-border bg-q-bg p-4 font-mono text-q-text outline-none placeholder:text-q-muted"
        />
      </div>
    </Card>
  );
}

type Snippet = {
  id: string;
  title: string;
  code: string;
};

function CodeSnippetManager() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [snippets, setSnippets] = useState<Snippet[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("quickfnd-snippets");
      if (stored) {
        const parsed = JSON.parse(stored) as Snippet[];
        setSnippets(Array.isArray(parsed) ? parsed : []);
      }
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem("quickfnd-snippets", JSON.stringify(snippets));
    } catch {
      // no-op
    }
  }, [snippets]);

  function saveSnippet() {
    if (!title.trim() || !code.trim()) return;

    const next: Snippet = {
      id: `${Date.now()}`,
      title: title.trim(),
      code,
    };

    setSnippets((prev) => [next, ...prev]);
    setTitle("");
    setCode("");
  }

  function deleteSnippet(id: string) {
    setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
  }

  return (
    <Card title="Code Snippet Manager">
      <div className="space-y-4">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Snippet title"
          className={inputClass()}
        />
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Paste snippet code"
          className="min-h-[160px] w-full rounded-xl border border-q-border bg-q-bg p-4 font-mono text-q-text outline-none placeholder:text-q-muted"
        />
        <button onClick={saveSnippet} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
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
                    <button onClick={() => copyText(snippet.code)} className="rounded-lg border border-q-border bg-q-card px-3 py-1 text-sm text-q-text hover:bg-q-card-hover">
                      Copy
                    </button>
                    <button onClick={() => deleteSnippet(snippet.id)} className="rounded-lg border border-q-danger bg-q-danger-soft px-3 py-1 text-sm text-q-danger hover:opacity-90">
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

function TextTransformer(config: Record<string, unknown>) {
  const [input, setInput] = useState("");
  const modes = asStringArray(config.modes, ["lowercase", "uppercase", "titlecase", "slug"]);
  const title = String(config.title || "Text Transformer");

  const output = useMemo(() => {
    const result: Record<string, string> = {};

    if (modes.includes("lowercase")) result.lowercase = input.toLowerCase();
    if (modes.includes("uppercase")) result.uppercase = input.toUpperCase();
    if (modes.includes("titlecase")) {
      result.titlecase = input.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
    if (modes.includes("slug")) result.slug = slugify(input);
    if (modes.includes("trim")) result.trim = input.trim();

    return result;
  }, [input, modes]);

  return (
    <Card title={title}>
      <div className="space-y-4">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to transform"
          className={textareaClass("min-h-[160px]")}
        />
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

function NumberGenerator(config: Record<string, unknown>) {
  const title = String(config.title || "Number Generator");
  const minDefault = Number(config.min ?? 1);
  const maxDefault = Number(config.max ?? 100);
  const allowDecimal = Boolean(config.allowDecimal);

  const [min, setMin] = useState(String(minDefault));
  const [max, setMax] = useState(String(maxDefault));
  const [result, setResult] = useState("");

  function generateNumber() {
    const minNum = Number(min);
    const maxNum = Number(max);

    if (!Number.isFinite(minNum) || !Number.isFinite(maxNum) || minNum > maxNum) {
      setResult("Invalid range");
      return;
    }

    const random = Math.random() * (maxNum - minNum) + minNum;
    setResult(allowDecimal ? random.toFixed(2) : String(Math.floor(random)));
  }

  return (
    <Card title={title}>
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="number"
            value={min}
            onChange={(e) => setMin(e.target.value)}
            placeholder="Minimum"
            className={inputClass()}
          />
          <input
            type="number"
            value={max}
            onChange={(e) => setMax(e.target.value)}
            placeholder="Maximum"
            className={inputClass()}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={generateNumber} className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white hover:bg-q-primary-hover">
            Generate Number
          </button>
          <button onClick={() => copyText(result)} disabled={!result} className="rounded-xl border border-q-border bg-q-card px-4 py-2 font-medium text-q-text hover:bg-q-card-hover disabled:opacity-50">
            Copy
          </button>
        </div>
        <textarea
          readOnly
          value={result}
          placeholder="Generated number"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function UnitConverter(config: Record<string, unknown>) {
  const title = String(config.title || "Unit Converter");
  const fromUnit = String(config.fromUnit || "meters");
  const toUnit = String(config.toUnit || "feet");
  const multiplier = Number(config.multiplier ?? 3.28084);

  const [input, setInput] = useState("");
  const output = useMemo(() => {
    const value = Number(input);
    if (!Number.isFinite(value)) return "";
    return (value * multiplier).toFixed(4);
  }, [input, multiplier]);

  return (
    <Card title={title}>
      <div className="space-y-4">
        <div className="text-sm text-q-muted">
          Convert {fromUnit} to {toUnit}
        </div>
        <input
          type="number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter value in ${fromUnit}`}
          className={inputClass()}
        />
        <textarea
          readOnly
          value={output ? `${output} ${toUnit}` : ""}
          placeholder="Converted output"
          className={textareaClass("min-h-[110px]")}
        />
      </div>
    </Card>
  );
}

function GenericTool() {
  return (
    <Card title="Tool Interface">
      <div className="rounded-xl border border-q-border bg-q-bg p-5 text-q-muted">
        This page is live and database-driven. It is already a valid public page,
        and you can attach a dedicated tool engine to this slug later.
      </div>
    </Card>
  );
}

export default function BuiltInToolClient({ item }: Props) {
  const engine = item.engine_type || inferEngineType("tool", item.slug);
  const config = item.engine_config || {};

  if (engine === "password-generator") return <PasswordGenerator />;
  if (engine === "json-formatter") return <JsonFormatter />;
  if (engine === "word-counter") return <WordCounter />;
  if (engine === "uuid-generator") return <UUIDGenerator />;
  if (engine === "slug-generator") return <SlugGenerator />;
  if (engine === "random-string-generator") return <RandomStringGenerator />;
  if (engine === "base64-encoder") return <Base64Encoder />;
  if (engine === "base64-decoder") return <Base64Decoder />;
  if (engine === "url-encoder") return <UrlEncoder />;
  if (engine === "url-decoder") return <UrlDecoder />;
  if (engine === "text-case-converter") return <TextCaseConverter />;
  if (engine === "code-formatter") return <CodeFormatter />;
  if (engine === "code-snippet-manager") return <CodeSnippetManager />;
  if (engine === "text-transformer") return <TextTransformer {...{ config }} />;
  if (engine === "number-generator") return <NumberGenerator {...{ config }} />;
  if (engine === "unit-converter") return <UnitConverter {...{ config }} />;

  return <GenericTool />;
}