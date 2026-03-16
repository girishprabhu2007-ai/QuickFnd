import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedSupabase: SupabaseClient | null = null;

function getSupabaseUrl() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    "";

  if (!value.trim()) {
    throw new Error(
      "Missing Supabase URL. Add NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL."
    );
  }

  return value;
}

function getSupabaseAnonKey() {
  const value =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!value.trim()) {
    throw new Error(
      "Missing Supabase key. Add NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return value;
}

export function getSupabaseClient() {
  if (cachedSupabase) {
    return cachedSupabase;
  }

  cachedSupabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedSupabase;
}

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