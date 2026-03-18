import Link from "next/link";
import ListingSidebar from "@/components/layout/ListingSidebar";
import type { PublicContentItem } from "@/lib/content-pages";

type Props = {
  section: "tools" | "calculators" | "ai-tools";
  item: PublicContentItem;
};

function sectionLabel(section: Props["section"]) {
  if (section === "tools") return "tool";
  if (section === "calculators") return "calculator";
  return "AI tool";
}

function directoryHref(section: Props["section"]) {
  if (section === "tools") return "/tools";
  if (section === "calculators") return "/calculators";
  return "/ai-tools";
}

export default function DetailSidebar({ section, item }: Props) {
  const label = sectionLabel(section);
  const browseHref = directoryHref(section);

  return (
    <div className="space-y-6">
      <aside className="rounded-2xl border border-q-border bg-q-card p-6">
        <h2 className="text-xl font-semibold text-q-text">Quick actions</h2>

        <p className="mt-3 text-sm leading-6 text-q-muted">
          Browse more categories or request a new {label} for QuickFnd.
        </p>

        <div className="mt-5 space-y-3">
          <Link
            href={browseHref}
            className="flex items-center justify-center rounded-xl bg-q-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-q-primary-hover"
          >
            Browse all {section === "ai-tools" ? "AI tools" : `${section}`}
          </Link>

          <Link
            href={`/request-tool?category=${encodeURIComponent(
              section === "ai-tools" ? "ai-tool" : section.slice(0, -1)
            )}&ref=${encodeURIComponent(item.slug)}`}
            className="flex items-center justify-center rounded-xl border border-q-border bg-q-bg px-4 py-3 text-sm font-semibold text-q-text transition hover:bg-q-card-hover"
          >
            Request a tool
          </Link>
        </div>

        <div className="mt-5 rounded-xl border border-q-border bg-q-bg p-4">
          <div className="text-xs uppercase tracking-wide text-q-muted">
            Current page
          </div>
          <div className="mt-2 text-sm font-medium text-q-text">{item.name}</div>
          <div className="mt-1 text-xs text-q-muted">/{item.slug}</div>
        </div>
      </aside>

      <ListingSidebar activeSection={section} />
    </div>
  );
}