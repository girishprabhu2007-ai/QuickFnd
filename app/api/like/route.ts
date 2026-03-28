import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

const VALID_TABLES = new Set(["tools", "calculators", "ai_tools"]);

// GET /api/like?slug=xxx&table=tools → { likes: 1234 }
export async function GET(req: Request) {
  const url = new URL(req.url);
  const slug = url.searchParams.get("slug");
  const table = url.searchParams.get("table");

  if (!slug || !table || !VALID_TABLES.has(table)) {
    return NextResponse.json({ likes: 0 });
  }

  const supabase = getSupabase();
  const { data } = await supabase
    .from(table)
    .select("likes")
    .eq("slug", slug)
    .maybeSingle();

  return NextResponse.json({ likes: data?.likes ?? 0 });
}

// POST /api/like { slug, table } → { likes: 1235, success: true }
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "").trim();
    const table = String(body.table || "").trim();

    if (!slug || !VALID_TABLES.has(table)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const supabase = getSupabase();

    // Increment likes using RPC or raw update
    const { data: current } = await supabase
      .from(table)
      .select("likes")
      .eq("slug", slug)
      .maybeSingle();

    const currentLikes = current?.likes ?? 0;
    const newLikes = currentLikes + 1;

    const { error } = await supabase
      .from(table)
      .update({ likes: newLikes })
      .eq("slug", slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, likes: newLikes });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}