import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

type TableName = "tools" | "calculators" | "ai_tools";

type RowItem = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  engine_type: string | null;
  engine_config: Record<string, unknown> | null;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeConfig(value: unknown): Record<string, unknown> {
  if (!isObject(value)) return {};
  return value;
}

function isEmptyConfig(value: unknown) {
  const config = normalizeConfig(value);
  return Object.keys(config).length === 0;
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
  return stableStringify(normalizeConfig(a)) === stableStringify(normalizeConfig(b));
}

function needsRepair(item: RowItem) {
  const engineType = String(item.engine_type || "").trim().toLowerCase();

  if (!engineType) return true;
  if (engineType === "generic-directory") return true;
  if (isEmptyConfig(item.engine_config)) return true;

  return false;
}

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    let fixed = 0;
    let unchanged = 0;
    const skipped: Array<{ table: string; slug: string; reason: string }> = [];
    const updated: Array<{ table: string; slug: string; engine_type: string }> = [];

    async function fixTable(table: TableName) {
      const { data, error } = await supabase
        .from(table)
        .select("id, name, slug, description, engine_type, engine_config")
        .order("id", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      for (const rawItem of (data || []) as RowItem[]) {
        const item: RowItem = {
          id: rawItem.id,
          name: rawItem.name,
          slug: rawItem.slug,
          description: rawItem.description || "",
          engine_type: rawItem.engine_type || null,
          engine_config: normalizeConfig(rawItem.engine_config),
        };

        if (!needsRepair(item)) {
          unchanged++;
          continue;
        }

        const category =
          table === "tools"
            ? "tool"
            : table === "calculators"
              ? "calculator"
              : "ai-tool";

        const suggestion = suggestAdminEngine(category, {
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          engine_type: item.engine_type,
          engine_config: item.engine_config || {},
        });

        const suggestedType = String(suggestion.engine_type || "").trim().toLowerCase();
        const suggestedConfig = normalizeConfig(suggestion.engine_config);

        const canFix =
          suggestedType &&
          suggestedType !== "generic-directory" &&
          (category === "ai-tool" || suggestion.is_supported);

        if (!canFix) {
          skipped.push({
            table,
            slug: item.slug,
            reason: suggestion.reason || "No supported engine suggestion.",
          });
          continue;
        }

        const currentType = String(item.engine_type || "").trim().toLowerCase();
        const sameType = currentType === suggestedType;
        const sameConfig = configsEqual(item.engine_config, suggestedConfig);

        if (sameType && sameConfig) {
          unchanged++;
          continue;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({
            engine_type: suggestedType,
            engine_config: suggestedConfig,
          })
          .eq("id", item.id);

        if (updateError) {
          skipped.push({
            table,
            slug: item.slug,
            reason: updateError.message,
          });
          continue;
        }

        fixed++;
        updated.push({
          table,
          slug: item.slug,
          engine_type: suggestedType,
        });
      }
    }

    await fixTable("tools");
    await fixTable("calculators");
    await fixTable("ai_tools");

    return NextResponse.json({
      success: true,
      fixed,
      unchanged,
      updatedCount: updated.length,
      updated: updated.slice(0, 50),
      skippedCount: skipped.length,
      skipped: skipped.slice(0, 50),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fix engines.",
      },
      { status: 500 }
    );
  }
}