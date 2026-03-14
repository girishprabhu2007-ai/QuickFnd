"use client";

import { use, useState } from "react";

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

  const generatePassword = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let result = "";

    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setPassword(result);
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
        <div className="max-w-md rounded-xl bg-gray-900 p-6">
          <button
            onClick={generatePassword}
            className="mb-4 rounded bg-blue-600 px-4 py-2 hover:bg-blue-700"
          >
            Generate Password
          </button>

          {password && (
            <div className="rounded bg-gray-800 p-3 font-mono text-green-400">
              {password}
            </div>
          )}
        </div>
      )}
    </main>
  );
}