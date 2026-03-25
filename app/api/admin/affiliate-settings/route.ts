/**
 * app/api/admin/affiliate-settings/route.ts
 * Full CRUD for affiliate rules stored in site_settings table.
 * key = 'affiliate_settings'
 * value = { rules: AffiliateRule[], global_enabled: boolean }
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export type AffiliateRule = {
  id: string;           // unique id e.g. "rule_password_bitwarden"
  enabled: boolean;
  name: string;         // display name e.g. "Password tools → Bitwarden"
  pattern: string;      // slug pattern — comma-separated exact slugs OR regex string
  pattern_type: "slugs" | "regex";  // how to match
  title: string;        // card headline
  description: string;  // card body text
  link: string;         // affiliate URL
  label: string;        // CTA button text
  badge: string;        // optional badge e.g. "Free forever plan"
  priority: number;     // lower = matched first when multiple rules match
};

export type AffiliateSettings = {
  global_enabled: boolean;
  rules: AffiliateRule[];
};

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  global_enabled: true,
  rules: [
    {
      id: "rule_password_bitwarden",
      enabled: true,
      name: "Password tools → Bitwarden",
      pattern: "password",
      pattern_type: "regex",
      title: "Never forget a password again",
      description: "Bitwarden is a free, open-source password manager trusted by millions — store all your passwords securely in one place.",
      link: "https://bitwarden.com/?utm_source=quickfnd",
      label: "Try Bitwarden Free",
      badge: "Free forever plan",
      priority: 10,
    },
    {
      id: "rule_security_nordvpn",
      enabled: true,
      name: "Security/hash tools → NordVPN",
      pattern: "sha256|md5|hash|encrypt",
      pattern_type: "regex",
      title: "Protect your online privacy",
      description: "NordVPN encrypts your connection and keeps your data private — essential for anyone working with sensitive data.",
      link: "https://nordvpn.com/?utm_source=quickfnd",
      label: "Get NordVPN",
      badge: "67% off today",
      priority: 20,
    },
    {
      id: "rule_investment_zerodha",
      enabled: true,
      name: "Investment calculators → Zerodha",
      pattern: "sip|fd-calc|ppf|mutual-fund|investment",
      pattern_type: "regex",
      title: "Start investing with Zerodha",
      description: "India's largest stockbroker — zero brokerage on equity delivery, ₹0 account opening fee, and a powerful investment platform.",
      link: "https://zerodha.com/?utm_source=quickfnd",
      label: "Open a Free Demat Account",
      badge: "₹0 account opening",
      priority: 30,
    },
    {
      id: "rule_loan_bankbazaar",
      enabled: true,
      name: "Loan/EMI calculators → BankBazaar",
      pattern: "emi|loan|mortgage|home-loan|personal-loan",
      pattern_type: "regex",
      title: "Find the best loan rates in India",
      description: "BankBazaar lets you compare EMI rates from 50+ banks instantly — get pre-approved offers without affecting your credit score.",
      link: "https://www.bankbazaar.com/?utm_source=quickfnd",
      label: "Compare Loan Rates",
      badge: "Free credit score check",
      priority: 40,
    },
    {
      id: "rule_tax_cleartax",
      enabled: true,
      name: "Tax calculators → ClearTax",
      pattern: "gst|income-tax|hra|tax-calc",
      pattern_type: "regex",
      title: "File your taxes in minutes",
      description: "ClearTax is India's most trusted tax filing platform — file ITR, claim all deductions, and get expert support if needed.",
      link: "https://cleartax.in/?utm_source=quickfnd",
      label: "File ITR Free with ClearTax",
      badge: "Free basic filing",
      priority: 50,
    },
    {
      id: "rule_seo_ahrefs",
      enabled: true,
      name: "SEO tools → Ahrefs",
      pattern: "seo|keyword|backlink|rank",
      pattern_type: "regex",
      title: "Take your SEO to the next level",
      description: "Ahrefs is the industry's most trusted SEO toolkit — keyword research, backlink analysis, site audits, and competitor intelligence.",
      link: "https://ahrefs.com/?utm_source=quickfnd",
      label: "Try Ahrefs",
      badge: "7-day trial for $7",
      priority: 60,
    },
    {
      id: "rule_ai_writing_jasper",
      enabled: true,
      name: "AI writing tools → Jasper",
      pattern: "ai-writ|blog|content-gen|copy|headline|email-writ",
      pattern_type: "regex",
      title: "Scale your content with AI",
      description: "Jasper writes long-form blog posts, ad copy, emails, and more in your brand voice — trained on 10+ billion words of high-quality content.",
      link: "https://www.jasper.ai/?utm_source=quickfnd",
      label: "Try Jasper AI",
      badge: "7-day free trial",
      priority: 70,
    },
    {
      id: "rule_currency_wise",
      enabled: true,
      name: "Currency tools → Wise",
      pattern: "currency|forex|exchange-rate|money-transfer",
      pattern_type: "regex",
      title: "Save on international transfers",
      description: "Wise uses the real mid-market exchange rate with low transparent fees — send money abroad up to 8x cheaper than banks.",
      link: "https://wise.com/?utm_source=quickfnd",
      label: "Send Money with Wise",
      badge: "First transfer free",
      priority: 80,
    },
    {
      id: "rule_qr_canva",
      enabled: true,
      name: "QR/design tools → Canva",
      pattern: "qr-gen|qr-code|color-picker|color-contrast",
      pattern_type: "regex",
      title: "Make stunning visuals in minutes",
      description: "Canva's free design platform lets you create logos, social posts, flyers, and branded designs with zero design skills needed.",
      link: "https://www.canva.com/?utm_source=quickfnd",
      label: "Design with Canva Free",
      badge: "Free forever plan",
      priority: 90,
    },
  ],
};

export async function GET() {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "affiliate_settings")
      .maybeSingle();

    return NextResponse.json({ settings: data?.value ?? DEFAULT_AFFILIATE_SETTINGS });
  } catch {
    return NextResponse.json({ settings: DEFAULT_AFFILIATE_SETTINGS });
  }
}

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await req.json() as AffiliateSettings;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("site_settings")
      .upsert({ key: "affiliate_settings", value: body }, { onConflict: "key" });

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Affiliate settings saved." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save." },
      { status: 500 }
    );
  }
}