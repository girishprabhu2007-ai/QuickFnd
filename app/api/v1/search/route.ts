import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 60;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase().trim() || "";
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);

  if (!q) {
    return NextResponse.json({ success: false, error: "q parameter required" }, { status: 400, headers: CORS });
  }

  try {
    const supabase = getSupabase();
    const [toolsRes, calcsRes, aiRes] = await Promise.all([
      supabase.from("tools").select("name,slug,description"),
      supabase.from("calculators").select("name,slug,description"),
      supabase.from("ai_tools").select("name,slug,description"),
    ]);

    const all = [
      ...(toolsRes.data || []).map(t => ({ ...t, type: "tool", url: `https://quickfnd.com/tools/${t.slug}` })),
      ...(calcsRes.data || []).map(t => ({ ...t, type: "calculator", url: `https://quickfnd.com/calculators/${t.slug}` })),
      ...(aiRes.data || []).map(t => ({ ...t, type: "ai-tool", url: `https://quickfnd.com/ai-tools/${t.slug}` })),
    ].filter(t =>
      t.name?.toLowerCase().includes(q) ||
      t.description?.toLowerCase().includes(q) ||
      t.slug?.includes(q)
    ).slice(0, limit);

    return NextResponse.json({
      success: true,
      query: q,
      count: all.length,
      data: all,
      attribution: "QuickFnd (https://quickfnd.com)",
    }, { headers: { ...CORS, "Cache-Control": "public, s-maxage=60" } });
  } catch {
    return NextResponse.json({ success: false, error: "Search failed" }, { status: 500, headers: CORS });
  }
}