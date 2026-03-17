import Link from "next/link";
import type { InternalLinkItem, TopicLinkItem } from "@/lib/internal-linking";

function LinkCard({
  item,
}: {
  item: InternalLinkItem;
}) {
  return (
    <Link
      href={item.href}
      className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
    >
      <div className="text-lg font-semibold text-q-text">{item.name}</div>
      <div className="mt-2 text-sm text-q-muted">/{item.slug}</div>
      <p className="mt-3 text-sm leading-6 text-q-muted">
        {item.description || "Open this related QuickFnd tool."}
      </p>
      <div className="mt-4 text-sm font-medium text-blue-500">Open →</div>
    </Link>
  );
}

function TopicCard({
  item,
}: {
  item: TopicLinkItem;
}) {
  return (
    <Link
      href={item.href}
      className="rounded-2xl border border-q-border bg-q-bg p-5 transition hover:-translate-y-0.5 hover:border-blue-400/50"
    >
      <div className="text-lg font-semibold text-q-text">{item.label}</div>
      <div className="mt-3 text-sm text-q-muted">
        Topic pages: {item.totalCount}
      </div>
      <div className="mt-4 text-sm font-medium text-blue-500">Explore topic →</div>
    </Link>
  );
}

export function RelatedToolsSection({
  title = "Related Tools",
  items,
}: {
  title?: string;
  items: InternalLinkItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <LinkCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}

export function TopicLinksSection({
  title,
  items,
}: {
  title: string;
  items: TopicLinkItem[];
}) {
  if (items.length === 0) return null;

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <TopicCard key={item.href} item={item} />
        ))}
      </div>
    </section>
  );
}