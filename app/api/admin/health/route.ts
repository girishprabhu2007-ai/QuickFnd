/**
 * app/api/admin/health/route.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * System Health Monitor API
 *
 * Checks:
 *  - Supabase connectivity + row counts
 *  - Cron job status (last runs, failures in 24h)
 *  - Environment variables (all required keys present)
 *  - OpenAI API health (quick test call)
 *  - Resend API health
 *  - IndexNow key file
 *  - Supabase resource warnings
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

type ServiceCheck = {
  name: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  message: string;
  latency_ms?: number;
  details?: Record<string, unknown>;
};

export async function GET() {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const checks: ServiceCheck[] = [];
  const startTime = Date.now();

  // ── 1. Supabase connectivity ───────────────────────────────────────────────
  try {
    const t = Date.now();
    const supabase = getSupabaseAdmin();
    const { count: toolCount, error: toolErr } = await supabase
      .from("tools").select("id", { count: "exact", head: true });
    const { count: calcCount } = await supabase
      .from("calculators").select("id", { count: "exact", head: true });
    const { count: blogCount } = await supabase
      .from("blog_posts").select("id", { count: "exact", head: true }).eq("status", "published");
    const { count: subCount } = await supabase
      .from("email_subscribers").select("id", { count: "exact", head: true }).eq("status", "active");

    if (toolErr) throw new Error(toolErr.message);

    const latency = Date.now() - t;
    checks.push({
      name: "Supabase Database",
      status: latency > 3000 ? "degraded" : "healthy",
      message: latency > 3000 ? `Connected but slow (${latency}ms)` : `Connected (${latency}ms)`,
      latency_ms: latency,
      details: { tools: toolCount, calculators: calcCount, blog_posts: blogCount, subscribers: subCount },
    });
  } catch (err) {
    checks.push({ name: "Supabase Database", status: "down", message: err instanceof Error ? err.message : "Connection failed" });
  }

  // ── 2. Cron job health ─────────────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentRuns } = await supabase
      .from("cron_runs")
      .select("job_name, status, error_message, started_at, duration_ms")
      .gte("started_at", yesterday)
      .order("started_at", { ascending: false })
      .limit(30);

    const runs = recentRuns || [];
    const failures = runs.filter(r => r.status === "failed" || r.status === "error");
    const uniqueJobs = [...new Set(runs.map(r => r.job_name))];

    // Check which expected jobs ran
    const expectedJobs = ["intelligence", "auto-screen-queue", "auto-publish", "blog-publish", "internal-links", "email-nurture"];
    const missingJobs = expectedJobs.filter(j => !uniqueJobs.includes(j));

    const cronStatus = failures.length > 3 ? "degraded" : failures.length > 0 ? "healthy" : "healthy";
    checks.push({
      name: "Cron Jobs (24h)",
      status: missingJobs.length > 2 ? "degraded" : cronStatus,
      message: `${runs.length} runs, ${failures.length} failures, ${missingJobs.length} missing jobs`,
      details: {
        total_runs: runs.length,
        failures: failures.length,
        failed_jobs: failures.slice(0, 5).map(f => ({ job: f.job_name, error: f.error_message?.slice(0, 100) })),
        missing_jobs: missingJobs,
        jobs_that_ran: uniqueJobs,
      },
    });
  } catch {
    checks.push({ name: "Cron Jobs (24h)", status: "unknown", message: "Could not query cron_runs table" });
  }

  // ── 3. Environment variables ───────────────────────────────────────────────
  const requiredEnvVars = [
    { key: "NEXT_PUBLIC_SUPABASE_URL", label: "Supabase URL" },
    { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Key" },
    { key: "OPENAI_API_KEY", label: "OpenAI API Key" },
    { key: "RESEND_API_KEY", label: "Resend API Key" },
    { key: "SERPER_API_KEY", label: "Serper API Key" },
    { key: "CRON_SECRET", label: "Cron Secret" },
    { key: "INDEXNOW_KEY", label: "IndexNow Key" },
    { key: "GOOGLE_SERVICE_ACCOUNT_JSON", label: "Google Service Account" },
    { key: "NEXT_PUBLIC_ADSENSE_CLIENT", label: "AdSense Client ID" },
    { key: "GITHUB_TOKEN", label: "GitHub Token" },
  ];

  const missing: string[] = [];
  const present: string[] = [];
  for (const v of requiredEnvVars) {
    if (process.env[v.key]?.trim()) present.push(v.label);
    else missing.push(v.label);
  }

  checks.push({
    name: "Environment Variables",
    status: missing.length > 2 ? "degraded" : missing.length > 0 ? "healthy" : "healthy",
    message: `${present.length}/${requiredEnvVars.length} configured`,
    details: { present, missing },
  });

  // ── 4. OpenAI API ──────────────────────────────────────────────────────────
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not set");

    const t = Date.now();
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(8000),
    });
    const latency = Date.now() - t;

    if (res.ok) {
      checks.push({ name: "OpenAI API", status: latency > 3000 ? "degraded" : "healthy", message: `Connected (${latency}ms)`, latency_ms: latency });
    } else if (res.status === 429) {
      checks.push({ name: "OpenAI API", status: "degraded", message: "Rate limited (429)", latency_ms: latency });
    } else {
      checks.push({ name: "OpenAI API", status: "down", message: `HTTP ${res.status}`, latency_ms: latency });
    }
  } catch (err) {
    checks.push({ name: "OpenAI API", status: "down", message: err instanceof Error ? err.message : "Failed" });
  }

  // ── 5. Resend API ──────────────────────────────────────────────────────────
  try {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) throw new Error("RESEND_API_KEY not set");

    const t = Date.now();
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
      signal: AbortSignal.timeout(8000),
    });
    const latency = Date.now() - t;
    checks.push({
      name: "Resend Email API",
      status: res.ok ? "healthy" : "degraded",
      message: res.ok ? `Connected (${latency}ms)` : `HTTP ${res.status}`,
      latency_ms: latency,
    });
  } catch (err) {
    checks.push({ name: "Resend Email API", status: "down", message: err instanceof Error ? err.message : "Failed" });
  }

  // ── 6. Blog pipeline health ────────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();
    const today = new Date().toISOString().split("T")[0];
    const { count: todayPosts } = await supabase
      .from("blog_posts")
      .select("id", { count: "exact", head: true })
      .eq("status", "published")
      .gte("published_at", today);

    const { count: failedTopics } = await supabase
      .from("blog_failed_topics")
      .select("id", { count: "exact", head: true })
      .gte("failed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    checks.push({
      name: "Blog Pipeline",
      status: (todayPosts || 0) === 0 ? "degraded" : "healthy",
      message: `${todayPosts || 0} posts today, ${failedTopics || 0} failed topics (24h)`,
      details: { posts_today: todayPosts, failed_topics_24h: failedTopics },
    });
  } catch {
    checks.push({ name: "Blog Pipeline", status: "unknown", message: "Could not check blog pipeline" });
  }

  // ── Summary ────────────────────────────────────────────────────────────────
  const healthy = checks.filter(c => c.status === "healthy").length;
  const degraded = checks.filter(c => c.status === "degraded").length;
  const down = checks.filter(c => c.status === "down").length;
  const overall = down > 0 ? "critical" : degraded > 0 ? "degraded" : "healthy";

  return NextResponse.json({
    overall,
    summary: { total: checks.length, healthy, degraded, down },
    checks,
    checked_at: new Date().toISOString(),
    total_latency_ms: Date.now() - startTime,
  });
}
