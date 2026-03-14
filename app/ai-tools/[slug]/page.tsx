"use client";

import Link from "next/link";
import { use } from "react";

const aiTools: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  chatgpt: {
    name: "ChatGPT",
    description:
      "ChatGPT is an AI chatbot designed for writing, coding, brainstorming, and answering questions.",
  },
  midjourney: {
    name: "Midjourney",
    description:
      "Midjourney is an AI tool that generates stunning images from text prompts.",
  },
  "notion-ai": {
    name: "Notion AI",
    description:
      "Notion AI helps automate writing, summarizing, and productivity tasks inside Notion.",
  },
};

export default function AIToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = aiTools[slug];

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-950 p-10 text-white">
        <Link
          href="/ai-tools"
          className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
        >
          ← Back to AI Tools
        </Link>
        <h1 className="mb-4 text-4xl font-bold">AI Tool Not Found</h1>
        <p className="text-gray-400">
          The AI tool you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <Link
        href="/ai-tools"
        className="mb-6 inline-block text-sm text-blue-400 hover:text-blue-300"
      >
        ← Back to AI Tools
      </Link>

      <h1 className="mb-4 text-4xl font-bold">{tool.name}</h1>
      <p className="mb-8 max-w-2xl text-gray-400">{tool.description}</p>

      <div className="max-w-3xl rounded-xl bg-gray-900 p-6">
        <p className="text-lg text-gray-300">
          This is where the full review or listing for {tool.name} will go.
        </p>
      </div>
    </main>
  );
}