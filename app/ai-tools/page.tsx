import Link from "next/link";
import { getAITools } from "@/lib/db";

export const revalidate = 300;

export default async function AIToolsPage() {
  const aiTools = await getAITools();

  return (
    <main className="min-h-screen bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Directory
          </p>
          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            AI Tools
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            Discover AI-powered tools, generators, assistants, and useful AI
            product pages available through QuickFnd.
          </p>
        </div>

        {aiTools.length === 0 ? (
          <div className="rounded-2xl border border-q-border bg-q-card p-6 text-q-muted">
            No AI tools available yet.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {aiTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/ai-tools/${tool.slug}`}
                className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
              >
                <h2 className="text-xl font-semibold text-q-text">
                  {tool.name}
                </h2>
                <p className="mt-3 text-sm leading-6 text-q-muted">
                  {tool.description}
                </p>
                <div className="mt-4 text-sm font-medium text-blue-500">
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