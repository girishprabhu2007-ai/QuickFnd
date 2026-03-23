import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isAllowedAdminEmail } from "@/lib/admin-auth";

function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  if (!value.trim()) {
    throw new Error("Missing Supabase URL.");
  }

  return value;
}

function getSupabaseAuthKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!value.trim()) {
    throw new Error("Missing Supabase auth key.");
  }

  return value;
}

function createAuthClient() {
  return createClient(getSupabaseUrl(), getSupabaseAuthKey(), {
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
      return NextResponse.json(
        { error: error.message || "Failed to send reset email." },
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
      {
        error:
          error instanceof Error ? error.message : "Failed to send reset email.",
      },
      { status: 500 }
    );
  }
}