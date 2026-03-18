import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { resolveCalculatorEngine } from "@/lib/calculator-engine-map";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

export async function POST() {
  const supabase = getSupabaseAdmin();

  let fixed = 0;

  async function fix(table: "tools" | "calculators" | "ai_tools") {
    const { data } = await supabase
      .from(table)
      .select("id, name, slug, description, engine_type");

    for (const item of data || []) {
      if (item.engine_type) continue;

      let engineType: string | null = null;
      let engineConfig: Record<string, unknown> = {};

      if (table === "calculators") {
        engineType = resolveCalculatorEngine(item.slug);
      } else {
        const suggestion = suggestAdminEngine(
          table === "ai_tools" ? "ai-tool" : "tool",
          {
            name: item.name,
            slug: item.slug,
            description: item.description,
          }
        );

        engineType = suggestion.engine_type;
        engineConfig = suggestion.engine_config || {};
      }

      if (!engineType) continue;

      await supabase
        .from(table)
        .update({
          engine_type: engineType,
          engine_config: engineConfig,
        })
        .eq("id", item.id);

      fixed++;
    }
  }

  await fix("tools");
  await fix("calculators");
  await fix("ai_tools");

  return NextResponse.json({
    success: true,
    fixed,
  });
}