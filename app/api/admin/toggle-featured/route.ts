/**
 * app/api/admin/toggle-featured/route.ts
 * Toggle is_featured on an ai_tools row.
 * Accepts: { slug, is_featured: boolean, featured_until?: string | null }
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function POST(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as {
      slug: string;
      is_featured: boolean;
      featured_until?: string | null;
    };

    if (!body.slug) return NextResponse.json({ error: "slug required" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase
      .from("ai_tools")
      .update({
        is_featured: body.is_featured,
        featured_until: body.featured_until ?? null,
      })
      .eq("slug", body.slug);

    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
  }
}