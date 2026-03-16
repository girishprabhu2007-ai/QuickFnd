import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export async function GET() {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const supabaseAdmin = getSupabaseAdmin();

    const [tools, calculators, aiTools, requests] = await Promise.all([
      supabaseAdmin.from("tools").select("id,name,slug", { count: "exact" }),
      supabaseAdmin.from("calculators").select("id,name,slug", { count: "exact" }),
      supabaseAdmin.from("ai_tools").select("id,name,slug", { count: "exact" }),
      supabaseAdmin
        .from("tool_requests")
        .select("id,status,created_public_slug", { count: "exact" }),
    ]);

    if (tools.error) throw new Error(tools.error.message);
    if (calculators.error) throw new Error(calculators.error.message);
    if (aiTools.error) throw new Error(aiTools.error.message);
    if (requests.error) throw new Error(requests.error.message);

    const requestRows = requests.data || [];
    const implementedRequests = requestRows.filter(
      (item) => item.status === "implemented" || item.created_public_slug
    ).length;

    return NextResponse.json({
      counts: {
        tools: tools.count || 0,
        calculators: calculators.count || 0,
        aiTools: aiTools.count || 0,
        total:
          (tools.count || 0) +
          (calculators.count || 0) +
          (aiTools.count || 0),
        requests: requests.count || 0,
        implementedRequests,
      },
      recent: {
        tools: (tools.data || []).slice(-5).reverse(),
        calculators: (calculators.data || []).slice(-5).reverse(),
        aiTools: (aiTools.data || []).slice(-5).reverse(),
      },
    });
  } catch (error) {
    console.error("dashboard-stats route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load dashboard stats.",
      },
      { status: 500 }
    );
  }
}