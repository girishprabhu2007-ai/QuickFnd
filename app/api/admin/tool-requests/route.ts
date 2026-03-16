import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("tool_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error("tool_requests query error:", error);
      return NextResponse.json(
        {
          items: [],
          error:
            error.message || "Failed to load tool requests.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      items: data || [],
    });
  } catch (error) {
    console.error("admin tool-requests route error:", error);

    return NextResponse.json(
      {
        items: [],
        error: "Failed to load tool requests.",
      },
      { status: 500 }
    );
  }
}