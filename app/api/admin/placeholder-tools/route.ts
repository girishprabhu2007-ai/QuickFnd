import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import {
  isToolPlaceholder,
  resolveToolEngineType,
} from "@/lib/public-tool-visibility";
import { inferEngineType } from "@/lib/engine-metadata";

export async function GET() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("tools")
      .select("name,slug,description,engine_type,engine_config")
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
        current_engine_config: item.engine_config || {},
        suggested_engine_type: inferEngineType("tool", item.slug) || "generic-directory",
        resolved_engine_type: resolveToolEngineType(item),
        public_url: `/tools/${item.slug}`,
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
          error instanceof Error
            ? error.message
            : "Failed to load placeholder tools.",
      },
      { status: 500 }
    );
  }
}