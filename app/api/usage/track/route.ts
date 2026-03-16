import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

type UsageRow = {
  item_slug: string;
  item_type: string;
  event_type: string;
  created_at: string;
};

type UsagePayload = {
  item_slug?: string;
  item_type?: "tool" | "calculator" | "ai-tool";
  event_type?: string;
};

function monthKey(dateString: string) {
  const date = new Date(dateString);
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UsagePayload;

    const itemSlug = String(body.item_slug || "").trim();
    const itemType = String(body.item_type || "").trim();
    const eventType = String(body.event_type || "page_view").trim();

    if (!itemSlug) {
      return NextResponse.json(
        { error: "item_slug is required." },
        { status: 400 }
      );
    }

    if (!["tool", "calculator", "ai-tool"].includes(itemType)) {
      return NextResponse.json(
        { error: "item_type must be tool, calculator, or ai-tool." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin.from("usage_events").insert([
      {
        item_slug: itemSlug,
        item_type: itemType,
        event_type: eventType,
      },
    ]);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("usage track POST error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to track usage.",
      },
      { status: 500 }
    );
  }
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
      {
        error:
          error instanceof Error ? error.message : "Failed to load usage summary.",
      },
      { status: 500 }
    );
  }
}