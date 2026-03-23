import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { ENGINE_OPTIONS, normalizeEngineConfig } from "@/lib/engine-metadata";
import { isToolPubliclyVisible } from "@/lib/public-tool-visibility";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

type RequestBody = {
  slug?: string;
  engine_type?: string;
  engine_config?: unknown;
};

type ExistingToolRow = {
  name: string;
  slug: string;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
};

const SUPPORTED_TOOL_ENGINE_TYPES = new Set(
  ENGINE_OPTIONS.tool
    .map((option) => option.value)
    .filter((value) => value !== "generic-directory")
);

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  if (isObject(value)) {
    const keys = Object.keys(value).sort();
    return `{${keys
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function configsEqual(a: unknown, b: unknown) {
  return stableStringify(normalizeEngineConfig(a)) === stableStringify(normalizeEngineConfig(b));
}

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;

    const slug = String(body.slug || "").trim().toLowerCase();
    const engineType = String(body.engine_type || "").trim().toLowerCase();
    const providedConfig = normalizeEngineConfig(body.engine_config);

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
      .select("name,slug,description,engine_type,engine_config")
      .eq("slug", slug)
      .maybeSingle<ExistingToolRow>();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (!existing) {
      return NextResponse.json({ error: "Tool not found." }, { status: 404 });
    }

    const suggestion = suggestAdminEngine("tool", {
      name: existing.name,
      slug: existing.slug,
      description: existing.description || "",
      engine_type: engineType,
      engine_config: providedConfig,
    });

    const suggestedType = String(suggestion.engine_type || "").trim().toLowerCase();
    const suggestedConfig = normalizeEngineConfig(suggestion.engine_config);

    const finalEngineConfig = {
      ...suggestedConfig,
      ...providedConfig,
    };

    const currentType = String(existing.engine_type || "").trim().toLowerCase();
    const currentConfig = normalizeEngineConfig(existing.engine_config);

    const noTypeChange = currentType === engineType;
    const noConfigChange = configsEqual(currentConfig, finalEngineConfig);

    if (noTypeChange && noConfigChange) {
      return NextResponse.json({
        success: true,
        unchanged: true,
        item: {
          name: existing.name,
          slug: existing.slug,
          engine_type: currentType,
          engine_config: currentConfig,
          public_url: `/tools/${existing.slug}`,
          is_publicly_visible: isToolPubliclyVisible({
            ...existing,
            engine_type: currentType,
            engine_config: currentConfig,
          }),
        },
        message: "Tool engine already matches the requested configuration.",
      });
    }

    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from("tools")
      .update({
        engine_type: engineType,
        engine_config: finalEngineConfig,
      })
      .eq("slug", slug)
      .select("name,slug,description,engine_type,engine_config")
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
      metadata: {
        requested_engine_type: engineType,
        suggested_engine_type: suggestedType || null,
        suggestion_reason: suggestion.reason || null,
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