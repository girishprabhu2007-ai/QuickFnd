import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getTable,
  normalizeCategory,
} from "@/lib/admin-publishing";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = String(body.slug || "").trim();
    const category = normalizeCategory(body.category);

    if (!slug) {
      return NextResponse.json({ error: "Valid slug is required." }, { status: 400 });
    }

    const table = getTable(category);
    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from(table)
      .delete()
      .eq("slug", slug);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("delete-item route error:", error);
    return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
  }
}