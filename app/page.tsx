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
import EmailCapture from "@/components/email/EmailCapture";
import { getCountryProfile } from "@/lib/geo-personalisation";
import { headers } from "next/headers";
import RecentlyUsedTools from "@/components/history/RecentlyUsedTools";

// Geo-personalisation requires dynamic rendering (reads request headers)
export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  title: "QuickFnd — Free Tools, Calculators & AI Utilities",
  description:
    "Free browser-based tools, calculators, and AI utilities. JSON formatter, password generator, EMI calculator, AI email writer, word counter and 205+ more. No install needed.",
  alternates: { canonical: siteUrl },
  openGraph: {
    url: siteUrl,
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description: "205+ free browser-based tools, calculators, and AI utilities. No install needed.",
  },
};

const UNIVERSAL_TOOL_SLUGS = [
  "password-generator", "json-formatter", "word-counter",
  "base64-encoder", "uuid-generator", "text-case-converter",
  "qr-code-generator", "sha256-generator", "regex-tester",
];
const PINNED_AI_SLUGS = [
  "ai-email-writer", "ai-prompt-generator", "ai-blog-outline-generator",
];

function getPinned<T extends { slug: string }>(items: T[], pinned: string[]): T[] {
  const map = new Map(items.map((i) => [i.slug, i]));
  const result: T[] = [];
  for (const slug of pinned) { const item = map.get(slug); if (item) result.push(item); }
  for (const item of items) {
    if (result.length >= 6) break;
    if (!result.find((r) => r.slug === item.slug)) result.push(item);
  }
  return result.slice(0, 6);
}

function getGeoTools<T extends { slug: string }>(items: T[], prioritySlugs: string[], fallbackSlugs: string[], limit = 6): T[] {
  const map = new Map(items.map(i => [i.slug, i]));
  const seen = new Set<string>();
  const result: T[] = [];
  // Priority slugs first
  for (const slug of prioritySlugs) {
    if (result.length >= limit) break;
    const item = map.get(slug);
    if (item && !seen.has(slug)) { result.push(item); seen.add(slug); }
  }
  // Fill from fallback
  for (const slug of fallbackSlugs) {
    if (result.length >= limit) break;
    const item = map.get(slug);
    if (item && !seen.has(slug)) { result.push(item); seen.add(slug); }
  }
  // Fill from full list
  for (const item of items) {
    if (result.length >= limit) break;
    if (!seen.has(item.slug)) { result.push(item); seen.add(item.slug); }
  }
  return result.slice(0, limit);
}

const TOOL_ACCENT: Record<string, { bg: string; text: string; border: string }> = {
  "password-generator":   { bg: "bg-blue-500/10",   text: "text-blue-500",   border: "group-hover:border-blue-400/50" },
  "json-formatter":       { bg: "bg-amber-500/10",   text: "text-amber-500",  border: "group-hover:border-amber-400/50" },
  "word-counter":         { bg: "bg-emerald-500/10", text: "text-emerald-500",border: "group-hover:border-emerald-400/50" },
  "base64-encoder":       { bg: "bg-purple-500/10",  text: "text-purple-500", border: "group-hover:border-purple-400/50" },
  "uuid-generator":       { bg: "bg-rose-500/10",    text: "text-rose-500",   border: "group-hover:border-rose-400/50" },
  "text-case-converter":  { bg: "bg-cyan-500/10",    text: "text-cyan-500",   border: "group-hover:border-cyan-400/50" },
};
const CALC_ACCENT = [
  { bg: "bg-violet-500/10",  text: "text-violet-500",  border: "group-hover:border-violet-400/50" },
  { bg: "bg-indigo-500/10",  text: "text-indigo-500",  border: "group-hover:border-indigo-400/50" },
  { bg: "bg-teal-500/10",    text: "text-teal-500",    border: "group-hover:border-teal-400/50" },
  { bg: "bg-orange-500/10",  text: "text-orange-500",  border: "group-hover:border-orange-400/50" },
  { bg: "bg-pink-500/10",    text: "text-pink-500",    border: "group-hover:border-pink-400/50" },
  { bg: "bg-lime-500/10",    text: "text-lime-500",    border: "group-hover:border-lime-400/50" },
];

const CATEGORY_ICONS: Record<string, string> = {
  "Encoders & Converters": "⇄", "Text & Writing": "✍", "Developer Tools": "</>",
  "SEO & Marketing": "◈", "Generators": "✦", "Finance Calculators": "₹",
  "Health Calculators": "♡", "Math Calculators": "∑", "Content AI": "✨",
  "Writing AI": "✦", "Date & Time Calculators": "⊙",
};

const STATS = [
  { value: "205+", label: "Free tools" },
  { value: "0", label: "Signup required" },
  { value: "100%", label: "Browser-based" },
  { value: "0kb", label: "Data sent" },
];

export default async function HomePage() {
  const [rawTools, rawCalculators, rawAITools, headersList] = await Promise.all([
    getTools(), getCalculators(), getAITools(), headers(),
  ]);

  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({ tools, calculators, aiTools });
  const topics = getTopicCollections({ tools, calculators, aiTools }).slice(0, 6);

  // Geo-personalisation — Vercel injects x-vercel-ip-country into every request header.
  // No middleware needed — server components can read it directly.
  const countryCode = (headersList.get("x-vercel-ip-country") || "US").toUpperCase().slice(0, 2);
  const geoProfile = getCountryProfile(countryCode);

  const featuredTools = getGeoTools(tools, geoProfile.featuredToolSlugs, UNIVERSAL_TOOL_SLUGS, 6);
  const featuredCalculators = getGeoTools(calculators, geoProfile.calculatorSlugs, [], 6);
  const featuredAITools = getPinned(aiTools, PINNED_AI_SLUGS);
  const totalCount = tools.length + calculators.length + aiTools.length;
  const isLocalised = countryCode !== "US" && geoProfile.calculatorSlugs.length > 0;

  return (
    <main className="min-h-screen bg-q-bg text-q-text">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-q-border">

        {/* Mesh background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-[0.035] blur-3xl"
            style={{ background: "radial-gradient(ellipse, #2563eb 0%, #7c3aed 50%, transparent 70%)" }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-q-border to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-20 lg:pt-20">

          {/* Two-column hero */}
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_420px]">

            {/* Left — headline + search */}
            <div>
              {/* Tag */}
              <div className="inline-flex items-center gap-2 rounded-full border border-q-border bg-q-card px-4 py-1.5 text-xs font-medium text-q-muted mb-6">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-q-text">{totalCount}+</span> free tools live · No signup needed
              </div>

              <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] md:text-6xl xl:text-7xl">
                <span className="text-q-text">Your browser</span>
                <br />
                <span className="text-q-text">is your</span>
                <br />
                <span className="text-gradient">toolkit.</span>
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-8 text-q-muted">
                Tools, calculators, and AI utilities that run instantly in your browser.
                No install. No account. Just results.
              </p>

              {/* Search */}
              <div className="mt-8 max-w-xl">
                <HomeSearch />
              </div>

              {/* Quick links */}
              <div className="mt-6 flex flex-wrap gap-2">
                {[
                  { href: "/tools", label: "⚙️ Tools", count: tools.length },
                  { href: "/calculators", label: "🧮 Calculators", count: calculators.length },
                  { href: "/ai-tools", label: "✨ AI Tools", count: aiTools.length },
                  { href: "/blog", label: "📝 Blog", count: null },
                ].map(cat => (
                  <Link key={cat.href} href={cat.href}
                    className="flex items-center gap-1.5 rounded-xl border border-q-border bg-q-card px-3.5 py-2 text-sm font-medium text-q-muted transition hover:border-blue-400/50 hover:text-q-text">
                    {cat.label}
                    {cat.count && <span className="rounded-md bg-q-bg px-1.5 py-0.5 text-xs">{cat.count}</span>}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right — Stats card */}
            <div className="hidden lg:block">
              <div className="rounded-3xl border border-q-border bg-q-card p-8 shadow-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-q-muted mb-6">By the numbers</p>
                <div className="grid grid-cols-2 gap-6">
                  {STATS.map(s => (
                    <div key={s.label}>
                      <div className="text-4xl font-black text-q-text tracking-tight">{s.value}</div>
                      <div className="text-sm text-q-muted mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    { icon: "⚡", text: "Instant — no loading screens" },
                    { icon: "🔒", text: "Private — nothing leaves your browser" },
                    { icon: "📱", text: "Works on any device, any OS" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-q-bg text-base">{item.icon}</span>
                      <span className="text-q-muted">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RECENTLY USED (client-side, shows only if history exists) ───── */}
      <div className="pt-10">
        <RecentlyUsedTools />
      </div>

      {/* ── AD ─────────────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 flex justify-center">
        <AdSlot type="leaderboard" pageKey="homepage" />
      </div>

      {/* ── FEATURED TOOLS ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500 mb-2">Most Popular</p>
            <h2 className="text-3xl font-bold text-q-text">Featured Tools</h2>
          </div>
          <Link href="/tools" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition">
            View all {tools.length} →
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((tool) => {
            const accent = TOOL_ACCENT[tool.slug] ?? { bg: "bg-blue-500/10", text: "text-blue-500", border: "group-hover:border-blue-400/50" };
            return (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className={`group relative rounded-2xl border border-q-border bg-q-card p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${accent.border}`}>
                {/* Top accent line */}
                <div className={`absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${accent.bg.replace("/10", "")}`} />
                <div className="flex items-start gap-4">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}>
                    <span className={`text-lg font-black ${accent.text}`}>{tool.name.charAt(0)}</span>
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold text-q-text transition-colors group-hover:${accent.text}`}>
                      {tool.name}
                    </div>
                    <p className="mt-1 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("tools", tool, "card")}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-0.5 text-xs text-q-muted">Free</span>
                  <span className="rounded-full border border-q-border bg-q-bg px-2.5 py-0.5 text-xs text-q-muted">Browser-based</span>
                  <span className={`ml-auto text-xs font-semibold ${accent.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                    Open →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── TOPICS ──────────────────────────────────────────────────────────── */}
      <section className="border-y border-q-border bg-q-card">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-500 mb-2">Discover by Category</p>
              <h2 className="text-3xl font-bold text-q-text">Browse Topics</h2>
            </div>
            <Link href="/topics" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition">
              View all →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic, i) => {
              const colors = ["blue","purple","emerald","orange","rose","cyan"];
              const c = colors[i % colors.length];
              return (
                <Link key={topic.key} href={`/topics/${topic.key}`}
                  className="group flex items-center gap-4 rounded-2xl border border-q-border bg-q-bg p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-${c}-500/10 text-${c}-500 font-bold text-lg`}>
                    {CATEGORY_ICONS[topic.label] ?? topic.label.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-q-text group-hover:text-blue-500 transition-colors">{topic.label}</div>
                    <div className="text-xs text-q-muted mt-0.5">{topic.totalCount} items</div>
                  </div>
                  <span className="ml-auto text-q-border group-hover:text-blue-500 transition-colors text-lg">›</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CALCULATORS + SIDEBAR ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 xl:grid-cols-[1fr_320px]">
          <div className="space-y-16">

            {/* Calculators */}
            <section>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-violet-500 mb-2">{geoProfile.financeLabel}</p>
                  <h2 className="text-3xl font-bold text-q-text">
                    Calculators{isLocalised && <span className="ml-2 text-sm font-normal text-q-muted">for {geoProfile.name}</span>}
                  </h2>
                </div>
                <Link href="/calculators" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition">
                  View all {calculators.length} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredCalculators.map((item, i) => {
                  const acc = CALC_ACCENT[i % CALC_ACCENT.length];
                  return (
                    <Link key={item.slug} href={`/calculators/${item.slug}`}
                      className={`group rounded-2xl border border-q-border bg-q-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg ${acc.border}`}>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${acc.bg} ${acc.text} font-black text-lg`}>∑</div>
                      <div className={`mt-3 font-semibold text-q-text transition-colors group-hover:${acc.text}`}>{item.name}</div>
                      <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                        {getDisplayDescription("calculators", item, "card")}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Email capture */}
            <EmailCapture variant="banner" source="homepage" />

            {/* AI Tools */}
            <section>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-500 mb-2">AI-Powered</p>
                  <h2 className="text-3xl font-bold text-q-text">AI Tools</h2>
                </div>
                <Link href="/ai-tools" className="text-sm font-semibold text-blue-500 hover:text-blue-400 transition">
                  View all {aiTools.length} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredAITools.map((item) => (
                  <Link key={item.slug} href={`/ai-tools/${item.slug}`}
                    className="group rounded-2xl border border-q-border bg-q-card p-5 transition-all hover:-translate-y-1 hover:border-emerald-400/40 hover:shadow-lg">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 font-black text-lg">✦</div>
                    <div className="mt-3 font-semibold text-q-text group-hover:text-emerald-500 transition-colors">{item.name}</div>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />AI Powered
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* In-feed ad */}
            <div className="flex justify-center">
              <AdSlot type="in-article" pageKey="homepage" />
            </div>

            {/* Trust strip */}
            <section className="rounded-3xl border border-q-border bg-q-card p-8">
              <h2 className="text-2xl font-bold text-q-text mb-8 text-center">Why thousands use QuickFnd</h2>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: "⚡", title: "Instant results", desc: "No loading, no server round-trip. Everything runs in your browser tab." },
                  { icon: "🔒", title: "100% private", desc: "Your passwords, financial data, and code never leave your device." },
                  { icon: "📱", title: "Works everywhere", desc: "Desktop, tablet, mobile. Any browser, any OS, even offline." },
                  { icon: "🆓", title: "Always free", desc: "No account, no paywall, no premium tier. Every tool is free forever." },
                ].map(item => (
                  <div key={item.title} className="flex flex-col items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-q-border bg-q-bg text-xl">{item.icon}</span>
                    <div>
                      <div className="font-semibold text-q-text">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-q-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <aside className="self-start xl:sticky xl:top-24 space-y-6">
            <div className="flex justify-center">
              <AdSlot type="rectangle" />
            </div>

            {/* Browse by niche */}
            <div className="rounded-2xl border border-q-border bg-q-card p-5">
              <h3 className="font-semibold text-q-text mb-4">Browse by niche</h3>
              <div className="space-y-5">
                {[
                  { label: "Tools", items: taxonomy.tools, base: "/tools?group=" },
                  { label: "Calculators", items: taxonomy.calculators, base: "/calculators?group=" },
                  { label: "AI Tools", items: taxonomy.aiTools, base: "/ai-tools?group=" },
                ].map(section => (
                  <div key={section.label}>
                    <p className="text-xs font-bold uppercase tracking-widest text-q-muted mb-2">{section.label}</p>
                    <div className="space-y-0.5">
                      {section.items.map(group => (
                        <Link key={group.key} href={`${section.base}${group.key}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-q-muted transition hover:bg-q-bg hover:text-q-text">
                          <span>{group.label}</span>
                          <span className="tabular-nums text-xs">{group.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <EmailCapture variant="inline" source="homepage-sidebar" />

            {/* Write for us */}
            <div className="rounded-2xl border border-q-border bg-q-card p-5">
              <div className="text-2xl mb-3">✍️</div>
              <h3 className="font-semibold text-q-text">Write for QuickFnd</h3>
              <p className="text-sm text-q-muted mt-1.5 leading-6">
                Share your expertise with our audience of developers and finance professionals.
              </p>
              <Link href="/write-for-us"
                className="mt-4 flex w-full items-center justify-center rounded-xl bg-q-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-q-primary-hover transition">
                Apply to Write →
              </Link>
            </div>
          </aside>
        </div>
      </div>

      <SiteFooter />
    </main>
  );
}