import { supabase } from "./supabase";

export async function getTools() {
  const { data, error } = await supabase.from("tools").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getTool(slug: string) {
  const { data, error } = await supabase
    .from("tools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getCalculators() {
  const { data, error } = await supabase.from("calculators").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getCalculator(slug: string) {
  const { data, error } = await supabase
    .from("calculators")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}

export async function getAITools() {
  const { data, error } = await supabase.from("ai_tools").select("*");

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}

export async function getAITool(slug: string) {
  const { data, error } = await supabase
    .from("ai_tools")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error);
    return null;
  }

  return data;
}