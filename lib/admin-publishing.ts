import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type AdminCategory = "tool" | "calculator" | "ai-tool";

let cachedAdminClient: SupabaseClient | null = null;

function getAdminSupabaseUrl() {
  const value =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";

  if (!value.trim()) {
    throw new Error(
      "Missing Supabase URL. Add SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  return value;
}

function getAdminServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!value.trim()) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Admin routes require the service role key."
    );
  }

  return value;
}

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  cachedAdminClient = createClient(
    getAdminSupabaseUrl(),
    getAdminServiceRoleKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return cachedAdminClient;
}

export function safeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function normalizeCategory(value: unknown): AdminCategory {
  const text = String(value || "").trim().toLowerCase();
  if (text === "calculator") return "calculator";
  if (text === "ai-tool" || text === "ai tool" || text === "aitool") {
    return "ai-tool";
  }
  return "tool";
}

export function getTable(category: AdminCategory) {
  if (category === "calculator") return "calculators";
  if (category === "ai-tool") return "ai_tools";
  return "tools";
}

export function buildPublicPath(category: AdminCategory, slug: string) {
  if (category === "calculator") return `/calculators/${slug}`;
  if (category === "ai-tool") return `/ai-tools/${slug}`;
  return `/tools/${slug}`;
}

export function inferLiveEngine(category: AdminCategory, slug: string) {
  const value = safeSlug(slug);

  if (category === "tool") {
    if (value === "currency-converter") return "currency-converter";
    if (value === "password-strength-checker" || value.includes("password-strength")) {
      return "password-strength-checker";
    }
    if (
      value === "password-generator" ||
      (value.includes("password") && value.includes("generator"))
    ) {
      return "password-generator";
    }
    if (value.includes("json")) return "json-formatter";
    if (value.includes("word-counter")) return "word-counter";
    if (value.includes("uuid")) return "uuid-generator";
    if (value.includes("slug")) return "slug-generator";
    if (value.includes("random-string")) return "random-string-generator";
    if (value.includes("base64") && value.includes("decode")) return "base64-decoder";
    if (value.includes("base64")) return "base64-encoder";
    if (value.includes("url") && value.includes("decode")) return "url-decoder";
    if (value.includes("url")) return "url-encoder";
    if (value.includes("case")) return "text-case-converter";
    if (value.includes("code") && value.includes("format")) return "code-formatter";
    if (value.includes("snippet")) return "code-snippet-manager";
    if (value.includes("text") && value.includes("transform")) return "text-transformer";
    if (value.includes("number") && value.includes("generator")) return "number-generator";
    if (value.includes("converter")) return "unit-converter";
    return "generic-directory";
  }

  if (category === "calculator") {
    if (value.includes("age")) return "age-calculator";
    if (value.includes("bmi")) return "bmi-calculator";
    if (value.includes("loan")) return "loan-calculator";
    if (value.includes("emi")) return "emi-calculator";
    if (value.includes("percentage")) return "percentage-calculator";
    if (value.includes("interest")) return "simple-interest-calculator";
    if (value.includes("gst")) return "gst-calculator";
    return "generic-directory";
  }

  return "openai-text-tool";
}

export function isSupportedLiveItem(category: AdminCategory, slug: string) {
  const engine = inferLiveEngine(category, slug);

  if (category === "ai-tool") return true;
  return engine !== "generic-directory";
}

export async function findExistingBySlug(category: AdminCategory, slug: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const table = getTable(category);

  const { data, error } = await supabaseAdmin
    .from(table)
    .select("slug,name")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function ensureUniqueSlug(category: AdminCategory, baseSlug: string) {
  let slug = baseSlug;
  let counter = 2;

  while (true) {
    const exists = await findExistingBySlug(category, slug);
    if (!exists) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function getAllExistingSlugs() {
  const supabaseAdmin = getSupabaseAdmin();

  const [tools, calculators, aiTools] = await Promise.all([
    supabaseAdmin.from("tools").select("slug"),
    supabaseAdmin.from("calculators").select("slug"),
    supabaseAdmin.from("ai_tools").select("slug"),
  ]);

  if (tools.error) throw new Error(tools.error.message);
  if (calculators.error) throw new Error(calculators.error.message);
  if (aiTools.error) throw new Error(aiTools.error.message);

  return new Set([
    ...(tools.data || []).map((item) => item.slug),
    ...(calculators.data || []).map((item) => item.slug),
    ...(aiTools.data || []).map((item) => item.slug),
  ]);
}