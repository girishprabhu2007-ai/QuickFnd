"use client";

import { use, useMemo, useState } from "react";

const tools: Record<string, { name: string; description: string }> = {
  "password-generator": {
    name: "Password Generator",
    description: "Generate strong and secure passwords instantly.",
  },
  "json-formatter": {
    name: "JSON Formatter",
    description: "Format and validate JSON easily.",
  },
  "word-counter": {
    name: "Word Counter",
    description: "Count words, characters, and paragraphs instantly.",
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

    setTimeout(() => {
      setCopied(false);
    }, 1500);
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
    </main>
  );
}