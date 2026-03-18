import Link from "next/link";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { filterVisibleTools } from "@/lib/public-tool-visibility";

function Icon() {
  return (
    <svg
      className="w-4 h-4 text-blue-500"
      viewBox="0 0 24 24"
      stroke="currentColor"
      fill="none"
    >
      <circle cx="12" cy="12" r="3" strokeWidth="2" />
    </svg>
  );
}

export default async function Sidebar() {
  const [allTools, calculators, aiTools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const tools = filterVisibleTools(allTools);

  const taxonomy = buildHomepageTaxonomy({
    tools,
    calculators,
    aiTools,
  });

  return (
    <aside className="p-4 space-y-6">
      <div>
        <h3 className="mb-2 text-sm font-semibold text-q-muted">Tools</h3>

        <div className="space-y-1">
          <Link
            href="/tools"
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
          >
            <Icon />
            <span>All Tools</span>
          </Link>

          {taxonomy.tools.map((cat) => (
            <Link
              key={cat.key}
              href={`/tools?group=${cat.key}`}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
            >
              <span className="flex items-center gap-2">
                <Icon />
                <span>{cat.label}</span>
              </span>
              <span className="text-xs text-q-muted">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-q-muted">Calculators</h3>

        <div className="space-y-1">
          <Link
            href="/calculators"
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
          >
            <Icon />
            <span>All Calculators</span>
          </Link>

          {taxonomy.calculators.map((cat) => (
            <Link
              key={cat.key}
              href={`/calculators?group=${cat.key}`}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
            >
              <span className="flex items-center gap-2">
                <Icon />
                <span>{cat.label}</span>
              </span>
              <span className="text-xs text-q-muted">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-sm font-semibold text-q-muted">AI Tools</h3>

        <div className="space-y-1">
          <Link
            href="/ai-tools"
            className="flex items-center gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
          >
            <Icon />
            <span>All AI Tools</span>
          </Link>

          {taxonomy.aiTools.map((cat) => (
            <Link
              key={cat.key}
              href={`/ai-tools?group=${cat.key}`}
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-2 transition hover:bg-q-card"
            >
              <span className="flex items-center gap-2">
                <Icon />
                <span>{cat.label}</span>
              </span>
              <span className="text-xs text-q-muted">{cat.count}</span>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}