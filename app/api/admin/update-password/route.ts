import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  getAdminCookieOptions,
  isAllowedAdminEmail,
} from "@/lib/admin-auth";

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
    const { access_token, refresh_token, password } = await req.json();

    const accessToken = String(access_token || "").trim();
    const refreshToken = String(refresh_token || "").trim();
    const nextPassword = String(password || "");

    if (!accessToken || !refreshToken) {
      return NextResponse.json(
        { error: "Invalid or expired recovery session." },
        { status: 400 }
      );
    }

    if (nextPassword.length < 12) {
      return NextResponse.json(
        { error: "Password must be at least 12 characters long." },
        { status: 400 }
      );
    }

    const supabase = createAuthClient();

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError || !sessionData.user) {
      return NextResponse.json(
        {
          error:
            sessionError?.message || "Recovery session is invalid or expired.",
        },
        { status: 401 }
      );
    }

    if (!isAllowedAdminEmail(sessionData.user.email)) {
      return NextResponse.json(
        { error: "This account is not allowed to access admin." },
        { status: 403 }
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: nextPassword,
    });

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set(
      ADMIN_ACCESS_COOKIE,
      sessionData.session?.access_token || accessToken,
      getAdminCookieOptions()
    );

    response.cookies.set(
      ADMIN_REFRESH_COOKIE,
      sessionData.session?.refresh_token || refreshToken,
      getAdminCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update password.",
      },
      { status: 500 }
    );
  }
}