import { supabase } from "@/lib/supabase";
import { getAdminUser } from "@/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await req.json();
  const numericId = Number(id);

  if (!numericId) {
    return NextResponse.json({ error: "Valid id is required." }, { status: 400 });
  }

  const { error } = await supabase
    .from("calculators")
    .delete()
    .eq("id", numericId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}