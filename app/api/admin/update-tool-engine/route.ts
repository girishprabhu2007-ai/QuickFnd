import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { ENGINE_OPTIONS, normalizeEngineConfig } from "@/lib/engine-metadata";
import { isToolPubliclyVisible } from "@/lib/public-tool-visibility";

type RequestBody = {
  slug?: string;
  engine_type?: string;
  engine_config?: unknown;
};

const SUPPORTED_TOOL_ENGINE_TYPES = new Set(
  ENGINE_OPTIONS.tool
    .map((option) => option.value)
    .filter((value) => value !== "generic-directory")
);

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;

    const slug = String(body.slug || "").trim().toLowerCase();
    const engineType = String(body.engine_type || "").trim().toLowerCase();
    const engineConfig = normalizeEngineConfig(body.engine_config);

    if (!slug) {
      return NextResponse.json({ error: "Tool slug is required." }, { status: 400 });
    }

    if (!engineType) {
      return NextResponse.json({ error: "Engine type is required." }, { status: 400 });
    }

    if (!SUPPORTED_TOOL_ENGINE_TYPES.has(engineType as never)) {
      return NextResponse.json(
        { error: "Selected engine type is not supported for public tools." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { data: existing, error: existingError } = await supabaseAdmin
      .from("tools")
      .select("name,slug,engine_type,engine_config")
      .eq("slug", slug)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      return NextResponse.json({ error: "Tool not found." }, { status: 404 });
    }

    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from("tools")
      .update({
        engine_type: engineType,
        engine_config: engineConfig,
      })
      .eq("slug", slug)
      .select("name,slug,engine_type,engine_config")
      .limit(1);

    if (updateError) {
      throw new Error(updateError.message);
    }

    const updated = updatedRows?.[0];

    if (!updated) {
      return NextResponse.json(
        { error: "Tool was not updated." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      item: {
        name: updated.name,
        slug: updated.slug,
        engine_type: updated.engine_type,
        engine_config: updated.engine_config || {},
        public_url: `/tools/${updated.slug}`,
        is_publicly_visible: isToolPubliclyVisible(updated),
      },
      message: "Tool engine updated successfully.",
    });
  } catch (error) {
    console.error("update-tool-engine route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update tool engine.",
      },
      { status: 500 }
    );
  }
}