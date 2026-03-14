"use client";

import Link from "next/link";
import { use } from "react";
import { getAIToolBySlug, getRelatedAITools } from "@/lib/data/ai-tools";

export default function AIToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const tool = getAIToolBySlug(slug);
  const relatedTools = getRelatedAITools(slug);

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

      {relatedTools.length > 0 && (
        <section className="mt-12 max-w-4xl">
          <h2 className="mb-4 text-2xl font-semibold">Related AI Tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedTools.map((relatedTool) => (
              <Link
                key={relatedTool.slug}
                href={`/ai-tools/${relatedTool.slug}`}
                className="rounded-xl bg-gray-900 p-4 transition hover:bg-gray-800"
              >
                <h3 className="font-semibold">{relatedTool.name}</h3>
                <p className="mt-2 text-sm text-gray-400">
                  {relatedTool.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}