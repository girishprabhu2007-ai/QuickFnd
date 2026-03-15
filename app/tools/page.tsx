import type { Metadata } from "next";
import Link from "next/link";
import { getTools } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Tools | QuickFnd",
  description:
    "Explore browser-based utility tools on QuickFnd for text, code, formatting, generation, conversion, and productivity workflows.",
};

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Directory
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">Tools</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Explore browser-based utility tools for developers, writers,
            marketers, students, and everyday productivity workflows.
          </p>
        </div>

        {tools.length === 0 ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
            No tools are available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {tools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="group rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/50 hover:shadow-[0_12px_30px_rgba(59,130,246,0.12)]"
              >
                <h2 className="text-xl font-semibold text-q-text transition-colors duration-200 group-hover:text-blue-500">
                  {tool.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {tool.description}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-500 transition-transform duration-200 group-hover:translate-x-1">
                  Open tool →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}