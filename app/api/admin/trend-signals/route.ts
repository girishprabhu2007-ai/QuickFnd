/**
 * app/api/admin/trend-signals/route.ts
 * Returns trend signals and demand queue for the admin Intelligence dashboard
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function GET(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "queue";
    const status = searchParams.get("status") || "pending";

    const supabase = getSupabaseAdmin();

    if (view === "queue") {
      const { data } = await supabase
        .from("demand_queue")
        .select("*")
        .eq("status", status)
        .order("demand_score", { ascending: false })
        .limit(100);

      return NextResponse.json({ items: data || [] });
    }

    if (view === "signals") {
      const { data } = await supabase
        .from("trend_signals")
        .select("query, source, volume, category, captured_at")
        .gte("captured_at", new Date(Date.now() - 7 * 86400000).toISOString())
        .order("captured_at", { ascending: false })
        .limit(200);

      return NextResponse.json({ items: data || [] });
    }

    if (view === "cron-log") {
      const { data } = await supabase
        .from("cron_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(20);

      return NextResponse.json({ items: data || [] });
    }

    if (view === "stats") {
      const [signals7d, queuePending, queuePublished, lastRun] = await Promise.all([
        supabase.from("trend_signals").select("id", { count: "exact", head: true })
          .gte("captured_at", new Date(Date.now() - 7 * 86400000).toISOString()),
        supabase.from("demand_queue").select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase.from("demand_queue").select("id", { count: "exact", head: true })
          .eq("status", "published"),
        supabase.from("cron_runs").select("*").order("started_at", { ascending: false }).limit(1).single(),
      ]);

      return NextResponse.json({
        signals_7d: signals7d.count || 0,
        queue_pending: queuePending.count || 0,
        queue_published: queuePublished.count || 0,
        last_run: lastRun.data,
      });
    }

    return NextResponse.json({ error: "Invalid view" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// Update queue item status
export async function PATCH(req: Request) {
  try {
    const admin = await getAdminUser();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json() as { id: string; status: string; rejection_reason?: string };
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("demand_queue")
      .update({
        status: body.status,
        rejection_reason: body.rejection_reason,
        processed_at: new Date().toISOString(),
      })
      .eq("id", body.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}