import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/admin-publishing";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("tool_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({
      items: data || [],
    });
  } catch (error) {
    console.error("admin tool-requests route error:", error);

    return NextResponse.json(
      { error: "Failed to load tool requests." },
      { status: 500 }
    );
  }
}