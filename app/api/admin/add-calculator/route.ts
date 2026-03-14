import { supabase } from "@/lib/supabase";
import { getAdminUser } from "@/lib/admin-auth";
import { normalizeGeneratedContent } from "@/lib/admin-content";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, slug, description, related_slugs } = normalizeGeneratedContent(body);

    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Name, slug, and description are required." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("calculators").insert([
      { name, slug, description, related_slugs },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Add calculator error:", error);
    return NextResponse.json(
      { error: "Failed to add calculator." },
      { status: 500 }
    );
  }
}