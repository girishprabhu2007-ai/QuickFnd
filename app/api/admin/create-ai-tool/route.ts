import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = getSupabaseAdmin();

  const { name, slug, description } = body;

  const { error } = await supabase.from("ai_tools").insert({
    name,
    slug,
    description,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}