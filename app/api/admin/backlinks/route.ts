/**
 * app/api/admin/backlinks/route.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Admin backlink management API.
 *
 * GET    — list all backlinks (with optional status filter)
 * POST   — add a new backlink
 * PUT    — update a backlink (status, notes)
 * DELETE — delete a backlink by id
 *
 * GET ?action=check-all — check all backlink URLs for alive/dead status
 * GET ?action=check&id=X — check a single backlink URL
 * GET ?action=ping&id=X — ping a single backlink URL to IndexNow
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || "";

async function checkUrlAlive(url: string): Promise<{ alive: boolean; statusCode: number; redirectUrl?: string }> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "QuickFnd-Backlink-Checker/1.0" },
    });
    const finalUrl = res.url !== url ? res.url : undefined;
    return { alive: res.ok, statusCode: res.status, redirectUrl: finalUrl };
  } catch {
    // Try GET if HEAD fails (some servers block HEAD)
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
        headers: { "User-Agent": "QuickFnd-Backlink-Checker/1.0" },
      });
      const finalUrl = res.url !== url ? res.url : undefined;
      return { alive: res.ok, statusCode: res.status, redirectUrl: finalUrl };
    } catch {
      return { alive: false, statusCode: 0 };
    }
  }
}

async function pingIndexNow(url: string): Promise<{ bing: boolean; yandex: boolean }> {
  if (!INDEXNOW_KEY) return { bing: false, yandex: false };

  let bing = false;
  let yandex = false;

  try {
    const res = await fetch(`https://www.bing.com/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`, {
      signal: AbortSignal.timeout(10000),
    });
    bing = res.ok || res.status === 202;
  } catch { /* ignore */ }

  try {
    const res = await fetch(`https://yandex.com/indexnow?url=${encodeURIComponent(url)}&key=${INDEXNOW_KEY}`, {
      signal: AbortSignal.timeout(10000),
    });
    yandex = res.ok || res.status === 202;
  } catch { /* ignore */ }

  return { bing, yandex };
}

export async function GET(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const id = searchParams.get("id");
  const supabase = getSupabaseAdmin();

  // Check single backlink
  if (action === "check" && id) {
    const { data: link } = await supabase.from("backlinks").select("*").eq("id", id).single();
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await checkUrlAlive(link.url);
    const status = result.alive ? "alive" : "dead";

    await supabase.from("backlinks").update({
      link_status: status,
      last_checked: new Date().toISOString(),
      http_status: result.statusCode,
    }).eq("id", id);

    return NextResponse.json({ id, url: link.url, ...result, status });
  }

  // Check all backlinks
  if (action === "check-all") {
    const { data: links } = await supabase.from("backlinks").select("id,url").order("id");
    const results: { id: string; url: string; alive: boolean; statusCode: number }[] = [];

    for (const link of (links || [])) {
      const result = await checkUrlAlive(link.url);
      const status = result.alive ? "alive" : "dead";

      await supabase.from("backlinks").update({
        link_status: status,
        last_checked: new Date().toISOString(),
        http_status: result.statusCode,
      }).eq("id", link.id);

      results.push({ id: link.id, url: link.url, ...result });
      await new Promise(r => setTimeout(r, 500)); // rate limit
    }

    return NextResponse.json({ checked: results.length, results });
  }

  // Ping single backlink to IndexNow
  if (action === "ping" && id) {
    const { data: link } = await supabase.from("backlinks").select("*").eq("id", id).single();
    if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const result = await pingIndexNow(link.url);

    await supabase.from("backlinks").update({
      last_pinged: new Date().toISOString(),
    }).eq("id", id);

    return NextResponse.json({ id, url: link.url, ...result });
  }

  // List all backlinks
  const statusFilter = searchParams.get("status");
  let query = supabase.from("backlinks").select("*").order("created_at", { ascending: false });
  if (statusFilter) query = query.eq("link_status", statusFilter);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ backlinks: data || [] });
}

export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    url?: string;
    source_name?: string;
    source_type?: string;
    anchor_text?: string;
    target_url?: string;
    da?: number;
    notes?: string;
  };

  if (!body.url?.trim()) return NextResponse.json({ error: "URL is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();

  // Check if URL already exists
  const { data: existing } = await supabase.from("backlinks").select("id").eq("url", body.url.trim()).maybeSingle();
  if (existing) return NextResponse.json({ error: "This URL is already tracked" }, { status: 409 });

  const { data, error } = await supabase.from("backlinks").insert({
    url: body.url.trim(),
    source_name: body.source_name?.trim() || new URL(body.url.trim()).hostname,
    source_type: body.source_type || "directory",
    anchor_text: body.anchor_text?.trim() || "QuickFnd",
    target_url: body.target_url?.trim() || "https://quickfnd.com",
    da: body.da || 0,
    notes: body.notes?.trim() || "",
    link_status: "unchecked",
    created_at: new Date().toISOString(),
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ backlink: data });
}

export async function PUT(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({})) as {
    id?: string;
    source_name?: string;
    source_type?: string;
    anchor_text?: string;
    target_url?: string;
    da?: number;
    notes?: string;
    link_status?: string;
  };

  if (!body.id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const updates: Record<string, unknown> = {};
  if (body.source_name !== undefined) updates.source_name = body.source_name;
  if (body.source_type !== undefined) updates.source_type = body.source_type;
  if (body.anchor_text !== undefined) updates.anchor_text = body.anchor_text;
  if (body.target_url !== undefined) updates.target_url = body.target_url;
  if (body.da !== undefined) updates.da = body.da;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.link_status !== undefined) updates.link_status = body.link_status;

  const { error } = await supabase.from("backlinks").update(updates).eq("id", body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("backlinks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
