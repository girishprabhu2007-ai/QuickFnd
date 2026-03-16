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
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

  if (!value.trim()) {
    throw new Error("Supabase URL is not configured.");
  }

  return value;
}

function getSupabaseAuthKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!value.trim()) {
    throw new Error("Supabase auth key is not configured.");
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
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const supabase = createAuthClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (!isAllowedAdminEmail(data.user.email)) {
      return NextResponse.json(
        { error: "This account is not allowed to access admin." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      success: true,
      email: data.user.email,
    });

    response.cookies.set(
      ADMIN_ACCESS_COOKIE,
      data.session.access_token,
      getAdminCookieOptions()
    );

    response.cookies.set(
      ADMIN_REFRESH_COOKIE,
      data.session.refresh_token,
      getAdminCookieOptions()
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Failed to log in." },
      { status: 500 }
    );
  }
}