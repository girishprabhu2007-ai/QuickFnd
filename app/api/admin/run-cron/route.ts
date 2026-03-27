import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://quickfnd.com";
const CRON_SECRET = process.env.CRON_SECRET || "";

const ALLOWED_JOBS = new Set([
  "intelligence",
  "auto-publish",
  "auto-screen-queue",
  "blog-publish",
  "internal-links",
  "email-nurture",
]);

export async function POST(req: Request) {
  // Must be logged-in admin
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { job } = await req.json() as { job?: string };
  if (!job || !ALLOWED_JOBS.has(job)) {
    return NextResponse.json({ error: "Unknown job" }, { status: 400 });
  }

  if (!CRON_SECRET) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  try {
    const res = await fetch(`${SITE_URL}/api/cron/${job}`, {
      headers: { Authorization: `Bearer ${CRON_SECRET}` },
      signal: AbortSignal.timeout(280000),
    });
    const data = await res.json();
    return NextResponse.json({ success: res.ok, status: res.status, data });
  } catch (err) {
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Failed"
    }, { status: 500 });
  }
}
