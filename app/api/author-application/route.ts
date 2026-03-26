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
      name: string; email: string; title: string; location: string;
      years_experience: string; topic_area: string;
      linkedin?: string; twitter?: string;
      bio: string; writing_sample_url?: string;
      topic_pitch: string; why_quickfnd: string;
    };

    if (!body.name || !body.email || !body.bio || !body.topic_pitch) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase.from("author_applications").insert({
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      title: body.title.trim(),
      location: body.location.trim(),
      years_experience: parseInt(body.years_experience) || 0,
      topic_area: body.topic_area,
      linkedin: body.linkedin || null,
      twitter: body.twitter || null,
      bio: body.bio.trim(),
      writing_sample_url: body.writing_sample_url || null,
      topic_pitch: body.topic_pitch.trim(),
      why_quickfnd: body.why_quickfnd.trim(),
      status: "pending",
      submitted_at: new Date().toISOString(),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}