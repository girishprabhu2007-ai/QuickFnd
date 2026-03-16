import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import {
  isToolPlaceholder,
  resolveToolEngineType,
} from "@/lib/public-tool-visibility";

export async function GET() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("tools")
      .select("name,slug,description,engine_type")
      .order("name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    const items = (data || [])
      .filter((item) => isToolPlaceholder(item))
      .map((item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description || "",
        current_engine_type: item.engine_type || "",
        resolved_engine_type: resolveToolEngineType(item),
        reason: "No supported working public engine is currently attached.",
      }));

    return NextResponse.json({
      items,
      count: items.length,
    });
  } catch (error) {
    console.error("placeholder-tools route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load placeholder tools.",
      },
      { status: 500 }
    );
  }
}