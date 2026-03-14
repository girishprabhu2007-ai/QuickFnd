import { supabase } from "./supabase";

export type ContentItem = {
  id?: number;
  name: string;
  slug: string;
  description: string;
  related_slugs?: string[] | null;
};

function normalizeItems(items: ContentItem[] | null) {
  if (!items) return [];

  return items.map((item) => ({
    ...item,
    related_slugs: Array.isArray(item.related_slugs) ? item.related_slugs : [],
  }));
}

export async function getTools() {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("getTools error:", error);
    return [];
  }

  return normalizeItems(data);
}

export async function getTool(slug: string) {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getTool error:", error);
    return null;
  }

  return {
    ...data,
    related_slugs: Array.isArray(data.related_slugs) ? data.related_slugs : [],
  };
}

export async function getCalculators() {
  const { data, error } = await supabase
    .from("calculators")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("getCalculators error:", error);
    return [];
  }

  return normalizeItems(data);
}

export async function getCalculator(slug: string) {
  const { data, error } = await supabase
    .from("calculators")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getCalculator error:", error);
    return null;
  }

  return {
    ...data,
    related_slugs: Array.isArray(data.related_slugs) ? data.related_slugs : [],
  };
}

export async function getAITools() {
  const { data, error } = await supabase
    .from("ai_tools")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    console.error("getAITools error:", error);
    return [];
  }

  return normalizeItems(data);
}

export async function getAITool(slug: string) {
  const { data, error } = await supabase
    .from("ai_tools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("getAITool error:", error);
    return null;
  }

  return {
    ...data,
    related_slugs: Array.isArray(data.related_slugs) ? data.related_slugs : [],
  };
}