import Link from "next/link";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import {
  filterVisibleTools,
  filterVisibleCalculators,
  filterVisibleAITools,
} from "@/lib/visibility";

type Props = {
  activeSection: "tools" | "calculators" | "ai-tools";
};

function SidebarIcon() {
  return (
    <svg
      className="h-4 w-4 text-blue-500"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 text-sm font-semibold uppercase tracking-wide text-q-muted">
      {children}
    </div>
  );
}

export default async function ListingSidebar({ activeSection }: Props) {
  const [rawTools, rawCalculators, rawAITools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  // Apply unified visibility filter to ALL three types before counting
  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators,
    aiTools,
  });

  return (
    <aside className="rounded-2xl border border-q-border bg-q-card p-6">
      <h2 className="text-xl font-semibold text-q-text">Browse by niche</h2>

      <div className="mt-5 space-y-6">
        <div>
          <SectionTitle>Tools</SectionTitle>
          <div className="space-y-2">
            <Link
              href="/tools"
              className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                activeSection === "tools"
                  ? "border-blue-400/50 bg-q-bg text-q-text"
                  : "border-q-border bg-q-bg text-q-text hover:border-blue-400/50 hover:text-blue-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <SidebarIcon />
                <span>All Tools</span>
              </span>
              <span className="text-q-muted">{tools.length}</span>
            </Link>

            {taxonomy.tools.map((group) => (
              <Link
                key={group.key}
                href={`/tools?group=${group.key}`}
                className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
              >
                <span className="flex items-center gap-2">
                  <SidebarIcon />
                  <span>{group.label}</span>
                </span>
                <span className="text-q-muted">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>Calculators</SectionTitle>
          <div className="space-y-2">
            <Link
              href="/calculators"
              className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                activeSection === "calculators"
                  ? "border-blue-400/50 bg-q-bg text-q-text"
                  : "border-q-border bg-q-bg text-q-text hover:border-blue-400/50 hover:text-blue-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <SidebarIcon />
                <span>All Calculators</span>
              </span>
              <span className="text-q-muted">{calculators.length}</span>
            </Link>

            {taxonomy.calculators.map((group) => (
              <Link
                key={group.key}
                href={`/calculators?group=${group.key}`}
                className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
              >
                <span className="flex items-center gap-2">
                  <SidebarIcon />
                  <span>{group.label}</span>
                </span>
                <span className="text-q-muted">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle>AI Tools</SectionTitle>
          <div className="space-y-2">
            <Link
              href="/ai-tools"
              className={`flex items-center justify-between rounded-xl border px-3 py-3 text-sm transition ${
                activeSection === "ai-tools"
                  ? "border-blue-400/50 bg-q-bg text-q-text"
                  : "border-q-border bg-q-bg text-q-text hover:border-blue-400/50 hover:text-blue-500"
              }`}
            >
              <span className="flex items-center gap-2">
                <SidebarIcon />
                <span>All AI Tools</span>
              </span>
              <span className="text-q-muted">{aiTools.length}</span>
            </Link>

            {taxonomy.aiTools.map((group) => (
              <Link
                key={group.key}
                href={`/ai-tools?group=${group.key}`}
                className="flex items-center justify-between rounded-xl border border-q-border bg-q-bg px-3 py-3 text-sm text-q-text transition hover:border-blue-400/50 hover:text-blue-500"
              >
                <span className="flex items-center gap-2">
                  <SidebarIcon />
                  <span>{group.label}</span>
                </span>
                <span className="text-q-muted">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
