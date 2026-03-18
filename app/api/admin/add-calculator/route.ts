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
    const body = (await req.json()) as Record<string, unknown>;
    const {
      name,
      slug,
      description,
      related_slugs,
      engine_type,
      engine_config,
    } = normalizeGeneratedContent(body, "calculator");

    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Name, slug, and description are required." },
        { status: 400 }
      );
    }

    if (!engine_type || engine_type === "generic-directory") {
      return NextResponse.json(
        { error: "This calculator does not match a supported live engine yet." },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("calculators").insert([
      {
        name,
        slug,
        description,
        related_slugs,
        engine_type,
        engine_config,
      },
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