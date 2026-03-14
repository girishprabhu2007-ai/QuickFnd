"use client";

import { useMemo, useState } from "react";

type Props = {
  slug: string;
};

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
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
          <label className="mb-2 block text-sm text-gray-300">
            Length: {length}
          </label>
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
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={useUppercase}
              onChange={(e) => setUseUppercase(e.target.checked)}
            />
            Uppercase
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={useLowercase}
              onChange={(e) => setUseLowercase(e.target.checked)}
            />
            Lowercase
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={useNumbers}
              onChange={(e) => setUseNumbers(e.target.checked)}
            />
            Numbers
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={useSymbols}
              onChange={(e) => setUseSymbols(e.target.checked)}
            />
            Symbols
          </label>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={generatePassword}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Generate Password
          </button>
          <button
            onClick={() => copyText(password)}
            disabled={!password}
            className="rounded-xl bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Copy
          </button>
        </div>

        <textarea
          readOnly
          value={password}
          placeholder="Your generated password will appear here"
          className="min-h-[110px] w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
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
          className="min-h-[160px] w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />

        <div className="flex flex-wrap gap-3">
          <button
            onClick={formatJson}
            className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Format
          </button>
          <button
            onClick={minifyJson}
            className="rounded-xl bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700"
          >
            Minify
          </button>
          <button
            onClick={() => copyText(output)}
            disabled={!output}
            className="rounded-xl bg-gray-800 px-4 py-2 font-medium text-white hover:bg-gray-700 disabled:opacity-50"
          >
            Copy Output
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        <textarea
          readOnly
          value={output}
          placeholder="Formatted JSON output"
          className="min-h-[200px] w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
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

    return {
      words,
      characters,
      charactersNoSpaces,
      readingMinutes,
    };
  }, [text]);

  return (
    <Card title="Word Counter">
      <div className="space-y-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste or type text here"
          className="min-h-[220px] w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <div className="text-sm text-gray-400">Words</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {stats.words}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <div className="text-sm text-gray-400">Characters</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {stats.characters}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <div className="text-sm text-gray-400">No Spaces</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {stats.charactersNoSpaces}
            </div>
          </div>
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <div className="text-sm text-gray-400">Read Time</div>
            <div className="mt-2 text-2xl font-semibold text-white">
              {stats.readingMinutes} min
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function GenericTool() {
  return (
    <Card title="Tool Interface">
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
        This page is live and database-driven. You can add a custom interactive
        interface for this tool later without changing its public URL structure.
      </div>
    </Card>
  );
}

export default function BuiltInToolClient({ slug }: Props) {
  if (slug === "password-generator") return <PasswordGenerator />;
  if (slug === "json-formatter") return <JsonFormatter />;
  if (slug === "word-counter") return <WordCounter />;
  return <GenericTool />;
}