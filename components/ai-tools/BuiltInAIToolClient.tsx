"use client";

import { useState } from "react";
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
    <section className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function ResultBlock({
  loading,
  result,
  error,
}: {
  loading: boolean;
  result: string;
  error: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
      {loading ? (
        <div className="text-gray-400">Generating...</div>
      ) : error ? (
        <div className="text-red-300">{error}</div>
      ) : result ? (
        <pre className="whitespace-pre-wrap text-sm text-gray-200">{result}</pre>
      ) : (
        <div className="text-gray-500">Your generated result will appear here.</div>
      )}
    </div>
  );
}

function AIPromptGenerator() {
  const [goal, setGoal] = useState("");
  const [style, setStyle] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "ai-prompt-generator",
          input: { goal, style },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate prompt.");
      }

      setResult(data.result || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate prompt.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="AI Prompt Generator">
      <div className="space-y-4">
        <input
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="Goal"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="Style"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Prompt"}
        </button>
        <ResultBlock loading={loading} result={result} error={error} />
      </div>
    </Card>
  );
}

function AIEmailWriter() {
  const [purpose, setPurpose] = useState("");
  const [recipient, setRecipient] = useState("");
  const [tone, setTone] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "ai-email-writer",
          input: { purpose, recipient, tone },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate email.");
      }

      setResult(data.result || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="AI Email Writer">
      <div className="space-y-4">
        <input
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          placeholder="Purpose"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="Recipient"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          placeholder="Tone"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Write Email"}
        </button>
        <ResultBlock loading={loading} result={result} error={error} />
      </div>
    </Card>
  );
}

function AIBlogOutlineGenerator() {
  const [topic, setTopic] = useState("");
  const [audience, setAudience] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "ai-blog-outline-generator",
          input: { topic, audience },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate outline.");
      }

      setResult(data.result || "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate outline.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card title="AI Blog Outline Generator">
      <div className="space-y-4">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Topic"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <input
          value={audience}
          onChange={(e) => setAudience(e.target.value)}
          placeholder="Target audience"
          className="w-full rounded-xl border border-gray-700 bg-gray-950 p-4 text-white outline-none"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-xl bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Generating..." : "Generate Outline"}
        </button>
        <ResultBlock loading={loading} result={result} error={error} />
      </div>
    </Card>
  );
}

function GenericDirectoryCard() {
  return (
    <Card title="Directory Listing">
      <div className="rounded-xl border border-gray-800 bg-gray-950 p-5 text-gray-300">
        This AI tool page is live as a searchable, indexable QuickFnd directory entry.
      </div>
    </Card>
  );
}

export default function BuiltInAIToolClient({ item }: Props) {
  const engine = item.engine_type || inferEngineType("ai-tool", item.slug);

  if (engine === "ai-prompt-generator") return <AIPromptGenerator />;
  if (engine === "ai-email-writer") return <AIEmailWriter />;
  if (engine === "ai-blog-outline-generator") return <AIBlogOutlineGenerator />;

  return <GenericDirectoryCard />;
}