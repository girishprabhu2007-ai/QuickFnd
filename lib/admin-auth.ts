import { cookies } from "next/headers";
import { createClient, type User } from "@supabase/supabase-js";

export const ADMIN_ACCESS_COOKIE = "quickfnd_admin_access_token";
export const ADMIN_REFRESH_COOKIE = "quickfnd_admin_refresh_token";

function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  if (!value.trim()) {
    throw new Error("Missing Supabase URL for admin auth.");
  }

  return value;
}

function getSupabaseAuthKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!value.trim()) {
    throw new Error("Missing Supabase auth key for admin auth.");
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

export function getAdminCookieOptions(maxAge = 60 * 60 * 24 * 7) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function getAllowedAdminEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedAdminEmail(email?: string | null) {
  if (!email) return false;
  const allowed = getAllowedAdminEmails();
  return allowed.includes(email.toLowerCase());
}

async function getUserFromAccessToken(accessToken: string) {
  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

async function getUserFromRefreshToken(refreshToken: string) {
  const supabase = createAuthClient();
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getAdminUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value;

  let user: User | null = null;

  if (accessToken) {
    user = await getUserFromAccessToken(accessToken);
  }

  if (!user && refreshToken) {
    user = await getUserFromRefreshToken(refreshToken);
  }

  if (!user || !isAllowedAdminEmail(user.email)) {
    return null;
  }

  return user;
}