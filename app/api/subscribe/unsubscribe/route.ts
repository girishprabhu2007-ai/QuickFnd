/**
 * app/api/subscribe/unsubscribe/route.ts
 * Handles one-click unsubscribe (RFC 8058) and browser-based unsubscribe.
 * POST { email } — marks subscriber as unsubscribed
 * POST with List-Unsubscribe-Post header from mail clients — same action
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let email = "";

    // Handle both JSON body and form-encoded body (mail client one-click)
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      // RFC 8058 one-click: body is "List-Unsubscribe=One-Click"
      // email must come from URL param in this case
      const { searchParams } = new URL(req.url);
      email = searchParams.get("email") || params.get("email") || "";
    } else {
      const body = await req.json() as { email?: string };
      email = String(body.email || "").trim().toLowerCase();
    }

    if (!email) {
      return NextResponse.json({ error: "Email required." }, { status: 400 });
    }

    const supabase = getSupabase();
    await supabase
      .from("email_subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", email);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unsubscribe failed." }, { status: 500 });
  }
}