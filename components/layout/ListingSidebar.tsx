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

const CATEGORY_ICONS: Record<string, string> = {
  "Encoders & Converters": "🔄",
  "Text & Writing": "✍️",
  "Developer Tools": "💻",
  "SEO & Marketing": "📈",
  "YouTube & Video": "🎬",
  "Generators": "⚡",
  "Other Tools": "🔧",
  "Finance Calculators": "💰",
  "Math Calculators": "🧮",
  "Health Calculators": "❤️",
  "Other Calculators": "📊",
  "Content AI": "✨",
  "Writing AI": "📝",
};

function SectionTitle({ children, badge }: { children: React.ReactNode; badge: string }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="text-sm">{badge}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-q-muted">{children}</span>
    </div>
  );
}

export default async function ListingSidebar({ activeSection }: Props) {
  const [rawTools, rawCalculators, rawAITools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({ tools, calculators, aiTools });

  return (
    <aside className="rounded-2xl border border-q-border bg-q-card p-5"
      style={{ boxShadow: "var(--q-shadow-sm)" }}>
      <h2 className="text-base font-bold text-q-text mb-5">Browse by niche</h2>

      <div className="space-y-6">
        {/* Tools */}
        <div>
          <SectionTitle badge="⚙️">Tools</SectionTitle>
          <div className="space-y-1">
            <Link
              href="/tools"
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                activeSection === "tools"
                  ? "bg-q-primary text-white font-medium"
                  : "text-q-text hover:bg-q-card-hover"
              }`}
            >
              <span>All Tools</span>
              <span className={activeSection === "tools" ? "text-white/70" : "text-q-muted"}>{tools.length}</span>
            </Link>
            {taxonomy.tools.map((group) => (
              <Link
                key={group.key}
                href={`/tools?group=${group.key}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">{CATEGORY_ICONS[group.label] ?? "🔧"}</span>
                  <span>{group.label}</span>
                </span>
                <span className="text-xs">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="divider-gradient" />

        {/* Calculators */}
        <div>
          <SectionTitle badge="🧮">Calculators</SectionTitle>
          <div className="space-y-1">
            <Link
              href="/calculators"
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                activeSection === "calculators"
                  ? "bg-q-primary text-white font-medium"
                  : "text-q-text hover:bg-q-card-hover"
              }`}
            >
              <span>All Calculators</span>
              <span className={activeSection === "calculators" ? "text-white/70" : "text-q-muted"}>{calculators.length}</span>
            </Link>
            {taxonomy.calculators.map((group) => (
              <Link
                key={group.key}
                href={`/calculators?group=${group.key}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">{CATEGORY_ICONS[group.label] ?? "📊"}</span>
                  <span>{group.label}</span>
                </span>
                <span className="text-xs">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="divider-gradient" />

        {/* AI Tools */}
        <div>
          <SectionTitle badge="✨">AI Tools</SectionTitle>
          <div className="space-y-1">
            <Link
              href="/ai-tools"
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm transition ${
                activeSection === "ai-tools"
                  ? "bg-q-primary text-white font-medium"
                  : "text-q-text hover:bg-q-card-hover"
              }`}
            >
              <span>All AI Tools</span>
              <span className={activeSection === "ai-tools" ? "text-white/70" : "text-q-muted"}>{aiTools.length}</span>
            </Link>
            {taxonomy.aiTools.map((group) => (
              <Link
                key={group.key}
                href={`/ai-tools?group=${group.key}`}
                className="flex items-center justify-between rounded-xl px-3 py-2 text-sm text-q-muted transition hover:bg-q-card-hover hover:text-q-text"
              >
                <span className="flex items-center gap-2">
                  <span className="text-xs">{CATEGORY_ICONS[group.label] ?? "✨"}</span>
                  <span>{group.label}</span>
                </span>
                <span className="text-xs">{group.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}