import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  ADMIN_ACCESS_COOKIE,
  ADMIN_REFRESH_COOKIE,
  getAdminCookieOptions,
  isAllowedAdminEmail,
} from "@/lib/admin-auth";

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
        { error: "Recovery session is invalid or expired." },
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
      { error: "Failed to update password." },
      { status: 500 }
    );
  }
}