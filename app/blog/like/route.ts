import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const { post_slug, action } = await req.json() as { post_slug: string; action: "like" | "unlike" };
    if (!post_slug) return NextResponse.json({ error: "post_slug required" }, { status: 400 });

    const supabase = getSupabase();

    if (action === "unlike") {
      await supabase.rpc("decrement_blog_likes", { slug_param: post_slug });
    } else {
      await supabase.rpc("increment_blog_likes", { slug_param: post_slug });
    }

    const { data } = await supabase
      .from("blog_posts")
      .select("likes_count")
      .eq("slug", post_slug)
      .single();

    return NextResponse.json({ success: true, likes_count: data?.likes_count ?? 0 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}