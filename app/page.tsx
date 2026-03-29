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

export const dynamic = "force-dynamic";

const siteUrl = getSiteUrl();

export async function generateMetadata(): Promise<Metadata> {
  const [rawTools, rawCalculators, rawAITools] = await Promise.all([
    getTools(), getCalculators(), getAITools(),
  ]);
  const total = filterVisibleTools(rawTools).length
    + filterVisibleCalculators(rawCalculators).length
    + filterVisibleAITools(rawAITools).length;

  return {
    title: "QuickFnd — Free Tools, Calculators & AI Utilities",
    description:
      `Free browser-based tools, calculators, and AI utilities. JSON formatter, password generator, EMI calculator, AI email writer, word counter and ${total}+ more. No install needed.`,
    alternates: { canonical: siteUrl },
    openGraph: {
      url: siteUrl,
      title: "QuickFnd — Free Tools, Calculators & AI Utilities",
      description: `${total}+ free browser-based tools, calculators, and AI utilities. No install needed.`,
    },
  };
}

const UNIVERSAL_TOOL_SLUGS = [
  "image-compressor", "pdf-merger", "video-to-gif", "json-formatter", "password-generator", "qr-code-generator",
  "salary-calculator", "word-counter", "ai-email-writer",
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
  for (const slug of prioritySlugs) {
    if (result.length >= limit) break;
    const item = map.get(slug);
    if (item && !seen.has(slug)) { result.push(item); seen.add(slug); }
  }
  for (const slug of fallbackSlugs) {
    if (result.length >= limit) break;
    const item = map.get(slug);
    if (item && !seen.has(slug)) { result.push(item); seen.add(slug); }
  }
  for (const item of items) {
    if (result.length >= limit) break;
    if (!seen.has(item.slug)) { result.push(item); seen.add(item.slug); }
  }
  return result.slice(0, limit);
}

/* ── SVG Icon Components (replace emoji with crisp vectors) ─────────────── */
const Icons = {
  wrench: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  calc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>,
  sparkles: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  book: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  zap: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  shield: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  monitor: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
  gift: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
  arrow: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>,
  lock: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,
  code: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  image: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  dollar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>,
  mail: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  pen: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
};

export default async function HomePage() {
  const [rawTools, rawCalculators, rawAITools, headersList] = await Promise.all([
    getTools(), getCalculators(), getAITools(), headers(),
  ]);

  const tools = filterVisibleTools(rawTools);
  const calculators = filterVisibleCalculators(rawCalculators);
  const aiTools = filterVisibleAITools(rawAITools);

  const taxonomy = buildHomepageTaxonomy({ tools, calculators, aiTools });
  const topics = getTopicCollections({ tools, calculators, aiTools }).slice(0, 6);

  const countryCode = (headersList.get("x-vercel-ip-country") || "US").toUpperCase().slice(0, 2);
  const geoProfile = getCountryProfile(countryCode);

  const featuredTools = getGeoTools(tools, geoProfile.featuredToolSlugs, UNIVERSAL_TOOL_SLUGS, 6);
  const featuredCalculators = getGeoTools(calculators, geoProfile.calculatorSlugs, [], 6);
  const featuredAITools = getPinned(aiTools, PINNED_AI_SLUGS);
  const totalCount = tools.length + calculators.length + aiTools.length;

  return (
    <main className="min-h-screen bg-q-bg text-q-text">

      {/* ══ HERO ══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 lg:px-8 lg:pb-24 lg:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1fr_400px]">

            {/* Left — Headline */}
            <div>
              <div className="glass-card inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-medium" style={{ borderRadius: "100px" }}>
                <span className="status-dot" />
                <span className="font-semibold text-q-text">{totalCount}+</span>
                <span className="text-q-muted">free tools live · No signup needed</span>
              </div>

              <h1 className="mt-8 text-5xl font-extrabold tracking-tight leading-[1.05] md:text-6xl xl:text-[4.5rem]">
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

              <div className="mt-8 max-w-xl">
                <HomeSearch />
              </div>

              {/* Category pills */}
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/tools"
                  className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-q-muted transition hover:text-q-text" style={{ borderRadius: "12px" }}>
                  <span style={{ color: "var(--q-tool-color)" }}>{Icons.wrench}</span>
                  Tools
                  <span className="rounded-md px-1.5 py-0.5 text-xs font-semibold stat-mono" style={{ background: "var(--q-primary-glow)", color: "var(--q-tool-color)" }}>{tools.length}</span>
                </Link>
                <Link href="/calculators"
                  className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-q-muted transition hover:text-q-text" style={{ borderRadius: "12px" }}>
                  <span style={{ color: "var(--q-calc-color)" }}>{Icons.calc}</span>
                  Calculators
                  <span className="rounded-md px-1.5 py-0.5 text-xs font-semibold stat-mono" style={{ background: "rgba(16,185,129,0.1)", color: "var(--q-calc-color)" }}>{calculators.length}</span>
                </Link>
                <Link href="/ai-tools"
                  className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-q-muted transition hover:text-q-text" style={{ borderRadius: "12px" }}>
                  <span style={{ color: "var(--q-ai-color)" }}>{Icons.sparkles}</span>
                  AI Tools
                  <span className="rounded-md px-1.5 py-0.5 text-xs font-semibold stat-mono" style={{ background: "rgba(139,92,246,0.1)", color: "var(--q-ai-color)" }}>{aiTools.length}</span>
                </Link>
                <Link href="/blog"
                  className="glass-card inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-q-muted transition hover:text-q-text" style={{ borderRadius: "12px" }}>
                  <span style={{ color: "var(--q-blog-color)" }}>{Icons.book}</span>
                  Blog
                </Link>
              </div>
            </div>

            {/* Right — Stats glass card */}
            <div className="hidden lg:block">
              <div className="glass-card p-8" style={{ borderRadius: "24px" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-q-muted mb-6">By the numbers</p>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: `${totalCount}+`, label: "Free tools" },
                    { value: "0", label: "Signup required" },
                    { value: "100%", label: "Browser-based" },
                    { value: "0kb", label: "Data sent" },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="text-3xl font-extrabold text-q-text tracking-tight stat-mono">{s.value}</div>
                      <div className="text-xs text-q-muted mt-1.5">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    { icon: Icons.zap, text: "Instant — no loading screens", color: "var(--q-tool-color)" },
                    { icon: Icons.shield, text: "Private — nothing leaves your browser", color: "var(--q-calc-color)" },
                    { icon: Icons.monitor, text: "Works on any device, any OS", color: "var(--q-ai-color)" },
                  ].map(item => (
                    <div key={item.text} className="flex items-center gap-3 text-sm">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: "var(--q-card)", color: item.color }}>{item.icon}</span>
                      <span className="text-q-muted">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recently used */}
      <div className="pt-4"><RecentlyUsedTools /></div>

      {/* ── Ad (tucked between sections, minimal visual noise) ────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex justify-center opacity-60 hover:opacity-100 transition-opacity">
        <AdSlot type="leaderboard" pageKey="homepage" />
      </div>

      {/* ══ FEATURED TOOLS ════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: "var(--q-tool-color)" }}>Featured</p>
            <h2 className="text-2xl font-bold text-q-text tracking-tight">Tools</h2>
          </div>
          <Link href="/tools" className="text-sm font-semibold transition" style={{ color: "var(--q-tool-color)" }}>
            View all {tools.length} →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`}
              className="glass-card card-shine group relative overflow-hidden p-6 accent-bar-top accent-bar-tool">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl" style={{ background: "rgba(99,102,241,0.1)", color: "var(--q-tool-color)" }}>
                  {Icons.code}
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "var(--q-primary-glow)", color: "var(--q-tool-color)" }}>
                  {Icons.arrow}
                </div>
              </div>
              <h3 className="mt-3 font-semibold text-q-text text-[15px] tracking-tight">{tool.name}</h3>
              <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                {getDisplayDescription("tools", tool, "card")}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <span className="badge-tool rounded-lg px-2.5 py-1 text-[10px] font-semibold">Tool</span>
                <span className="rounded-lg px-2.5 py-1 text-[10px] font-medium" style={{ background: "var(--q-card)", color: "var(--q-muted)", border: "1px solid var(--q-border)" }}>Free</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══ TOPICS ════════════════════════════════════════════════════════════ */}
      <section style={{ background: "var(--q-bg-subtle)" }}>
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-q-muted mb-2">Discover by category</p>
              <h2 className="text-2xl font-bold text-q-text tracking-tight">Browse Topics</h2>
            </div>
            <Link href="/topics" className="text-sm font-semibold text-q-primary transition hover:opacity-80">View all →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {topics.map((topic) => (
              <Link key={topic.key} href={`/topics/${topic.key}`}
                className="glass-card group flex items-center gap-4 p-4" style={{ borderRadius: "16px" }}>
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold" style={{ background: "var(--q-primary-glow)", color: "var(--q-primary)" }}>
                  {topic.label.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-q-text text-sm group-hover:text-q-primary transition-colors truncate">{topic.label}</div>
                  <div className="text-xs text-q-muted mt-0.5 stat-mono">{topic.totalCount} items</div>
                </div>
                <span className="ml-auto text-q-muted group-hover:text-q-primary transition-colors text-lg">›</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CALCULATORS + AI TOOLS + SIDEBAR ══════════════════════════════════ */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 xl:grid-cols-[1fr_320px]">
          <div className="space-y-16">

            {/* Calculators */}
            <section>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: "var(--q-calc-color)" }}>{geoProfile.financeLabel}</p>
                  <h2 className="text-2xl font-bold text-q-text tracking-tight">Calculators</h2>
                </div>
                <Link href="/calculators" className="text-sm font-semibold transition" style={{ color: "var(--q-calc-color)" }}>
                  View all {calculators.length} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredCalculators.map((item) => (
                  <Link key={item.slug} href={`/calculators/${item.slug}`}
                    className="glass-card card-shine group relative overflow-hidden p-5 accent-bar-top accent-bar-calc">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(16,185,129,0.1)", color: "var(--q-calc-color)" }}>
                      {Icons.calc}
                    </div>
                    <h3 className="mt-3 font-semibold text-q-text text-[15px] tracking-tight">{item.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("calculators", item, "card")}
                    </p>
                  </Link>
                ))}
              </div>
            </section>

            {/* Email capture */}
            <EmailCapture variant="banner" source="homepage" />

            {/* AI Tools */}
            <section>
              <div className="mb-8 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{ color: "var(--q-ai-color)" }}>AI-Powered</p>
                  <h2 className="text-2xl font-bold text-q-text tracking-tight">AI Tools</h2>
                </div>
                <Link href="/ai-tools" className="text-sm font-semibold transition" style={{ color: "var(--q-ai-color)" }}>
                  View all {aiTools.length} →
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {featuredAITools.map((item) => (
                  <Link key={item.slug} href={`/ai-tools/${item.slug}`}
                    className="glass-card card-shine group relative overflow-hidden p-5 accent-bar-top accent-bar-ai">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(139,92,246,0.1)", color: "var(--q-ai-color)" }}>
                      {Icons.sparkles}
                    </div>
                    <h3 className="mt-3 font-semibold text-q-text text-[15px] tracking-tight">{item.name}</h3>
                    <p className="mt-1.5 text-sm leading-6 text-q-muted line-clamp-2">
                      {getDisplayDescription("ai_tools", item, "card")}
                    </p>
                    <div className="mt-3 badge-ai inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[10px] font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--q-ai-color)" }} />
                      AI Powered
                    </div>
                  </Link>
                ))}
              </div>
            </section>

            {/* Ad — blended into flow */}
            <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
              <AdSlot type="in-article" pageKey="homepage" />
            </div>

            {/* Trust strip */}
            <section className="glass-card p-8" style={{ borderRadius: "24px" }}>
              <h2 className="text-xl font-bold text-q-text mb-8 text-center tracking-tight">Why people use QuickFnd</h2>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { icon: Icons.zap, title: "Instant results", desc: "No loading, no server round-trip. Everything runs in your browser tab.", color: "var(--q-tool-color)" },
                  { icon: Icons.shield, title: "100% private", desc: "Your passwords, financial data, and code never leave your device.", color: "var(--q-calc-color)" },
                  { icon: Icons.monitor, title: "Works everywhere", desc: "Desktop, tablet, mobile. Any browser, any OS, even offline.", color: "var(--q-ai-color)" },
                  { icon: Icons.gift, title: "Always free", desc: "No account, no paywall, no premium tier. Every tool is free forever.", color: "var(--q-compare-color)" },
                ].map(item => (
                  <div key={item.title} className="flex flex-col items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "var(--q-card)", color: item.color, border: "1px solid var(--q-border)" }}>{item.icon}</span>
                    <div>
                      <div className="font-semibold text-q-text text-sm">{item.title}</div>
                      <p className="mt-1 text-sm leading-6 text-q-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>

          {/* ── SIDEBAR ──────────────────────────────────────────────────── */}
          <aside className="self-start xl:sticky xl:top-24 space-y-5">
            <div className="flex justify-center opacity-50 hover:opacity-100 transition-opacity">
              <AdSlot type="rectangle" />
            </div>

            {/* Browse by niche */}
            <div className="glass-card p-5" style={{ borderRadius: "18px" }}>
              <h3 className="font-semibold text-q-text text-sm mb-4">Browse by niche</h3>
              <div className="space-y-5">
                {[
                  { label: "Tools", items: taxonomy.tools, base: "/tools?group=", color: "var(--q-tool-color)" },
                  { label: "Calculators", items: taxonomy.calculators, base: "/calculators?group=", color: "var(--q-calc-color)" },
                  { label: "AI Tools", items: taxonomy.aiTools, base: "/ai-tools?group=", color: "var(--q-ai-color)" },
                ].map(section => (
                  <div key={section.label}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-2" style={{ color: section.color }}>{section.label}</p>
                    <div className="space-y-0.5">
                      {section.items.map(group => (
                        <Link key={group.key} href={`${section.base}${group.key}`}
                          className="flex items-center justify-between rounded-lg px-3 py-2 text-xs text-q-muted transition hover:text-q-text" style={{ background: "transparent" }}
                          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--q-card)"; }}
                          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                        >
                          <span>{group.label}</span>
                          <span className="stat-mono tabular-nums text-[10px]">{group.count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <EmailCapture variant="inline" source="homepage-sidebar" />

            {/* Write for us */}
            <div className="glass-card p-5" style={{ borderRadius: "18px" }}>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg mb-3" style={{ background: "var(--q-primary-glow)", color: "var(--q-primary)" }}>
                {Icons.pen}
              </div>
              <h3 className="font-semibold text-q-text text-sm">Write for QuickFnd</h3>
              <p className="text-xs text-q-muted mt-1.5 leading-5">
                Share your expertise with our audience of developers and finance professionals.
              </p>
              <Link href="/write-for-us"
                className="btn-primary mt-4 flex w-full items-center justify-center text-sm">
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
