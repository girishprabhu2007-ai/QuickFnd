import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";

  if (!value.trim()) {
    throw new Error(
      "Supabase URL is missing. Add SUPABASE_URL in Vercel environment variables."
    );
  }

  return value;
}

function getSupabaseKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!value.trim()) {
    throw new Error(
      "Supabase key is missing. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
    );
  }

  return value;
}

export function getSupabaseClient() {
  if (cachedSupabase) {
    return cachedSupabase;
  }

  cachedSupabase = createClient(getSupabaseUrl(), getSupabaseKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabase;
}

export const supabase = getSupabaseClient();