import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

type UsageRow = {
  item_slug: string;
  item_type: string;
  event_type: string;
  created_at: string;
};

function monthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from("usage_events")
      .select("item_slug,item_type,event_type,created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (error) {
      throw new Error(error.message);
    }

    const rows = (data || []) as UsageRow[];

    const byItem = new Map<
      string,
      {
        item_slug: string;
        item_type: string;
        total: number;
        thisMonth: number;
      }
    >();

    const currentMonth = monthKey(new Date().toISOString());

    for (const row of rows) {
      const key = `${row.item_type}:${row.item_slug}`;
      const current = byItem.get(key) || {
        item_slug: row.item_slug,
        item_type: row.item_type,
        total: 0,
        thisMonth: 0,
      };

      current.total += 1;

      if (monthKey(row.created_at) === currentMonth) {
        current.thisMonth += 1;
      }

      byItem.set(key, current);
    }

    const items = Array.from(byItem.values()).sort((a, b) => b.total - a.total);

    return NextResponse.json({
      items: items.slice(0, 50),
    });
  } catch (error) {
    console.error("usage-summary route error:", error);

    return NextResponse.json(
      { error: "Failed to load usage summary." },
      { status: 500 }
    );
  }
}