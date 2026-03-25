/**
 * app/api/subscribe/route.ts
 * Handles email newsletter subscriptions.
 * Saves to Supabase email_subscribers table.
 * Optionally sends a welcome email via Resend if RESEND_API_KEY is set.
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
        // Re-subscribe
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
          subject: "You're subscribed to QuickFnd 🎉",
          html: `
            <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a2e;">
              <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 12px;">Welcome to QuickFnd! 👋</h1>
              <p style="color: #666; line-height: 1.6; margin-bottom: 16px;">
                You're now subscribed. We'll let you know when new tools, calculators, and AI utilities launch — 
                no spam, just useful updates.
              </p>
              <p style="color: #666; line-height: 1.6; margin-bottom: 24px;">
                In the meantime, explore what's already live:
              </p>
              <a href="https://quickfnd.com/tools" style="display: inline-block; background: #2563eb; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600; margin-bottom: 8px;">Browse Tools →</a>
              <p style="color: #999; font-size: 12px; margin-top: 32px;">
                You subscribed via quickfnd.com. 
                <a href="https://quickfnd.com/unsubscribe?email=${encodeURIComponent(email)}" style="color: #999;">Unsubscribe</a>
              </p>
            </div>
          `,
        }),
      }).catch(() => {}); // Don't fail if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscribed! We'll notify you when new tools launch.",
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : "Subscription failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}