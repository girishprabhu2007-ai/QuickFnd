import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import {
  normalizeGeneratedContent,
} from "@/lib/admin-content";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, slug, description, related_slugs } = normalizeGeneratedContent(body);

    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Name, slug, and description are required." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("ai_tools").insert([
      {
        name,
        slug,
        description,
        related_slugs,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add AI tool error:", error);
    return NextResponse.json(
      { error: "Failed to add AI tool." },
      { status: 500 }
    );
  }
}