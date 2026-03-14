import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAllowedAdminEmail } from "@/lib/admin-auth";

function createAuthClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = String(email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!isAllowedAdminEmail(normalizedEmail)) {
      return NextResponse.json({
        success: true,
        message: "If the email is allowed, a reset link has been sent.",
      });
    }

    const supabase = createAuthClient();
    const origin = new URL(req.url).origin;

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}/admin/reset-password`,
    });

    if (error) {
      console.error("Password reset request error:", error);
      return NextResponse.json(
        { error: "Failed to send reset email." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If the email is allowed, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset request error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email." },
      { status: 500 }
    );
  }
}