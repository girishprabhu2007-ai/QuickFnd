import type { Metadata } from "next";
import Link from "next/link";
import { getTools } from "@/lib/db";

export const metadata: Metadata = {
  title: "Tools",
  description:
    "Browse online tools like password generators, word counters, JSON formatters, and more.",
};

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <main className="min-h-screen bg-gray-950 p-10 text-white">
      <h1 className="mb-6 text-4xl font-bold">Tools</h1>

      <p className="mb-10 text-gray-400">
        Browse powerful online utilities available on QuickFnd.
      </p>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.id}
            href={`/tools/${tool.slug}`}
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