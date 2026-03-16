import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

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
      "Supabase key is missing. Add SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
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

/**
 * Lazy proxy client.
 * This lets existing files keep using:
 *   import { supabase } from "@/lib/supabase";
 *
 * without creating the real client during build-time module import.
 */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const client = getSupabaseClient();
    const value = Reflect.get(client as object, prop, receiver);

    if (typeof value === "function") {
      return value.bind(client);
    }

    return value;
  },
});