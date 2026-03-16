import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { inferToolEngineType } from "@/lib/tool-engine-registry";

export type AdminCategory = "tool" | "calculator" | "ai-tool";

let cachedAdminClient: SupabaseClient | null = null;

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

export function getSupabaseAdmin() {
  if (cachedAdminClient) {
    return cachedAdminClient;
  }

  const url = requireEnv("SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");

  cachedAdminClient = createClient(url, serviceRoleKey);
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
    return inferToolEngineType(value);
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