/**
 * components/monetisation/AffiliateCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * DB-driven affiliate card. Fetches rules from /api/affiliate-config (cached 5min).
 * Falls back to static rules if DB fetch fails.
 * Rules are matched against the tool slug in priority order — first match wins.
 * Fully controlled from Admin → Affiliates tab.
 */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { AffiliateRule, AffiliateSettings } from "@/app/api/admin/affiliate-settings/route";

// ─── Static fallback rules (used if DB fetch fails) ───────────────────────────
// Mirrors the defaults in the API route so the card always works even if DB is down.

const STATIC_RULES: AffiliateRule[] = [
  { id: "s1", enabled: true, name: "Password", pattern: "password", pattern_type: "regex", priority: 10,
    title: "Never forget a password again", badge: "Free forever plan",
    description: "Bitwarden is a free, open-source password manager trusted by millions.",
    link: "https://bitwarden.com/?utm_source=quickfnd", label: "Try Bitwarden Free" },
  { id: "s2", enabled: true, name: "Security", pattern: "sha256|md5|hash|encrypt", pattern_type: "regex", priority: 20,
    title: "Protect your online privacy", badge: "67% off today",
    description: "NordVPN encrypts your connection and keeps your data private.",
    link: "https://nordvpn.com/?utm_source=quickfnd", label: "Get NordVPN" },
  { id: "s3", enabled: true, name: "Investment", pattern: "sip|fd-calc|ppf|investment", pattern_type: "regex", priority: 30,
    title: "Start investing with Zerodha", badge: "₹0 account opening",
    description: "India's largest stockbroker — zero brokerage on equity delivery.",
    link: "https://zerodha.com/?utm_source=quickfnd", label: "Open a Free Demat Account" },
  { id: "s4", enabled: true, name: "Loan/EMI", pattern: "emi|loan|mortgage", pattern_type: "regex", priority: 40,
    title: "Find the best loan rates in India", badge: "Free credit score check",
    description: "BankBazaar lets you compare EMI rates from 50+ banks instantly.",
    link: "https://www.bankbazaar.com/?utm_source=quickfnd", label: "Compare Loan Rates" },
  { id: "s5", enabled: true, name: "Tax", pattern: "gst|income-tax|hra|tax-calc", pattern_type: "regex", priority: 50,
    title: "File your taxes in minutes", badge: "Free basic filing",
    description: "ClearTax is India's most trusted tax filing platform.",
    link: "https://cleartax.in/?utm_source=quickfnd", label: "File ITR Free with ClearTax" },
  { id: "s6", enabled: true, name: "SEO", pattern: "seo|keyword|backlink|rank", pattern_type: "regex", priority: 60,
    title: "Take your SEO to the next level", badge: "7-day trial for $7",
    description: "Ahrefs is the industry's most trusted SEO toolkit.",
    link: "https://ahrefs.com/?utm_source=quickfnd", label: "Try Ahrefs" },
  { id: "s7", enabled: true, name: "AI Writing", pattern: "ai-writ|blog|content-gen|email-writ", pattern_type: "regex", priority: 70,
    title: "Scale your content with AI", badge: "7-day free trial",
    description: "Jasper writes long-form blog posts, ad copy, and emails in your brand voice.",
    link: "https://www.jasper.ai/?utm_source=quickfnd", label: "Try Jasper AI" },
  { id: "s8", enabled: true, name: "Currency", pattern: "currency|forex|exchange-rate", pattern_type: "regex", priority: 80,
    title: "Save on international transfers", badge: "First transfer free",
    description: "Wise uses the real mid-market exchange rate with low transparent fees.",
    link: "https://wise.com/?utm_source=quickfnd", label: "Send Money with Wise" },
  { id: "s9", enabled: true, name: "Design", pattern: "qr-gen|qr-code|color-picker|color-contrast", pattern_type: "regex", priority: 90,
    title: "Make stunning visuals in minutes", badge: "Free forever plan",
    description: "Canva's free design platform — create logos, social posts, and more.",
    link: "https://www.canva.com/?utm_source=quickfnd", label: "Design with Canva Free" },
];

// ─── Matcher ──────────────────────────────────────────────────────────────────

function matchRule(slug: string, rules: AffiliateRule[]): AffiliateRule | null {
  const sorted = [...rules].sort((a, b) => a.priority - b.priority);
  for (const rule of sorted) {
    if (!rule.enabled) continue;
    try {
      if (rule.pattern_type === "slugs") {
        const slugs = rule.pattern.split(",").map((s) => s.trim().toLowerCase());
        if (slugs.includes(slug.toLowerCase())) return rule;
      } else {
        if (new RegExp(rule.pattern, "i").test(slug)) return rule;
      }
    } catch {
      // invalid regex — skip
    }
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = { slug: string };

export default function AffiliateCard({ slug }: Props) {
  const [rule, setRule] = useState<AffiliateRule | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/affiliate-config")
      .then((r) => r.json())
      .then((data: AffiliateSettings) => {
        if (!data.global_enabled) { setLoaded(true); return; }
        setRule(matchRule(slug, data.rules));
        setLoaded(true);
      })
      .catch(() => {
        // Fallback to static rules
        setRule(matchRule(slug, STATIC_RULES));
        setLoaded(true);
      });
  }, [slug]);

  if (!loaded || !rule) return null;

  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-q-muted uppercase tracking-wide">
          Sponsored recommendation
        </span>
        {rule.badge && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            {rule.badge}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <p className="font-semibold text-q-text text-sm leading-snug">{rule.title}</p>
        <p className="text-sm text-q-muted leading-relaxed">{rule.description}</p>
      </div>

      <Link
        href={rule.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1.5 rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-q-primary-hover"
      >
        {rule.label}
        <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </Link>
    </div>
  );
}