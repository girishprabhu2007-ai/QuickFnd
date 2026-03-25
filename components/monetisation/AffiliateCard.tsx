/**
 * components/monetisation/AffiliateCard.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Contextual affiliate recommendation card shown on tool/calculator/ai-tool pages.
 *
 * Two data sources (first match wins):
 *  1. DB — seo_content.affiliate_link + affiliate_label (set per-slug in admin)
 *  2. STATIC_AFFILIATES — hardcoded slug→affiliate map, instant, no DB needed
 *
 * Design: non-intrusive, clearly labelled "Sponsored recommendation",
 * fits the site's dark card aesthetic.
 */

import Link from "next/link";

export type AffiliateData = {
  link: string;
  label: string;        // CTA button text e.g. "Try Bitwarden Free"
  title: string;        // Headline e.g. "Store your passwords securely"
  description: string;  // 1 sentence why this is relevant to the tool
  badge?: string;       // Optional badge e.g. "Free plan available"
};

// ─── Static affiliate map ─────────────────────────────────────────────────────
// Covers the high-value placements from the monetisation roadmap.
// Slug patterns: if the tool slug includes the key, the affiliate fires.
// Add more here as new affiliate deals are set up.

const SLUG_AFFILIATE_MAP: { pattern: RegExp; data: AffiliateData }[] = [
  // Password tools → Bitwarden
  {
    pattern: /password/i,
    data: {
      link: "https://bitwarden.com/?utm_source=quickfnd",
      label: "Try Bitwarden Free",
      title: "Never forget a password again",
      description: "Bitwarden is a free, open-source password manager trusted by millions — store all your passwords securely in one place.",
      badge: "Free forever plan",
    },
  },

  // Security / hash tools → NordVPN
  {
    pattern: /sha256|md5|hash|encrypt/i,
    data: {
      link: "https://nordvpn.com/?utm_source=quickfnd",
      label: "Get NordVPN",
      title: "Protect your online privacy",
      description: "NordVPN encrypts your connection and keeps your data private — essential for anyone working with sensitive data.",
      badge: "67% off today",
    },
  },

  // SIP / FD / PPF / investment calculators → Zerodha
  {
    pattern: /sip|fd-calc|ppf|mutual.fund|investment/i,
    data: {
      link: "https://zerodha.com/?utm_source=quickfnd",
      label: "Open a Free Demat Account",
      title: "Start investing with Zerodha",
      description: "India's largest stockbroker — zero brokerage on equity delivery, ₹0 account opening fee, and a powerful investment platform.",
      badge: "₹0 account opening",
    },
  },

  // EMI / loan / mortgage calculators → BankBazaar
  {
    pattern: /emi|loan|mortgage|home.loan|personal.loan/i,
    data: {
      link: "https://www.bankbazaar.com/?utm_source=quickfnd",
      label: "Compare Loan Rates",
      title: "Find the best loan rates in India",
      description: "BankBazaar lets you compare EMI rates from 50+ banks instantly — get pre-approved offers without affecting your credit score.",
      badge: "Free credit score check",
    },
  },

  // GST / income tax / HRA / tax calculators → ClearTax
  {
    pattern: /gst|income.tax|hra|tax.calc/i,
    data: {
      link: "https://cleartax.in/?utm_source=quickfnd",
      label: "File ITR Free with ClearTax",
      title: "File your taxes in minutes",
      description: "ClearTax is India's most trusted tax filing platform — file ITR, claim all deductions, and get expert support if needed.",
      badge: "Free basic filing",
    },
  },

  // SEO tools → Ahrefs
  {
    pattern: /seo|keyword|backlink|rank/i,
    data: {
      link: "https://ahrefs.com/?utm_source=quickfnd",
      label: "Try Ahrefs",
      title: "Take your SEO to the next level",
      description: "Ahrefs is the industry's most trusted SEO toolkit — keyword research, backlink analysis, site audits, and competitor intelligence.",
      badge: "7-day trial for $7",
    },
  },

  // AI writing / content tools → Jasper
  {
    pattern: /ai.writ|blog|content.gen|copy|headline|email.writ/i,
    data: {
      link: "https://www.jasper.ai/?utm_source=quickfnd",
      label: "Try Jasper AI",
      title: "Scale your content with AI",
      description: "Jasper writes long-form blog posts, ad copy, emails, and more in your brand voice — trained on 10+ billion words of high-quality content.",
      badge: "7-day free trial",
    },
  },

  // Currency / forex tools → Wise
  {
    pattern: /currency|forex|exchange.rate|money.transfer/i,
    data: {
      link: "https://wise.com/?utm_source=quickfnd",
      label: "Send Money with Wise",
      title: "Save on international transfers",
      description: "Wise uses the real mid-market exchange rate with low transparent fees — send money abroad up to 8x cheaper than banks.",
      badge: "First transfer free",
    },
  },

  // QR code → Canva
  {
    pattern: /qr.gen|qr.code/i,
    data: {
      link: "https://www.canva.com/?utm_source=quickfnd",
      label: "Design with Canva Free",
      title: "Make stunning visuals in minutes",
      description: "Canva's free design platform lets you create logos, social posts, flyers, and branded QR code designs with zero design skills needed.",
      badge: "Free forever plan",
    },
  },
];

// ─── Resolver ─────────────────────────────────────────────────────────────────

export function resolveAffiliate(
  slug: string,
  dbLink?: string | null,
  dbLabel?: string | null
): AffiliateData | null {
  // DB entry takes priority — allows per-tool overrides from admin
  if (dbLink && dbLabel) {
    return {
      link: dbLink,
      label: dbLabel,
      title: "Recommended tool",
      description: "A hand-picked recommendation relevant to this tool.",
    };
  }

  // Fall back to static map
  for (const { pattern, data } of SLUG_AFFILIATE_MAP) {
    if (pattern.test(slug)) return data;
  }

  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Props = {
  slug: string;
  dbLink?: string | null;
  dbLabel?: string | null;
};

export default function AffiliateCard({ slug, dbLink, dbLabel }: Props) {
  const affiliate = resolveAffiliate(slug, dbLink, dbLabel);
  if (!affiliate) return null;

  return (
    <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-q-muted uppercase tracking-wide">
          Sponsored recommendation
        </span>
        {affiliate.badge && (
          <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
            {affiliate.badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="space-y-1">
        <p className="font-semibold text-q-text text-sm leading-snug">
          {affiliate.title}
        </p>
        <p className="text-sm text-q-muted leading-relaxed">
          {affiliate.description}
        </p>
      </div>

      {/* CTA */}
      <Link
        href={affiliate.link}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="inline-flex items-center gap-1.5 rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-q-primary-hover"
      >
        {affiliate.label}
        <svg className="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </Link>
    </div>
  );
}