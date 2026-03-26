import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthorById } from "@/lib/authors";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Seeds fake likes on a blog post.
 * Called automatically after first post by an author, or manually from admin.
 * Amount is proportional to author's seed_likes (first post = 15-35% of total).
 */
export async function POST(req: Request) {
  try {
    const { post_slug, author_id, override_count } = await req.json() as {
      post_slug: string;
      author_id: string;
      override_count?: number;
    };

    const author = getAuthorById(author_id);
    if (!author) return NextResponse.json({ error: "Author not found" }, { status: 404 });

    const supabase = getSupabase();

    // Calculate seed likes for this post
    let seedLikes: number;
    if (override_count !== undefined) {
      seedLikes = override_count;
    } else {
      // First post gets 15-35% of author's total seed likes, randomly
      const pct = 0.15 + Math.random() * 0.20;
      // Add jitter so it doesn't look algorithmic
      const jitter = Math.floor(Math.random() * 80) - 40;
      seedLikes = Math.round(author.seed_likes * pct) + jitter;
      seedLikes = Math.max(200, Math.min(seedLikes, 3000));
    }

    // Set the likes_count on the post
    const { error } = await supabase
      .from("blog_posts")
      .update({ likes_count: seedLikes })
      .eq("slug", post_slug);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, post_slug, seed_likes: seedLikes });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}