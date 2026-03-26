import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Temporary debug endpoint — shows engine_type for specific slugs
// Visit: /api/debug-engines to see current DB state
export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(url, key, { auth: { persistSession: false } });

  const checkSlugs = [
    "html-minifier", "css-minifier", "box-shadow-generator",
    "css-gradient-generator", "email-validator", "line-counter",
    "mortgage-calculator", "sales-tax-calculator", "vat-calculator",
  ];

  const [toolsRes, calcsRes] = await Promise.all([
    supabase.from("tools").select("slug, engine_type, engine_config")
      .in("slug", checkSlugs),
    supabase.from("calculators").select("slug, engine_type, engine_config")
      .in("slug", checkSlugs),
  ]);

  return NextResponse.json({
    tools: toolsRes.data || [],
    calculators: calcsRes.data || [],
    errors: {
      tools: toolsRes.error?.message,
      calculators: calcsRes.error?.message,
    }
  });
}