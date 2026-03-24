import type { Metadata } from "next";
import Link from "next/link";
import HomeSearch from "@/components/search/HomeSearch";
import SiteFooter from "@/components/site/SiteFooter";
import AdSlot from "@/components/ads/AdSlot";
import { getTools, getCalculators, getAITools } from "@/lib/db";
import { getDisplayDescription } from "@/lib/display-content";
import { buildHomepageTaxonomy } from "@/lib/admin-taxonomy";
import {
  filterVisibleTools,
  filterVisibleCalculators,
  filterVisibleAITools,
} from "@/lib/visibility";
import { getTopicCollections } from "@/lib/programmatic-seo";
import { getSiteUrl } from "@/lib/site-url";

export const revalidate = 300;

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "QuickFnd — Free Tools, Calculators & AI Utilities",
  description:
    "Free browser-based tools, calculators, and AI utilities. JSON formatter, password generator, EMI calculator, AI email writer, word counter and 190+ more. No install needed.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description: "190+ free browser-based tools, calculators, and AI utilities. No install needed.",
  },
};

// Pinned slugs shown first on homepage — most universally useful tools
const PINNED_TOOL_SLUGS = [
  "password-generator",
  "json-formatter",
  "word-counter",
  "base64-encoder",
  "uuid-generator",
  "text-case-converter",
];

const PINNED_CALCULATOR_SLUGS = [
  "sip-calculator",
  "income-tax-calculator",
  "emi-calculator",
  "bmi-calculator",
  "fd-calculator",
  "gst-calculator",
];

const PINNED_AI_SLUGS = [
  "ai-email-writer",
  "ai-prompt-generator",
  "ai-blog-outline-generator",
];

function getPinned<T extends { slug: string }>(items: T[], pinned: string[]): T[] {
  const map = new Map(items.map((i) => [i.slug, i]));
  const result: T[] = [];
  for (const slug of pinned) {
    const item = map.get(slug);
    if (item) result.push(item);
  }
  // Fill remaining slots from the full list if pinned items don't exist yet
  for (const item of items) {
    if (result.length >= 6) break;
    if (!result.find((r) => r.slug === item.slug)) result.push(item);
  }
  return result.slice(0, 6);
}

const CATEGORY_ICONS: Record<string, string> = {
  "Encoders & Converters": "⇄",
  "Text & Writing": "✍",
  "Developer Tools": "</>",
  "SEO & Marketing": "📈",
  "YouTube & Video": "▶",
  "Generators": "✦",
  "Finance Calculators": "₹",
  "Health Calculators": "♡",
  "Math Calculators": "∑",
  "Content AI": "✨",
  "Writing AI": "✦",
};

export default async function HomePage() {
  const [rawTools, rawCalculators, rawAITools] = await Promise.all([
    getTools(),
    getCalculators(),
    getAITools(),
  ]);

  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({ tools, calculators, aiTools });
  const topics = getTopicCollections({ tools, calculators, aiTools }).slice(0, 6);

  const featuredTools = getPinned(tools, PINNED_TOOL_SLUGS);
  const featuredCalculators = getPinned(calculators, PINNED_CALCULATOR_SLUGS);
  const featuredAITools = getPinned(aiTools, PINNED_AI_SLUGS);

  const totalCount = tools.length + calculators.length + aiTools.length;

  return (
    <main className="min-h-screen bg-q-bg text-q-text">

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full opacity-[0.06]"
            style={{ background: "radial-gradient(circle, var(--q-primary) 0%, transparent 70%)" }} />
          <div className="absolute -right-32 top-20 h-[400px] w-[400px] rounded-full opacity-[0.04]"
            style={{ background: "radial-gradient(circle, var(--q-accent2) 0%, transparent 70%)" }} />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-8 pt-12 sm:px-6 lg:px-8 lg:pt-16">
          {/* Stats pill */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-q-border bg-q-card px-5 py-2 text-sm shadow-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
              <span className="text-q-muted">
                <span className="font-semibold text-q-text">{totalCount}+</span> free tools live
              </span>
              <span className="text-q-border">·</span>
              <span className="text-q-muted">No signup needed</span>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-q-text">Your browser is</span>
              <br />
              <span className="text-gradient">your toolkit.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-q-muted md:text-lg md:leading-8">
              Tools, calculators, and AI utilities that run instantly in your browser.
              No install. No account. Just results.
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-2xl">
            <HomeSearch />
          </div>

          {/* Category quick-links */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {[
              { href: "/tools", label: "Tools", count: tools.length, color: "blue" },
              { href: "/calculators", label: "Calculators", count: calculators.length, color: "purple" },
              { href: "/ai-tools", label: "AI Tools", count: aiTools.length, color: "green" },
              { href: "/topics", label: "Topics", count: topics.length * 6, color: "orange" },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="group flex items-center gap-2 rounded-xl border border-q-border bg-q-card px-4 py-2.5 text-sm font-medium text-q-text transition hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-md"
              >
                <span>{cat.label}</span>
                <span className="rounded-full bg-q-bg px-2 py-0.5 text-xs text-q-muted">{cat.count}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-10 px-4 pb-16 sm:px-6 lg:px-8">

        {/* Ad slot — below hero */}
        <div className="flex justify-center">
          <AdSlot type="leaderboard" pageKey="homepage" />
        </div>

        {/* ── Featured Tools ─────────────────────────────────────────────── */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Most Popular</p>
              <h2 className="mt-1 text-2xl font-bold text-q-text md:text-3xl">Featured Tools</h2>
            </div>
            <Link href="/tools" className="text-sm font-medium text-blue-500 hover:text-blue-400">
              View all {tools.length} →
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {featuredTools.map((tool, i) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="card-shine group relative rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:border-blue-400/40 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                    style={{ background: `linear-gradient(135deg, var(--q-gradient-blue))`, opacity: 0.9 }}>
                    <span className="text-white text-sm font-bold">{tool.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-q-text group-hover:text-blue-500 transition-colors">
                      {tool.name}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("tools", tool, "card")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-q-muted">
                  <span className="rounded-full border border-q-border bg-q-bg px-2 py-0.5">Free</span>
                  <span className="rounded-full border border-q-border bg-q-bg px-2 py-0.5">Browser-based</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── Topics Grid ────────────────────────────────────────────────── */}
        <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-500">Discover by Category</p>
              <h2 className="mt-1 text-2xl font-bold text-q-text md:text-3xl">Browse Topics</h2>
            </div>
            <Link href="/topics" className="text-sm font-medium text-blue-500 hover:text-blue-400">
              View all →
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <Link
                key={topic.key}
                href={`/topics/${topic.key}`}
                className="group flex items-center gap-4 rounded-2xl border border-q-border bg-q-bg p-4 transition-all hover:-translate-y-0.5 hover:border-blue-400/50 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-q-border bg-q-card text-lg font-bold text-q-muted group-hover:border-blue-400/40 group-hover:text-blue-500">
                  {CATEGORY_ICONS[topic.label] ?? topic.label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-q-text group-hover:text-blue-500 transition-colors">
                    {topic.label}
                  </div>
                  <div className="mt-0.5 text-xs text-q-muted">{topic.totalCount} items</div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ── In-feed ad ─────────────────────────────────────────────────── */}
        <div className="flex justify-center">
          <AdSlot type="in-article" pageKey="homepage" />
        </div>

        <div className="grid gap-10 xl:grid-cols-[1fr_340px]">
          <div className="space-y-10">

            {/* ── Featured Calculators ───────────────────────────────────── */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-purple-500">Finance · Health · Math</p>
                  <h2 className="mt-1 text-2xl font-bold text-q-text md:text-3xl">Calculators</h2>
                </div>
                <Link href="/calculators" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  View all {calculators.length} →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredCalculators.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/calculators/${item.slug}`}
                    className="card-shine group rounded-2xl border border-q-border bg-q-card p-5 transition-all hover:-translate-y-1 hover:border-purple-400/40 hover:shadow-lg"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 text-sm font-bold">
                      ∑
                    </div>
                    <div className="mt-3 font-semibold text-q-text group-hover:text-purple-500 transition-colors">
                      {item.name}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("calculators", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* ── Featured AI Tools ──────────────────────────────────────── */}
            <section>
              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500">AI-Powered</p>
                  <h2 className="mt-1 text-2xl font-bold text-q-text md:text-3xl">AI Tools</h2>
                </div>
                <Link href="/ai-tools" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                  View all {aiTools.length} →
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredAITools.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/ai-tools/${item.slug}`}
                    className="card-shine group rounded-2xl border border-q-border bg-q-card p-5 transition-all hover:-translate-y-1 hover:border-green-400/40 hover:shadow-lg"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-600 text-sm font-bold">
                      ✦
                    </div>
                    <div className="mt-3 font-semibold text-q-text group-hover:text-green-500 transition-colors">
                      {item.name}
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      AI Powered
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────────── */}
          <aside className="self-start space-y-6 xl:sticky xl:top-24">
            {/* Sidebar ad */}
            <div className="flex justify-center">
              <AdSlot type="rectangle" />
            </div>

            {/* Browse by niche */}
            <div className="rounded-2xl border border-q-border bg-q-card p-5">
              <h3 className="text-base font-semibold text-q-text">Browse by niche</h3>

              <div className="mt-4 space-y-5">
                {/* Tools niches */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-q-muted">Tools</p>
                  <div className="space-y-1">
                    {taxonomy.tools.map((group) => (
                      <Link
                        key={group.key}
                        href={`/tools?group=${group.key}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-q-muted transition hover:bg-q-bg hover:text-q-text"
                      >
                        <span>{group.label}</span>
                        <span className="text-xs">{group.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Calculator niches */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-q-muted">Calculators</p>
                  <div className="space-y-1">
                    {taxonomy.calculators.map((group) => (
                      <Link
                        key={group.key}
                        href={`/calculators?group=${group.key}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-q-muted transition hover:bg-q-bg hover:text-q-text"
                      >
                        <span>{group.label}</span>
                        <span className="text-xs">{group.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* AI Tool niches */}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-q-muted">AI Tools</p>
                  <div className="space-y-1">
                    {taxonomy.aiTools.map((group) => (
                      <Link
                        key={group.key}
                        href={`/ai-tools?group=${group.key}`}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-q-muted transition hover:bg-q-bg hover:text-q-text"
                      >
                        <span>{group.label}</span>
                        <span className="text-xs">{group.count}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="rounded-2xl border border-q-border bg-q-card p-5">
              <h3 className="text-sm font-semibold text-q-text">Why QuickFnd?</h3>
              <div className="mt-3 space-y-3">
                {[
                  ["⚡", "Instant results", "No loading, no server wait"],
                  ["🔒", "100% private", "Nothing is sent or stored"],
                  ["📱", "Works everywhere", "Desktop, tablet, mobile"],
                  ["🆓", "Always free", "No account, no paywall"],
                ].map(([icon, title, desc]) => (
                  <div key={title} className="flex items-start gap-3">
                    <span className="mt-0.5 text-base">{icon}</span>
                    <div>
                      <div className="text-sm font-medium text-q-text">{title}</div>
                      <div className="text-xs text-q-muted">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}