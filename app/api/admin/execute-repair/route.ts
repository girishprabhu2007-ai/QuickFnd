import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";
import { inferEngineType } from "@/lib/engine-metadata";
import { getAdminUser } from "@/lib/admin-auth";
import {
  LIVE_TOOL_ENGINES,
  LIVE_CALC_ENGINES,
  LIVE_AI_ENGINES,
  getLiveEngines,
  isPlaceholderEngine,
} from "@/lib/engine-registry";

function isPlaceholder(engineType: string | null | undefined, table: "tools" | "calculators" | "ai_tools"): boolean {
  return isPlaceholderEngine(engineType, table);
}

export async function POST() {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabaseAdmin();
    let fixed = 0;
    let alreadyOk = 0;
    const skipped: Array<{ table: string; slug: string; current: string | null; reason: string }> = [];
    const repaired: Array<{ table: string; slug: string; from: string | null; to: string }> = [];

    async function repairTable(table: "tools" | "calculators" | "ai_tools") {
      const { data, error } = await supabase
        .from(table)
        .select("id, name, slug, description, engine_type, engine_config")
        .order("id", { ascending: false });

      if (error) throw new Error(error.message);

      const category = table === "tools" ? "tool" : table === "calculators" ? "calculator" : "ai-tool";
      const liveEngines = getLiveEngines(table);

      for (const item of data || []) {
        // Skip items that already have a live engine
        if (!isPlaceholder(item.engine_type, table)) {
          alreadyOk++;
          continue;
        }

        // Strategy 1: use suggestAdminEngine (uses calculator-runtime + slug patterns)
        const suggestion = suggestAdminEngine(category, {
          name: item.name,
          slug: item.slug,
          description: item.description || "",
          engine_type: item.engine_type,
          engine_config: item.engine_config || {},
        });

        // Strategy 2: use inferEngineType directly on the slug
        const inferred = inferEngineType(category as "tool" | "calculator" | "ai-tool", item.slug);

        // Pick whichever strategy gives a live engine
        let bestEngine: string | null = null;
        let bestConfig: Record<string, unknown> = {};

        if (suggestion.engine_type && liveEngines.has(suggestion.engine_type) && suggestion.engine_type !== "generic-directory") {
          bestEngine = suggestion.engine_type;
          bestConfig = suggestion.engine_config || {};
        } else if (inferred && liveEngines.has(inferred) && inferred !== "generic-directory") {
          bestEngine = inferred;
          bestConfig = {};
        }

        if (!bestEngine) {
          skipped.push({
            table,
            slug: item.slug,
            current: item.engine_type || null,
            reason: `No live renderer found for "${item.engine_type || "null"}" — needs manual fix`,
          });
          continue;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({ engine_type: bestEngine, engine_config: bestConfig })
          .eq("id", item.id);

        if (updateError) {
          skipped.push({ table, slug: item.slug, current: item.engine_type, reason: updateError.message });
          continue;
        }

        repaired.push({ table, slug: item.slug, from: item.engine_type || null, to: bestEngine });
        fixed++;
      }
    }

    await repairTable("tools");
    await repairTable("calculators");
    await repairTable("ai_tools");

    return NextResponse.json({
      success: true,
      fixed,
      alreadyOk,
      skippedCount: skipped.length,
      skipped: skipped.slice(0, 100),
      repaired: repaired.slice(0, 100),
      summary: `Repaired ${fixed} items. ${skipped.length} still need manual attention.`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Repair failed." },
      { status: 500 }
    );
  }
}