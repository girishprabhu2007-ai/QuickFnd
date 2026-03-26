import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAuthorById } from "@/lib/authors";
import { getOpenAIClient } from "@/lib/openai-server";

export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET: fetch comments for a post
export async function GET(req: Request) {
  const url = new URL(req.url);
  const post_slug = url.searchParams.get("post_slug");
  if (!post_slug) return NextResponse.json({ error: "post_slug required" }, { status: 400 });

  const supabase = getSupabasePublic();
  const { data, error } = await supabase
    .from("blog_comments")
    .select("*")
    .eq("post_slug", post_slug)
    .eq("status", "approved")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ comments: data || [] });
}

// POST: submit a user comment + trigger AI author reply
export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      post_slug: string;
      author_name: string;
      author_email?: string;
      content: string;
    };

    if (!body.post_slug || !body.author_name || !body.content) {
      return NextResponse.json({ error: "post_slug, author_name and content are required" }, { status: 400 });
    }

    if (body.content.length < 10 || body.content.length > 2000) {
      return NextResponse.json({ error: "Comment must be 10-2000 characters" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Save user comment
    const { data: comment, error: commentError } = await supabase
      .from("blog_comments")
      .insert({
        post_slug: body.post_slug,
        author_name: body.author_name.trim().slice(0, 60),
        author_email: body.author_email || null,
        content: body.content.trim(),
        is_author_reply: false,
        status: "approved",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (commentError) return NextResponse.json({ error: commentError.message }, { status: 500 });

    // Fetch post + article author info for AI reply
    const { data: post } = await supabase
      .from("blog_posts")
      .select("title, author_id, content, category")
      .eq("slug", body.post_slug)
      .single();

    // Generate AI author reply (async — don't block the response)
    if (post?.author_id) {
      generateAuthorReply(body.post_slug, post, body.author_name, body.content)
        .catch(() => null); // fire and forget
    }

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

async function generateAuthorReply(
  postSlug: string,
  post: { title: string; author_id: string; content: string; category: string },
  commenterName: string,
  commentContent: string
): Promise<void> {
  // Random delay 2-18 minutes — makes it feel like the author read and typed a reply
  const delayMinutes = 2 + Math.floor(Math.random() * 16);
  await new Promise(r => setTimeout(r, delayMinutes * 60 * 1000));

  const author = getAuthorById(post.author_id);
  if (!author) return;

  const openai = getOpenAIClient();

  const prompt = `You are ${author.name}, ${author.title} based in ${author.location}.
You wrote a blog article titled: "${post.title}"
A reader named ${commenterName} commented: "${commentContent}"

Write a genuine, helpful reply as ${author.name}. Your writing style: ${author.writing_style}

Rules:
- 2-4 sentences maximum — this is a blog comment reply, not another article
- Acknowledge their specific point or question directly
- Add ONE genuinely useful extra thought or tip they didn't ask for but will appreciate  
- Sound like a real person, not a customer service bot
- Don't start with "Great comment!" or similar hollow openers
- Don't sign off with your name — it shows in the UI already
- Occasionally ask a follow-up question if it would lead to useful discussion

Reply only with the comment text, nothing else.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.8,
      max_tokens: 200,
      messages: [{ role: "user", content: prompt }],
    });

    const replyText = response.choices[0]?.message?.content?.trim();
    if (!replyText || replyText.length < 20) return;

    const supabase = getSupabaseAdmin();
    await supabase.from("blog_comments").insert({
      post_slug: postSlug,
      author_name: author.name,
      author_title: author.title,
      author_id: author.id,
      content: replyText,
      is_author_reply: true,
      status: "approved",
      created_at: new Date().toISOString(),
    });
  } catch { /* silent fail — reply is a nice-to-have */ }
}
