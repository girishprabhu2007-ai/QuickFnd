import type { Metadata } from "next";
import Link from "next/link";
import { aiTools } from "@/lib/data/ai-tools";

export const metadata: Metadata = {
  title: "AI Tools",
  description:
    "Discover AI tools for writing, coding, design, productivity, and more.",
};

export default function AIToolsPage() {
  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <h1 className="mb-6 text-4xl font-bold">AI Tools</h1>

      <p className="mb-10 text-gray-400">
        Discover powerful AI tools to boost productivity.
      </p>

      <div className="grid gap-6 md:grid-cols-3">
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