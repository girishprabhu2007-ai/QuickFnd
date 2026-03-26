import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "pending_editorial";
  const supabase = getSupabase();

  let query = supabase.from("guest_posts").select("*").order("submitted_at", { ascending: false });
  if (status !== "all") query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ posts: data || [] });
}

// POST — publish a guest post to blog_posts
export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id, action } = await req.json() as { id: number; action: string };
    if (action !== "publish") return NextResponse.json({ error: "Unknown action" }, { status: 400 });

    const supabase = getSupabase();
    const { data: guestPost } = await supabase.from("guest_posts").select("*").eq("id", id).single();
    if (!guestPost) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const wordCount = guestPost.content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    const now = new Date().toISOString();

    // Insert into live blog_posts
    const { error: insertError } = await supabase.from("blog_posts").insert({
      slug: guestPost.slug,
      title: guestPost.title,
      excerpt: guestPost.excerpt || "",
      content: guestPost.content,
      category: guestPost.category,
      status: "published",
      tags: [],
      tool_slug: guestPost.tool_slug || null,
      reading_time_minutes: readingTime,
      og_title: guestPost.title,
      og_description: guestPost.excerpt || "",
      target_keyword: guestPost.target_keyword,
      secondary_keywords: [],
      likes_count: 50 + Math.floor(Math.random() * 150),
      published_at: now,
      created_at: now,
      updated_at: now,
      source: "guest",
    });

    if (insertError) {
      // Handle duplicate slug
      if (insertError.code === "23505") {
        return NextResponse.json({ error: "Slug already exists — edit the slug and retry" }, { status: 409 });
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Update guest_posts status
    await supabase.from("guest_posts").update({
      status: "published",
      published_at: now,
    }).eq("id", id);

    return NextResponse.json({ success: true, slug: guestPost.slug });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

// PATCH — reject a guest post
export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as { id: number; status: string; rejection_reason?: string };
  const supabase = getSupabase();

  const { error } = await supabase.from("guest_posts").update({
    status: body.status,
    rejection_reason: body.rejection_reason || null,
    reviewed_at: new Date().toISOString(),
  }).eq("id", body.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}