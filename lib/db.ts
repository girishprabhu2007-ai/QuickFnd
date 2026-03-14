import { supabase } from "./supabase";
import {
  getStaticItem,
  getStaticItems,
  type PublicContentItem,
  type PublicTable,
} from "./content-pages";

function normalizeItem(item: any): PublicContentItem {
  return {
    id: item.id,
    name: String(item.name || ""),
    slug: String(item.slug || ""),
    description: String(item.description || ""),
    related_slugs: Array.isArray(item.related_slugs) ? item.related_slugs : [],
    created_at: item.created_at || null,
  };
}

function mergeWithStaticItems(
  table: PublicTable,
  dbItems: PublicContentItem[]
): PublicContentItem[] {
  const seen = new Set(dbItems.map((item) => item.slug));
  const staticItems = getStaticItems(table).filter((item) => !seen.has(item.slug));
  return [...dbItems, ...staticItems];
}

export async function getContentItems(table: PublicTable): Promise<PublicContentItem[]> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error(`getContentItems(${table}) error:`, error);
    return getStaticItems(table);
  }

  return mergeWithStaticItems(table, (data || []).map(normalizeItem));
}

export async function getContentItem(
  table: PublicTable,
  slug: string
): Promise<PublicContentItem | null> {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!error && data) {
    return normalizeItem(data);
  }

  if (error && error.code !== "PGRST116") {
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

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .in("slug", cleaned);

  const dbItems = !error && data ? data.map(normalizeItem) : [];
  const found = new Map(dbItems.map((item) => [item.slug, item]));
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

export async function getAllContentSlugs(table: PublicTable): Promise<string[]> {
  const { data, error } = await supabase.from(table).select("slug");

  const dbSlugs =
    error || !data
      ? []
      : data
          .map((item: any) => String(item.slug || "").trim())
          .filter(Boolean);

  const staticSlugs = getStaticItems(table).map((item) => item.slug);

  return Array.from(new Set([...dbSlugs, ...staticSlugs]));
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