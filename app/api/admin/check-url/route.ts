import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "QuickFnd-Admin-Checker/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return NextResponse.json({ status: "404", code: 404 });

    const text = await res.text();

    // Detect placeholder — tool page with no working UI
    const isPlaceholder =
      text.includes("This utility is available as an indexable QuickFnd tool entry") ||
      text.includes("Tool ready") ||
      text.includes("Adjust the inputs and run the tool") === false && text.includes("Tool Workspace");

    return NextResponse.json({
      status: isPlaceholder ? "placeholder" : "ok",
      code: res.status,
    });
  } catch {
    return NextResponse.json({ status: "404", code: 0 });
  }
}