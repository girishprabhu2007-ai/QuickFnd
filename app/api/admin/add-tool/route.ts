import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {

  const { name, slug, description } = await req.json();

  const { error } = await supabase
    .from("tools")
    .insert([{ name, slug, description }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });

}