import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function GET() {
  const supabase = getSupabaseAdmin();

  async function get(table: string) {
    const { data } = await supabase
      .from(table)
      .select("id, name, slug, engine_type");

    return data || [];
  }

  const tools = await get("tools");
  const calculators = await get("calculators");
  const aiTools = await get("ai_tools");

  return NextResponse.json({
    tools,
    calculators,
    aiTools,
  });
}