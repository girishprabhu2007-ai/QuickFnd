import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

export async function POST() {
  try {
    const supabase = getSupabaseAdmin();

    let fixed = 0;
    const skipped: Array<{ table: string; slug: string; reason: string }> = [];

    async function repairTable(table: "tools" | "calculators" | "ai_tools") {
      const { data, error } = await supabase
        .from(table)
        .select("id, name, slug, description, engine_type, engine_config")
        .order("id", { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      for (const item of data || []) {
        if (item.engine_type) continue;

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

        const canFix =
          suggestion.engine_type &&
          suggestion.engine_type !== "generic-directory" &&
          (category === "ai-tool" || suggestion.is_supported);

        if (!canFix) {
          skipped.push({
            table,
            slug: item.slug,
            reason: suggestion.reason,
          });
          continue;
        }

        const { error: updateError } = await supabase
          .from(table)
          .update({
            engine_type: suggestion.engine_type,
            engine_config: suggestion.engine_config,
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
      }
    }

    await repairTable("tools");
    await repairTable("calculators");
    await repairTable("ai_tools");

    return NextResponse.json({
      success: true,
      fixed,
      skippedCount: skipped.length,
      skipped: skipped.slice(0, 100),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to execute repair.",
      },
      { status: 500 }
    );
  }
}