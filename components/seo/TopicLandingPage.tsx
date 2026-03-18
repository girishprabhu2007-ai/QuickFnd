import Link from "next/link";
import type { TopicPageData } from "@/lib/programmatic-seo";

function buildSectionTitle(
  topicLabel: string,
  sectionType: "Tools" | "Calculators" | "AI Tools"
) {
  if (topicLabel.endsWith(sectionType)) {
    return topicLabel;
  }

  return `${topicLabel} ${sectionType}`;
}

type Item = {
  type: "tool" | "calculator" | "ai-tool";
  name: string;
  slug: string;
  description: string;
  href: string;
};

function TopicItemGrid({
  title,
  items,
}: {
  title: string;
  items: Item[];
}) {
  if (items.length === 0) {
    return (
      <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
        <h2 className="text-2xl font-semibold text-q-text">{title}</h2>
        <div className="mt-5 rounded-2xl border border-q-border bg-q-bg p-5 text-sm text-q-muted">
          No items in this section yet.
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{title}</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={`${item.type}-${item.slug}`}
            href={item.href}
            className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-q-text">{item.name}</h3>
              <span className="rounded-full border border-q-border bg-q-card px-2.5 py-1 text-xs text-q-muted">
                {item.type}
              </span>
            </div>

            <div className="mt-2 text-sm text-q-muted">/{item.slug}</div>

            <p className="mt-3 text-sm leading-6 text-q-muted">
              {item.description || "Open this QuickFnd page."}
            </p>

            <div className="mt-4 text-sm font-medium text-blue-500">
              Open →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function TopicLandingPage({
  topic,
}: {
  topic: TopicPageData;
}) {
  return (
    <main className="bg-q-bg px-4 py-8 text-q-text sm:px-6 lg:px-8 lg:py-12">
      <section className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
            QuickFnd Topic
          </p>

          <h1 className="mt-4 text-3xl font-bold md:text-5xl">
            {topic.label}
          </h1>

          <p className="mt-4 max-w-4xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
            {topic.intro}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
              Total pages: {topic.totalCount}
            </div>
            <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
              Tools: {topic.tools.length}
            </div>
            <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
              Calculators: {topic.calculators.length}
            </div>
            <div className="rounded-full border border-q-border bg-q-bg px-4 py-2 text-sm text-q-text">
              AI Tools: {topic.aiTools.length}
            </div>
          </div>
        </section>

        <TopicItemGrid
          title={buildSectionTitle(topic.label, "Tools")}
          items={topic.tools}
        />

        <TopicItemGrid
          title={buildSectionTitle(topic.label, "Calculators")}
          items={topic.calculators}
        />

        <TopicItemGrid
          title={buildSectionTitle(topic.label, "AI Tools")}
          items={topic.aiTools}
        />

        <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
          <h2 className="text-2xl font-semibold text-q-text">
            Why this topic page matters
          </h2>

          <div className="mt-4 space-y-3 text-sm leading-7 text-q-muted">
            <p>
              This page groups closely related QuickFnd resources in one place so
              users can discover the right solution faster.
            </p>
            <p>
              It also improves internal linking, topical relevance, and navigation
              across related tool clusters.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/tools"
              className="rounded-xl bg-q-primary px-4 py-2 font-medium text-white transition hover:bg-q-primary-hover"
            >
              Browse All Tools
            </Link>

            <Link
              href="/topics"
              className="rounded-xl border border-q-border bg-q-bg px-4 py-2 font-medium text-q-text transition hover:bg-q-card-hover"
            >
              Browse All Topics
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}