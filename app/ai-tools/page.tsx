import Link from "next/link";
import { getAITools } from "@/lib/db";

export default async function AIToolsPage() {
  const aiTools = await getAITools();

  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-blue-400">
            QuickFnd Directory
          </p>
          <h1 className="text-4xl font-bold md:text-5xl">All AI Tools</h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-400">
            Discover AI tools for writing, research, content creation,
            productivity, and automation.
          </p>
        </div>

        {aiTools.length === 0 ? (
          <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8 text-gray-400">
            No AI tools available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {aiTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/ai-tools/${tool.slug}`}
                className="block rounded-2xl border border-gray-800 bg-gray-900 p-6 transition hover:border-gray-700 hover:bg-gray-800"
              >
                <h2 className="text-xl font-semibold">{tool.name}</h2>
                <p className="mt-3 text-sm leading-6 text-gray-400">
                  {tool.description}
                </p>
                <div className="mt-5 text-sm font-medium text-blue-400">
                  Open AI tool →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}