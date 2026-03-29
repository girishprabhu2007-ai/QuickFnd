/**
 * app/api/cron/email-nurture/route.ts
 * Sends automated nurture emails to subscribers based on how they joined.
 * Day 1: Welcome + top tools for their category
 * Day 3: Related articles from the blog
 * Day 7: Weekly digest of best new articles
 *
 * Requires RESEND_API_KEY in Vercel env vars.
 * Schedule: runs daily at 9am UTC (2:30pm IST)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const SITE_URL = "https://quickfnd.com";
const FROM_EMAIL = "QuickFnd <newsletter@quickfnd.com>";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// Tool category → relevant tools for nurture emails
const CATEGORY_TOOLS: Record<string, { name: string; slug: string; desc: string }[]> = {
  "emi-calculator": [
    { name: "EMI Calculator", slug: "calculators/emi-calculator", desc: "Calculate loan EMIs instantly" },
    { name: "SIP Calculator", slug: "calculators/sip-calculator", desc: "Plan your mutual fund returns" },
    { name: "Income Tax Calculator", slug: "calculators/income-tax-calculator", desc: "Calculate your tax for 2026" },
  ],
  "json-formatter": [
    { name: "JSON Formatter", slug: "tools/json-formatter", desc: "Format and validate JSON" },
    { name: "Regex Tester", slug: "tools/regex-tester", desc: "Test regex patterns live" },
    { name: "Base64 Encoder", slug: "tools/base64-encoder", desc: "Encode/decode Base64 strings" },
  ],
  "password-generator": [
    { name: "Password Generator", slug: "tools/password-generator", desc: "Generate secure passwords" },
    { name: "SHA256 Generator", slug: "tools/sha256-generator", desc: "Generate SHA256 hashes" },
    { name: "UUID Generator", slug: "tools/uuid-generator", desc: "Generate unique IDs" },
  ],
  "default": [
    { name: "EMI Calculator", slug: "calculators/emi-calculator", desc: "Calculate loan EMIs" },
    { name: "JSON Formatter", slug: "tools/json-formatter", desc: "Format JSON instantly" },
    { name: "Password Generator", slug: "tools/password-generator", desc: "Create secure passwords" },
    { name: "GST Calculator", slug: "calculators/gst-calculator", desc: "Calculate GST amounts" },
  ],
};

function getToolsForSource(source: string) {
  for (const [key, tools] of Object.entries(CATEGORY_TOOLS)) {
    if (source.includes(key)) return tools;
  }
  return CATEGORY_TOOLS["default"];
}

function buildDay1Email(email: string, source: string): string {
  const tools = getToolsForSource(source);
  const unsub = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  const toolsHtml = tools.map(t => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <a href="${SITE_URL}/${t.slug}" style="font-weight:600;color:#2563eb;text-decoration:none;">${t.name}</a>
        <span style="color:#6b7280;font-size:13px;"> — ${t.desc}</span>
      </td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
    <div style="font-size:24px;font-weight:800;color:#fff;">Quick<span style="color:#3b82f6;">Fnd</span></div>
  </td></tr>
  <tr><td style="background:#fff;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
    <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 12px;">Welcome to QuickFnd!</h1>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px;">
      You now have access to 130+ free browser-based tools. No signup for any tool, everything runs in your browser.
    </p>
    <p style="font-weight:600;color:#0f172a;font-size:14px;margin:0 0 12px;">Here are the tools most relevant to you:</p>
    <table width="100%" cellpadding="0" cellspacing="0">${toolsHtml}</table>
    <div style="margin:28px 0 0;text-align:center;">
      <a href="${SITE_URL}" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        Explore All Tools →
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">
      <a href="${unsub}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildDay3Email(email: string, articles: {title: string; slug: string; excerpt: string}[]): string {
  const unsub = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  if (articles.length === 0) return "";

  const articlesHtml = articles.slice(0, 3).map(a => `
    <tr><td style="padding:12px 0;border-bottom:1px solid #f0f0f0;">
      <a href="${SITE_URL}/blog/${a.slug}" style="font-weight:600;color:#0f172a;text-decoration:none;font-size:15px;display:block;margin-bottom:4px;">${a.title}</a>
      <span style="color:#6b7280;font-size:13px;">${a.excerpt?.slice(0, 100) || ""}...</span>
      <a href="${SITE_URL}/blog/${a.slug}" style="color:#2563eb;font-size:13px;font-weight:500;text-decoration:none;display:block;margin-top:6px;">Read article →</a>
    </td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 36px;text-align:center;">
    <div style="font-size:24px;font-weight:800;color:#fff;">Quick<span style="color:#3b82f6;">Fnd</span></div>
  </td></tr>
  <tr><td style="background:#fff;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
    <h1 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px;">Fresh articles for you</h1>
    <p style="color:#6b7280;font-size:14px;margin:0 0 20px;">Guides and tutorials from our expert authors:</p>
    <table width="100%" cellpadding="0" cellspacing="0">${articlesHtml}</table>
    <div style="margin:24px 0 0;text-align:center;">
      <a href="${SITE_URL}/blog" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        Read All Articles →
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">
      <a href="${unsub}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

function buildWeeklyDigestEmail(email: string, articles: {title: string; slug: string; excerpt: string}[]): string {
  const unsub = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
  const articlesHtml = articles.slice(0, 5).map((a, i) => `
    <tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
      <span style="color:#9ca3af;font-size:12px;font-weight:600;">${String(i+1).padStart(2,"0")}</span>
      <a href="${SITE_URL}/blog/${a.slug}" style="font-weight:600;color:#0f172a;text-decoration:none;font-size:14px;margin-left:10px;">${a.title}</a>
    </td></tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
  <tr><td style="background:#0f172a;border-radius:12px 12px 0 0;padding:28px 36px;">
    <div style="font-size:24px;font-weight:800;color:#fff;text-align:center;">Quick<span style="color:#3b82f6;">Fnd</span></div>
    <div style="color:#94a3b8;font-size:13px;text-align:center;margin-top:6px;">Weekly Digest</div>
  </td></tr>
  <tr><td style="background:#fff;padding:36px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;border-top:none;">
    <h1 style="font-size:18px;font-weight:700;color:#0f172a;margin:0 0 6px;">This week's top articles</h1>
    <p style="color:#6b7280;font-size:13px;margin:0 0 20px;">The best guides published this week on QuickFnd:</p>
    <table width="100%" cellpadding="0" cellspacing="0">${articlesHtml}</table>
    <div style="margin:24px 0 0;text-align:center;">
      <a href="${SITE_URL}/blog" style="background:#2563eb;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;display:inline-block;">
        Read All Articles →
      </a>
    </div>
    <p style="color:#9ca3af;font-size:12px;margin:24px 0 0;text-align:center;">
      <a href="${unsub}" style="color:#9ca3af;">Unsubscribe</a>
    </p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch { return false; }
}

export async function GET(req: Request) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();
  const now = new Date();
  const results = { day1: 0, day3: 0, weekly: 0, errors: 0 };

  // Fetch recent blog articles for day3 / weekly
  const { data: articles } = await supabase
    .from("blog_posts")
    .select("slug,title,excerpt")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(10);

  // Get subscribers who need nurture emails
  const { data: subscribers } = await supabase
    .from("email_subscribers")
    .select("email, source, subscribed_at, nurture_day1_sent, nurture_day3_sent, nurture_weekly_sent")
    .eq("status", "active")
    .order("subscribed_at", { ascending: true })
    .limit(50);

  for (const sub of (subscribers || [])) {
    const subscribedAt = new Date(sub.subscribed_at);
    const daysSince = Math.floor((now.getTime() - subscribedAt.getTime()) / 86400000);

    try {
      // Day 1 email — send within first 2 days if not sent
      if (!sub.nurture_day1_sent && daysSince >= 0 && daysSince <= 2) {
        const html = buildDay1Email(sub.email, sub.source || "homepage");
        const sent = await sendEmail(sub.email, "Your QuickFnd tools are ready 🚀", html);
        if (sent) {
          await supabase.from("email_subscribers")
            .update({ nurture_day1_sent: now.toISOString() })
            .eq("email", sub.email);
          results.day1++;
        }
        await new Promise(r => setTimeout(r, 500));
        continue;
      }

      // Day 3 email — articles
      if (!sub.nurture_day3_sent && daysSince >= 3 && daysSince <= 5) {
        const html = buildDay3Email(sub.email, articles || []);
        if (html) {
          const sent = await sendEmail(sub.email, "3 articles to help you get more from QuickFnd", html);
          if (sent) {
            await supabase.from("email_subscribers")
              .update({ nurture_day3_sent: now.toISOString() })
              .eq("email", sub.email);
            results.day3++;
          }
          await new Promise(r => setTimeout(r, 500));
        }
        continue;
      }

      // Weekly digest — send every 7 days after day 7
      if (daysSince >= 7) {
        const lastWeekly = sub.nurture_weekly_sent ? new Date(sub.nurture_weekly_sent) : null;
        const daysSinceWeekly = lastWeekly
          ? Math.floor((now.getTime() - lastWeekly.getTime()) / 86400000)
          : daysSince;

        if (daysSinceWeekly >= 7 && now.getDay() === 1) { // Monday only
          const html = buildWeeklyDigestEmail(sub.email, articles || []);
          const sent = await sendEmail(sub.email, `QuickFnd Weekly: ${(articles || []).slice(0, 1)[0]?.title || "This week's best guides"}`, html);
          if (sent) {
            await supabase.from("email_subscribers")
              .update({ nurture_weekly_sent: now.toISOString() })
              .eq("email", sub.email);
            results.weekly++;
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
    } catch { results.errors++; }
  }

  // Log completion
  const totalSent = results.day1 + results.day3 + results.weekly;
  await supabase.from("cron_runs").update({
    status: results.errors > totalSent ? "failed" : "success",
    items_published: totalSent,
    error_message: results.errors > 0 ? `${results.errors} send failures` : null,
    completed_at: new Date().toISOString(),
    duration_ms: 0,
  }).eq("id", runId);

  return NextResponse.json({ success: true, ...results, timestamp: now.toISOString() });
}