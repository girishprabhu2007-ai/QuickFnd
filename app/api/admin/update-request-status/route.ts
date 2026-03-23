import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();
    if (!adminUser) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const body = await req.json();
    const id = Number(body.id);
    const status = String(body.status || "").trim();
    const admin_note = String(body.admin_note || "").trim();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required." }, { status: 400 });
    }

    const validStatuses = ["pending", "reviewed", "implemented", "rejected"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const updateData: Record<string, unknown> = { status };
    if (admin_note) updateData.admin_note = admin_note;

    const { error } = await supabaseAdmin
      .from("tool_requests")
      .update(updateData)
      .eq("id", id);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, message: "Status updated." });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update." },
      { status: 500 }
    );
  }
}