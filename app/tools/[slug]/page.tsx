"use client";

import { use, useMemo, useState } from "react";

const tools: Record<string, { name: string; description: string }> = {
  "password-generator": {
    name: "Password Generator",
    description: "Generate strong and secure passwords instantly.",
  },
  "json-formatter": {
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON easily.",
  },
  "word-counter": {
    name: "Word Counter",
    description: "Count words, characters, sentences, and paragraphs instantly.",
  },
  "base64-encoder-decoder": {
    name: "Base64 Encoder / Decoder",
    description: "Encode plain text to Base64 or decode Base64 back to text.",
  },
  "uuid-generator": {
    name: "UUID Generator",
    description: "Generate random UUIDs instantly for apps and databases.",
  },
};

export default function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = tools[slug];

  const [password, setPassword] = useState("");
  const [length, setLength] = useState(12);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [copied, setCopied] = useState(false);

  const [text, setText] = useState("");

  const [jsonInput, setJsonInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [jsonError, setJsonError] = useState("");

  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [base64Error, setBase64Error] = useState("");

  const [uuidValue, setUuidValue] = useState("");

  const passwordStrength = useMemo(() => {
    let score = 0;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (includeUppercase) score++;
    if (includeLowercase) score++;
    if (includeNumbers) score++;
    if (includeSymbols) score++;

    if (score <= 2) return "Weak";
    if (score <= 4) return "Medium";
    return "Strong";
  }, [length, includeUppercase, includeLowercase, includeNumbers, includeSymbols]);

  const generatePassword = () => {
    let chars = "";

    if (includeUppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) chars += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) chars += "0123456789";
    if (includeSymbols) chars += "!@#$%^&*()_+-={}[]|:;<>,.?/";

    if (!chars) {
      setPassword("Please select at least one option.");
      return;
    }

    let result = "";
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
    setCopied(false);
  };

  const copyPassword = async () => {
    if (!password || password === "Please select at least one option.") return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stats = useMemo(() => {
    const trimmed = text.trim();
    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const sentences = trimmed
      ? trimmed.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length
      : 0;
    const paragraphs = trimmed
      ? text.split(/\n\s*\n/).filter((paragraph) => paragraph.trim().length > 0).length
      : 0;

    return {
      words,
      characters,
      charactersNoSpaces,
      sentences,
      paragraphs,
    };
  }, [text]);

  const formatJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed, null, 2));
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON input.");
      setJsonOutput("");
    }
  };

  const minifyJson = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonOutput(JSON.stringify(parsed));
      setJsonError("");
    } catch {
      setJsonError("Invalid JSON input.");
      setJsonOutput("");
    }
  };

  const encodeBase64 = () => {
    try {
      setBase64Output(btoa(base64Input));
      setBase64Error("");
    } catch {
      setBase64Error("Unable to encode this input.");
      setBase64Output("");
    }
  };

  const decodeBase64 = () => {
    try {
      setBase64Output(atob(base64Input));
      setBase64Error("");
    } catch {
      setBase64Error("Invalid Base64 input.");
      setBase64Output("");
    }
  };

  const generateUuid = () => {
    setUuidValue(crypto.randomUUID());
  };

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-950 p-10 text-white">
        <h1 className="mb-4 text-4xl font-bold">Tool Not Found</h1>
        <p className="text-gray-400">
          The tool you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
      <p className="mb-8 max-w-2xl text-gray-400">{tool.description}</p>

      {slug === "password-generator" && (
        <div className="max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-300">
              Password Length: <span className="text-white">{length}</span>
            </label>
            <input
              type="range"
              min="6"
              max="32"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
              <input
                type="checkbox"
                checked={includeUppercase}
                onChange={(e) => setIncludeUppercase(e.target.checked)}
              />
              <span>Uppercase Letters</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
              <input
                type="checkbox"
                checked={includeLowercase}
                onChange={(e) => setIncludeLowercase(e.target.checked)}
              />
              <span>Lowercase Letters</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
              <input
                type="checkbox"
                checked={includeNumbers}
                onChange={(e) => setIncludeNumbers(e.target.checked)}
              />
              <span>Numbers</span>
            </label>

            <label className="flex items-center gap-3 rounded-lg bg-gray-800 p-3">
              <input
                type="checkbox"
                checked={includeSymbols}
                onChange={(e) => setIncludeSymbols(e.target.checked)}
              />
              <span>Symbols</span>
            </label>
          </div>

          <div className="mb-4 flex flex-wrap gap-3">
            <button
              onClick={generatePassword}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Generate Password
            </button>

            <button
              onClick={copyPassword}
              className="rounded-lg bg-gray-700 px-5 py-3 font-medium hover:bg-gray-600"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="mb-4 rounded-lg bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Generated Password</p>
            <div className="break-all font-mono text-lg text-green-400">
              {password || "Click generate to create a password"}
            </div>
          </div>

          <div className="rounded-lg bg-gray-800 p-4">
            <p className="text-sm text-gray-400">Strength</p>
            <p
              className={`mt-1 font-semibold ${
                passwordStrength === "Strong"
                  ? "text-green-400"
                  : passwordStrength === "Medium"
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {passwordStrength}
            </p>
          </div>
        </div>
      )}

      {slug === "word-counter" && (
        <div className="max-w-4xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="mb-6 min-h-[220px] w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700 placeholder:text-gray-500 focus:ring-blue-500"
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Words</p>
              <p className="mt-2 text-2xl font-bold">{stats.words}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Characters</p>
              <p className="mt-2 text-2xl font-bold">{stats.characters}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">No Spaces</p>
              <p className="mt-2 text-2xl font-bold">{stats.charactersNoSpaces}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Sentences</p>
              <p className="mt-2 text-2xl font-bold">{stats.sentences}</p>
            </div>
            <div className="rounded-xl bg-gray-800 p-4">
              <p className="text-sm text-gray-400">Paragraphs</p>
              <p className="mt-2 text-2xl font-bold">{stats.paragraphs}</p>
            </div>
          </div>
        </div>
      )}

      {slug === "json-formatter" && (
        <div className="max-w-5xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-gray-400">Input JSON</p>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder='{"name":"QuickFnd","type":"tool"}'
                className="min-h-[260px] w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700 placeholder:text-gray-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Output</p>
              <textarea
                value={jsonOutput}
                readOnly
                className="min-h-[260px] w-full rounded-xl bg-gray-800 p-4 text-green-400 outline-none ring-1 ring-gray-700"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={formatJson}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Format JSON
            </button>
            <button
              onClick={minifyJson}
              className="rounded-lg bg-gray-700 px-5 py-3 font-medium hover:bg-gray-600"
            >
              Minify JSON
            </button>
          </div>

          {jsonError && <p className="mt-4 text-red-400">{jsonError}</p>}
        </div>
      )}

      {slug === "base64-encoder-decoder" && (
        <div className="max-w-5xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-sm text-gray-400">Input</p>
              <textarea
                value={base64Input}
                onChange={(e) => setBase64Input(e.target.value)}
                placeholder="Enter text or Base64 value..."
                className="min-h-[220px] w-full rounded-xl bg-gray-800 p-4 text-white outline-none ring-1 ring-gray-700 placeholder:text-gray-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <p className="mb-2 text-sm text-gray-400">Output</p>
              <textarea
                value={base64Output}
                readOnly
                className="min-h-[220px] w-full rounded-xl bg-gray-800 p-4 text-green-400 outline-none ring-1 ring-gray-700"
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={encodeBase64}
              className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
            >
              Encode
            </button>
            <button
              onClick={decodeBase64}
              className="rounded-lg bg-gray-700 px-5 py-3 font-medium hover:bg-gray-600"
            >
              Decode
            </button>
          </div>

          {base64Error && <p className="mt-4 text-red-400">{base64Error}</p>}
        </div>
      )}

      {slug === "uuid-generator" && (
        <div className="max-w-2xl rounded-2xl bg-gray-900 p-6 shadow-lg">
          <button
            onClick={generateUuid}
            className="rounded-lg bg-blue-600 px-5 py-3 font-medium hover:bg-blue-700"
          >
            Generate UUID
          </button>

          <div className="mt-4 rounded-lg bg-gray-800 p-4">
            <p className="mb-2 text-sm text-gray-400">Generated UUID</p>
            <div className="break-all font-mono text-lg text-green-400">
              {uuidValue || "Click generate to create a UUID"}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}