import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";
import { AUTHORS } from "@/lib/authors";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET — fetch all authors with their stats from DB
export async function GET() {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getSupabase();

    // Fetch author_stats — graceful fallback if table doesn't exist yet
    type AuthorStat = { author_id: string; fake_likes: number; fake_likes_active: boolean; avatar_url_override?: string };
    let statsMap = new Map<string, AuthorStat>();
    try {
      const { data: stats } = await supabase.from("author_stats").select("*");
      statsMap = new Map<string, AuthorStat>((stats || []).map((s: AuthorStat) => [s.author_id, s]));
    } catch { /* table may not exist yet — use defaults */ }

    // Fetch post counts and total real likes per author
    let postData: { author_id: string | null; likes_count: number | null }[] = [];
    try {
      const { data } = await supabase
        .from("blog_posts")
        .select("author_id, likes_count")
        .eq("status", "published");
      postData = data || [];
    } catch { /* graceful fallback */ }

    const postStats: Record<string, { post_count: number; real_likes: number }> = {};
    for (const post of postData) {
      if (!post.author_id) continue;
      if (!postStats[post.author_id]) postStats[post.author_id] = { post_count: 0, real_likes: 0 };
      postStats[post.author_id].post_count++;
      postStats[post.author_id].real_likes += post.likes_count || 0;
    }

    const result = AUTHORS.map(author => {
      const stat = statsMap.get(author.id);
      const posts = postStats[author.id] || { post_count: 0, real_likes: 0 };
      // Use uploaded photo if available, otherwise fall back to SVG avatar
      const displayAvatar = stat?.avatar_url_override || author.avatar_url;
      return {
        id: author.id,
        name: author.name,
        slug: author.slug,
        title: author.title,
        avatar_url: displayAvatar,
        avatar_color: author.avatar_color,
        avatar_text_color: author.avatar_text_color,
        avatar_initials: author.avatar_initials,
        location: author.location,
        seed_likes: author.seed_likes,
        post_count: posts.post_count,
        real_likes_from_posts: posts.real_likes,
        fake_likes: stat?.fake_likes ?? author.seed_likes,
        fake_likes_active: stat?.fake_likes_active ?? true,
        total_displayed_likes: stat?.fake_likes_active !== false
          ? (stat?.fake_likes ?? author.seed_likes) + posts.real_likes
          : posts.real_likes,
        initialized: !!stat,
      };
    });

    return NextResponse.json({ success: true, authors: result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load authors" },
      { status: 500 }
    );
  }
}

// POST — initialize author stats (seed likes)
export async function POST(req: Request) {
  try {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { author_id } = await req.json() as { author_id?: string };
  const supabase = getSupabase();

  const toInit = author_id
    ? AUTHORS.filter(a => a.id === author_id)
    : AUTHORS;

  const results = [];
  for (const author of toInit) {
    const { error } = await supabase
      .from("author_stats")
      .upsert({
        author_id: author.id,
        fake_likes: author.seed_likes,
        fake_likes_active: true,
        initialized_at: new Date().toISOString(),
      }, { onConflict: "author_id" });

    results.push({ author_id: author.id, name: author.name, seed_likes: author.seed_likes, error: error?.message });
  }

  return NextResponse.json({ success: true, initialized: results.filter(r => !r.error).length, results });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

// PATCH — toggle fake likes on/off per author, or set custom fake_likes amount
export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as {
    author_id: string;
    fake_likes_active?: boolean;
    fake_likes?: number;
  };

  if (!body.author_id) return NextResponse.json({ error: "author_id required" }, { status: 400 });

  const supabase = getSupabase();
  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (typeof body.fake_likes_active === "boolean") update.fake_likes_active = body.fake_likes_active;
  if (typeof body.fake_likes === "number") update.fake_likes = body.fake_likes;

  const { error } = await supabase
    .from("author_stats")
    .upsert({ author_id: body.author_id, ...update }, { onConflict: "author_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — remove ALL fake likes for one or all authors (when site has real traction)
export async function DELETE(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const author_id = url.searchParams.get("author_id");
  const supabase = getSupabase();

  if (author_id) {
    // Remove fake likes for one author
    await supabase.from("author_stats")
      .update({ fake_likes: 0, fake_likes_active: false, fake_likes_removed_at: new Date().toISOString() })
      .eq("author_id", author_id);
  } else {
    // Remove ALL fake likes across all authors
    await supabase.from("author_stats")
      .update({ fake_likes: 0, fake_likes_active: false, fake_likes_removed_at: new Date().toISOString() })
      .neq("author_id", "");
  }

  return NextResponse.json({ success: true, message: author_id ? "Fake likes removed for author" : "All fake likes removed" });
}