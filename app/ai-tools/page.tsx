import type { Metadata } from "next";
import Link from "next/link";
import { getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "AI Tools | QuickFnd",
  description:
    "Discover AI tools, generators, assistants, and AI workflow pages on QuickFnd with structured browsing and dedicated landing pages.",
};

export default async function AIToolsPage() {
  const aiTools = await getAITools();

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Directory
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">AI Tools</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Discover AI-powered tools, generators, assistants, and useful AI
            workflow pages available through QuickFnd.
          </p>
        </div>

        {aiTools.length === 0 ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
            No AI tools are available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {aiTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/ai-tools/${tool.slug}`}
                className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
              >
                <h2 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                  {tool.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {getDisplayDescription("ai_tools", tool, "card")}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
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