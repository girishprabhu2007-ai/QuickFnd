/**
 * app/api/admin/subscribers/route.ts
 * Admin API for subscriber management.
 * GET  ?action=list&page=1&per_page=50&status=active&search=
 * GET  ?action=stats
 * GET  ?action=export  → returns CSV download
 * POST { action: "delete", id: number }
 * POST { action: "unsubscribe", email: string }
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminUser } from "@/lib/admin-auth";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action") || "list";
  const supabase = getSupabase();

  // ── stats ──────────────────────────────────────────────────────────────────
  if (action === "stats") {
    const { data: allRows } = await supabase
      .from("email_subscribers")
      .select("status, source, subscribed_at");

    const rows = allRows || [];
    const total = rows.length;
    const active = rows.filter((r) => r.status === "active").length;
    const unsubscribed = rows.filter((r) => r.status === "unsubscribed").length;

    // Source breakdown
    const sourceMap: Record<string, number> = {};
    for (const r of rows) {
      const s = String(r.source || "unknown");
      sourceMap[s] = (sourceMap[s] || 0) + 1;
    }
    const sources = Object.entries(sourceMap)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Growth by month (last 6 months)
    const now = new Date();
    const months: { month: string; label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("default", { month: "short", year: "2-digit" });
      const count = rows.filter((r) => {
        const sub = String(r.subscribed_at || "");
        return sub.startsWith(key);
      }).length;
      months.push({ month: key, label, count });
    }

    return NextResponse.json({ total, active, unsubscribed, sources, growth: months });
  }

  // ── export CSV ─────────────────────────────────────────────────────────────
  if (action === "export") {
    const { data } = await supabase
      .from("email_subscribers")
      .select("id, email, source, status, subscribed_at, resubscribed_at")
      .order("subscribed_at", { ascending: false });

    const rows = data || [];
    const header = "id,email,source,status,subscribed_at,resubscribed_at\n";
    const body = rows
      .map((r) =>
        [
          r.id,
          `"${String(r.email || "").replace(/"/g, '""')}"`,
          `"${String(r.source || "").replace(/"/g, '""')}"`,
          r.status,
          r.subscribed_at || "",
          r.resubscribed_at || "",
        ].join(",")
      )
      .join("\n");

    return new Response(header + body, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="quickfnd-subscribers-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  // ── list (default) ─────────────────────────────────────────────────────────
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const perPage = Math.min(100, Math.max(10, parseInt(searchParams.get("per_page") || "50", 10)));
  const status = searchParams.get("status") || "all";
  const search = searchParams.get("search") || "";
  const from = (page - 1) * perPage;

  let query = supabase
    .from("email_subscribers")
    .select("id, email, source, status, subscribed_at, resubscribed_at", { count: "exact" })
    .order("subscribed_at", { ascending: false })
    .range(from, from + perPage - 1);

  if (status !== "all") query = query.eq("status", status);
  if (search) query = query.ilike("email", `%${search}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    subscribers: data || [],
    total: count || 0,
    page,
    perPage,
    totalPages: Math.ceil((count || 0) / perPage),
  });
}

export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json() as { action?: string; id?: number; email?: string };
  const supabase = getSupabase();

  if (body.action === "delete" && body.id) {
    const { error } = await supabase
      .from("email_subscribers")
      .delete()
      .eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  if (body.action === "unsubscribe" && body.email) {
    const { error } = await supabase
      .from("email_subscribers")
      .update({ status: "unsubscribed" })
      .eq("email", body.email);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}