import { supabase } from "./supabase";
import {
  getStaticItem,
  getStaticItems,
  type PublicContentItem,
  type PublicTable,
} from "./content-pages";
import {
  normalizeEngineConfig,
  type EngineType,
} from "./engine-metadata";

function normalizeItem(item: Record<string, unknown>): PublicContentItem {
  return {
    ...(item as PublicContentItem),
    id: typeof item.id === "number" ? item.id : undefined,
    name: String(item.name || ""),
    slug: String(item.slug || ""),
    description: String(item.description || ""),
    related_slugs: Array.isArray(item.related_slugs)
      ? item.related_slugs.map((value) => String(value))
      : [],
    engine_type: (item.engine_type as EngineType | null | undefined) ?? null,
    engine_config: normalizeEngineConfig(item.engine_config),
    created_at: typeof item.created_at === "string" ? item.created_at : null,
  };
}

function normalize(value: string | null | undefined) {
  return String(value || "").trim().toLowerCase();
}

const GENERIC_TASK_VALUES = new Set([
  "",
  "text-generation",
  "general",
  "default",
]);

function isGenericAITool(item: PublicContentItem) {
  if (!item.engine_config) return true;

  const config = item.engine_config as Record<string, unknown>;
  const task = normalize(config.task as string);

  return GENERIC_TASK_VALUES.has(task);
}

function mergeItemWithStatic(
  table: PublicTable,
  dbItem: PublicContentItem
): PublicContentItem {
  if (table !== "ai_tools") return dbItem;

  const staticItem = getStaticItem(table, dbItem.slug);
  if (!staticItem) return dbItem;

  // 🔥 CRITICAL LOGIC
  if (isGenericAITool(dbItem)) {
    return {
      ...dbItem,
      engine_type: staticItem.engine_type,
      engine_config: staticItem.engine_config,
    };
  }

  return dbItem;
}

function uniqueBySlug(items: PublicContentItem[]) {
  const seen = new Set<string>();
  const output: PublicContentItem[] = [];

  for (const item of items) {
    const slug = String(item.slug || "").trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    output.push(item);
  }

  return output;
}

function mergeWithStaticItems(
  table: PublicTable,
  dbItems: PublicContentItem[]
): PublicContentItem[] {
  const staticItems = getStaticItems(table);

  const mergedDb = dbItems.map((item) =>
    mergeItemWithStatic(table, item)
  );

  return uniqueBySlug([...mergedDb, ...staticItems]);
}

async function safeSelectAll(table: PublicTable) {
  try {
    const result = await supabase.from(table).select("*").order("id", {
      ascending: false,
    });

    return result;
  } catch (error) {
    console.error(`safeSelectAll(${table}) unexpected error:`, error);
    return {
      data: null,
      error,
    };
  }
}

async function safeSelectBySlug(table: PublicTable, slug: string) {
  try {
    const result = await supabase
      .from(table)
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    return result;
  } catch (error) {
    console.error(`safeSelectBySlug(${table}, ${slug}) unexpected error:`, error);
    return {
      data: null,
      error,
    };
  }
}

export async function getContentItems(
  table: PublicTable
): Promise<PublicContentItem[]> {
  const { data, error } = await safeSelectAll(table);

  if (error) {
    console.error(`getContentItems(${table}) error:`, error);
    return getStaticItems(table);
  }

  const items = Array.isArray(data)
    ? data.map((item) => normalizeItem(item as Record<string, unknown>))
    : [];

  return mergeWithStaticItems(table, items);
}

export async function getContentItem(
  table: PublicTable,
  slug: string
): Promise<PublicContentItem | null> {
  const { data, error } = await safeSelectBySlug(table, slug);

  if (!error && data) {
    return mergeItemWithStatic(
      table,
      normalizeItem(data as Record<string, unknown>)
    );
  }

  if (error && (error as { code?: string }).code !== "PGRST116") {
    console.error(`getContentItem(${table}, ${slug}) error:`, error);
  }

  return getStaticItem(table, slug);
}

export async function getRelatedContent(
  table: PublicTable,
  relatedSlugs: string[],
  excludeSlug?: string
): Promise<PublicContentItem[]> {
  const cleaned = Array.from(
    new Set(
      relatedSlugs
        .map((slug) => String(slug || "").trim())
        .filter(Boolean)
        .filter((slug) => slug !== excludeSlug)
    )
  );

  if (cleaned.length === 0) {
    return [];
  }

  let data: unknown[] | null = null;
  let error: unknown = null;

  try {
    const result = await supabase.from(table).select("*").in("slug", cleaned);
    data = result.data;
    error = result.error;
  } catch (caught) {
    error = caught;
  }

  if (error) {
    console.error(`getRelatedContent(${table}) error:`, error);
  }

  const dbItems = Array.isArray(data)
    ? data.map((item) => normalizeItem(item as Record<string, unknown>))
    : [];

  const found = new Map(
    dbItems.map((item) => [item.slug, mergeItemWithStatic(table, item)])
  );

  const ordered: PublicContentItem[] = [];

  for (const slug of cleaned) {
    const dbItem = found.get(slug);
    if (dbItem) {
      ordered.push(dbItem);
      continue;
    }

    const staticItem = getStaticItem(table, slug);
    if (staticItem) {
      ordered.push(staticItem);
    }
  }

  return ordered;
}

export async function getAllContentSlugs(
  table: PublicTable
): Promise<string[]> {
  try {
    const { data, error } = await supabase.from(table).select("slug");

    const dbSlugs =
      error || !data
        ? []
        : data
            .map((item) => String((item as { slug?: string }).slug || "").trim())
            .filter(Boolean);

    const staticSlugs = getStaticItems(table).map((item) => item.slug);

    return Array.from(new Set([...dbSlugs, ...staticSlugs]));
  } catch (error) {
    console.error(`getAllContentSlugs(${table}) unexpected error:`, error);
    return getStaticItems(table).map((item) => item.slug);
  }
}

export async function getAllContentForSitemap() {
  const [tools, calculators, aiTools] = await Promise.all([
    getContentItems("tools"),
    getContentItems("calculators"),
    getContentItems("ai_tools"),
  ]);

  return {
    tools,
    calculators,
    aiTools,
  };
}

export async function getTools() {
  return getContentItems("tools");
}

export async function getTool(slug: string) {
  return getContentItem("tools", slug);
}

export async function getCalculators() {
  return getContentItems("calculators");
}

export async function getCalculator(slug: string) {
  return getContentItem("calculators", slug);
}

export async function getAITools() {
  return getContentItems("ai_tools");
}

export async function getAITool(slug: string) {
  return getContentItem("ai_tools", slug);
}