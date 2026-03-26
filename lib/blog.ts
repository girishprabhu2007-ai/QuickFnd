import { createClient } from "@supabase/supabase-js";

export type BlogStatus = "draft" | "published" | "archived";
export type BlogCategory =
  | "how-to"
  | "tools-guide"
  | "calculator-guide"
  | "ai-guide"
  | "seo-guide"
  | "finance-guide"
  | "developer-guide"
  | "comparison"
  | "pillar";

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: BlogCategory;
  status: BlogStatus;
  tags: string[];
  tool_slug: string | null;
  reading_time_minutes: number;
  og_title: string | null;
  og_description: string | null;
  target_keyword: string | null;
  secondary_keywords: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
  source: "auto-pipeline" | "manual" | "gsc-opportunity";
  author_id: string | null;
};

export type BlogPostSummary = Omit<BlogPost, "content">;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function getPublishedPosts(options: {
  limit?: number;
  offset?: number;
  category?: BlogCategory;
} = {}): Promise<{ posts: BlogPostSummary[]; total: number }> {
  const supabase = getSupabase();
  const limit = options.limit ?? 12;
  const offset = options.offset ?? 0;

  let query = supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,status,tags,tool_slug,reading_time_minutes,og_title,og_description,target_keyword,secondary_keywords,published_at,created_at,updated_at,source,author_id", { count: "exact" })
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (options.category) query = query.eq("category", options.category);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { posts: (data || []) as BlogPostSummary[], total: count ?? 0 };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as BlogPost | null;
}

export async function getRelatedPosts(post: BlogPost, limit = 3): Promise<BlogPostSummary[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,status,tags,tool_slug,reading_time_minutes,og_title,og_description,target_keyword,secondary_keywords,published_at,created_at,updated_at,source,author_id")
    .eq("status", "published")
    .eq("category", post.category)
    .neq("slug", post.slug)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data || []) as BlogPostSummary[];
}

export async function getAllPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("blog_posts")
    .select("slug,updated_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return data || [];
}

// Admin functions
export async function adminGetAllPosts(options: {
  limit?: number;
  offset?: number;
  status?: BlogStatus;
} = {}): Promise<{ posts: BlogPostSummary[]; total: number }> {
  const supabase = getSupabaseAdmin();
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  let query = supabase
    .from("blog_posts")
    .select("id,slug,title,excerpt,category,status,tags,tool_slug,reading_time_minutes,og_title,og_description,target_keyword,secondary_keywords,published_at,created_at,updated_at,source,author_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (options.status) query = query.eq("status", options.status);
  const { data, count, error } = await query;
  if (error) throw new Error(error.message);
  return { posts: (data || []) as BlogPostSummary[], total: count ?? 0 };
}

export async function adminUpdatePostStatus(id: number, status: BlogStatus): Promise<void> {
  const supabase = getSupabaseAdmin();
  const update: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (status === "published") update.published_at = new Date().toISOString();
  const { error } = await supabase.from("blog_posts").update(update).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function adminDeletePost(id: number): Promise<void> {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  "how-to": "How-To Guide",
  "tools-guide": "Tools Guide",
  "calculator-guide": "Calculator Guide",
  "ai-guide": "AI Guide",
  "seo-guide": "SEO Guide",
  "finance-guide": "Finance Guide",
  "developer-guide": "Developer Guide",
  "comparison": "Comparison",
  "pillar": "Pillar Page",
};