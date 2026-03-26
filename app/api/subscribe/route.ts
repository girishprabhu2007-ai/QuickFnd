/**
 * app/api/subscribe/route.ts
 * Handles email newsletter subscriptions.
 * Saves to Supabase email_subscribers table.
 * Sends a beautiful branded welcome email via Resend if RESEND_API_KEY is set.
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function buildWelcomeEmail(email: string): string {
  const unsubUrl = `https://quickfnd.com/unsubscribe?email=${encodeURIComponent(email)}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Welcome to QuickFnd</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#0f0f23;border-radius:16px 16px 0 0;padding:32px 40px;text-align:center;">
              <div style="font-size:28px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;">
                Quick<span style="color:#3b82f6;">Fnd</span>
              </div>
              <div style="margin-top:6px;font-size:12px;color:#6b7280;letter-spacing:0.15em;text-transform:uppercase;">
                Free Tools · Calculators · AI Utilities
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px 40px 32px;">
              <div style="font-size:22px;font-weight:700;color:#0f0f23;margin-bottom:12px;">
                You&#39;re in! 🎉
              </div>
              <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 20px;">
                Thanks for subscribing to QuickFnd. You&#39;ll get a short email
                when new tools, calculators, and AI utilities go live — max once a week,
                no spam, straight to the point.
              </p>

              <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin:24px 0;">
                <div style="font-size:13px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;">
                  What&#39;s live right now
                </div>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="33%" style="text-align:center;padding:8px 0;">
                      <div style="font-size:22px;font-weight:800;color:#3b82f6;">62+</div>
                      <div style="font-size:12px;color:#6b7280;margin-top:2px;">Dev Tools</div>
                    </td>
                    <td width="33%" style="text-align:center;padding:8px 0;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                      <div style="font-size:22px;font-weight:800;color:#8b5cf6;">49+</div>
                      <div style="font-size:12px;color:#6b7280;margin-top:2px;">Calculators</div>
                    </td>
                    <td width="33%" style="text-align:center;padding:8px 0;">
                      <div style="font-size:22px;font-weight:800;color:#10b981;">21+</div>
                      <div style="font-size:12px;color:#6b7280;margin-top:2px;">AI Tools</div>
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color:#4b5563;font-size:15px;line-height:1.7;margin:0 0 28px;">
                Everything runs directly in your browser — no install, no account, no paywall.
              </p>

              <!-- CTA buttons -->
              <table cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding-bottom:10px;">
                    <a href="https://quickfnd.com/tools"
                      style="display:block;background:#3b82f6;color:#ffffff;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:600;font-size:14px;">
                      Browse Developer Tools →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:10px;">
                    <a href="https://quickfnd.com/calculators"
                      style="display:block;background:#f8f9fa;border:1px solid #e5e7eb;color:#374151;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:600;font-size:14px;">
                      Try the Calculators →
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="https://quickfnd.com/ai-tools"
                      style="display:block;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;text-decoration:none;text-align:center;padding:14px 24px;border-radius:12px;font-weight:600;font-size:14px;">
                      ✦ Explore AI Tools →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:12px;margin:0 0 6px;">
                You subscribed at <a href="https://quickfnd.com" style="color:#3b82f6;text-decoration:none;">quickfnd.com</a>
              </p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">
                <a href="${unsubUrl}" style="color:#9ca3af;">Unsubscribe</a>
                &nbsp;·&nbsp; No spam, ever.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as { email?: string; source?: string };
    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "homepage").slice(0, 50);

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    const supabase = getSupabase();

    // Check for duplicate
    const { data: existing } = await supabase
      .from("email_subscribers")
      .select("id, status")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      if (existing.status === "unsubscribed") {
        await supabase
          .from("email_subscribers")
          .update({ status: "active", resubscribed_at: new Date().toISOString() })
          .eq("email", email);
        return NextResponse.json({ success: true, message: "You're back! We'll keep you updated." });
      }
      return NextResponse.json({ success: true, message: "You're already subscribed!" });
    }

    // Save subscriber
    const { error } = await supabase.from("email_subscribers").insert({
      email,
      source,
      status: "active",
      subscribed_at: new Date().toISOString(),
    });

    if (error) throw new Error(error.message);

    // Send welcome email via Resend if API key is set
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "QuickFnd <hello@quickfnd.com>",
          to: [email],
          subject: "Welcome to QuickFnd — you're in! 🎉",
          html: buildWelcomeEmail(email),
        }),
      }).catch(() => {}); // Don't fail subscription if email sending fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed! Check your inbox for a welcome email.",
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscription failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}