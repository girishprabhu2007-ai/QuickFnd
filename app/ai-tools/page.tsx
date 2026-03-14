import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Tools",
  description: "Discover AI tools for writing, coding, design, productivity, and more.",
};
const aiTools = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description: "AI chatbot for writing, coding, and productivity.",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    description: "Generate AI images from text prompts.",
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    description: "AI assistant integrated into the Notion workspace.",
  },
];

export default function AIToolsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">AI Tools</h1>

      <p className="text-gray-400 mb-10">
        Discover powerful AI tools to boost productivity.
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {aiTools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/ai-tools/${tool.slug}`}
            className="block rounded-xl bg-gray-900 p-6 transition hover:bg-gray-800"
          >
            <h2 className="text-xl font-semibold">{tool.name}</h2>
            <p className="mt-2 text-gray-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}