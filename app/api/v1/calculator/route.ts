/**
 * GET /api/v1/calculators
 * Public REST API — returns all QuickFnd tools.
 * Free to use. Attribution appreciated: https://quickfnd.com
 *
 * Query params:
 *   ?q=     search query
 *   ?limit= max results (default 50, max 200)
 *   ?type=  tool | calculator | ai-tool (all if omitted)
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const revalidate = 300;

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
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("calculators")
      .select("name,slug,description,engine_type")
      .order("name");

    let results = (data || []).map(t => ({
      name: t.name,
      slug: t.slug,
      description: t.description,
      type: "calculator",
      url: `https://quickfnd.com/calculators/${t.slug}`,
      embed_url: `https://quickfnd.com/embed/calculators/${t.slug}`,
    }));

    if (q) {
      results = results.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.slug.includes(q)
      );
    }

    return NextResponse.json({
      success: true,
      count: results.slice(0, limit).length,
      total: results.length,
      data: results.slice(0, limit),
      attribution: "Data from QuickFnd (https://quickfnd.com) — Free browser-based tools",
    }, { headers: { ...CORS, "Cache-Control": "public, s-maxage=300" } });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Failed to fetch calculators" }, { status: 500, headers: CORS });
  }
}