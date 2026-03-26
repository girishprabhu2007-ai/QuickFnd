import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      contributor_email: string;
      contributor_name: string;
      title: string;
      slug: string;
      category: string;
      target_keyword: string;
      excerpt: string;
      content: string;
      tool_slug?: string;
      ai_score: number;
      ai_feedback: string;
    };

    if (!body.contributor_email || !body.title || !body.content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (body.ai_score < 70) {
      return NextResponse.json({ error: "Article did not pass AI review (score < 70)" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Verify contributor is approved
    const { data: application } = await supabase
      .from("author_applications")
      .select("id, name, status")
      .eq("email", body.contributor_email.toLowerCase())
      .eq("status", "approved")
      .maybeSingle();

    if (!application) {
      return NextResponse.json({
        error: "Your email is not in our approved contributor list. Please apply at /write-for-us first."
      }, { status: 403 });
    }

    // Save to guest_posts table (pending editorial review)
    const { error } = await supabase.from("guest_posts").insert({
      contributor_email: body.contributor_email,
      contributor_name: body.contributor_name,
      contributor_application_id: application.id,
      title: body.title,
      slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "-").slice(0, 70),
      category: body.category,
      target_keyword: body.target_keyword,
      excerpt: body.excerpt,
      content: body.content,
      tool_slug: body.tool_slug || null,
      ai_score: body.ai_score,
      ai_feedback: body.ai_feedback,
      status: "pending_editorial",
      submitted_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}