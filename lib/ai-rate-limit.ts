/**
 * lib/ai-rate-limit.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Protects OpenAI credits from abuse.
 * Uses Supabase to track usage per IP address.
 *
 * Limits:
 *   - 10 AI requests per IP per hour
 *   - 500 max_tokens per response (cost cap)
 *   - $5/day global spend cap (auto-disable when exceeded)
 *
 * No user account needed — IP-based tracking is privacy-friendly
 * and works globally without any signup friction.
 */

import { createClient } from "@supabase/supabase-js";

const HOURLY_LIMIT = 10;    // requests per IP per hour
const DAILY_GLOBAL_CAP = 5; // USD — disable AI tools if daily cost exceeds this

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

function getClientIP(request: Request): string {
  // Check Vercel's forwarded IP headers in order of reliability
  const headers = [
    "x-real-ip",
    "x-forwarded-for",
    "cf-connecting-ip", // Cloudflare
  ];

  for (const header of headers) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for can be comma-separated list — take first
      return value.split(",")[0].trim();
    }
  }

  return "unknown";
}

function getHourBucket(): string {
  const now = new Date();
  return `${now.toISOString().slice(0, 13)}`; // "2026-03-25T14"
}

function getDayBucket(): string {
  return new Date().toISOString().slice(0, 10); // "2026-03-25"
}

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; reason: string; retryAfter: number };

export async function checkAIRateLimit(request: Request): Promise<RateLimitResult> {
  const ip = getClientIP(request);
  const hourBucket = getHourBucket();
  const dayBucket = getDayBucket();
  const supabase = getSupabase();

  try {
    // ── Check 1: Per-IP hourly limit ──────────────────────────────────────
    const { data: ipRecord } = await supabase
      .from("ai_rate_limits")
      .select("count")
      .eq("ip_hash", hashIP(ip))
      .eq("hour_bucket", hourBucket)
      .maybeSingle();

    const currentCount = (ipRecord?.count || 0) as number;

    if (currentCount >= HOURLY_LIMIT) {
      return {
        allowed: false,
        reason: `Hourly limit reached (${HOURLY_LIMIT} AI requests/hour). Please wait before trying again.`,
        retryAfter: 60 - new Date().getMinutes(), // minutes until next hour
      };
    }

    // ── Check 2: Global daily spend cap ──────────────────────────────────
    const { data: globalRecord } = await supabase
      .from("ai_daily_usage")
      .select("estimated_cost_usd")
      .eq("day_bucket", dayBucket)
      .maybeSingle();

    const dailyCost = (globalRecord?.estimated_cost_usd || 0) as number;

    if (dailyCost >= DAILY_GLOBAL_CAP) {
      return {
        allowed: false,
        reason: "AI tools are temporarily unavailable due to high demand. Please try again tomorrow.",
        retryAfter: 24 * 60,
      };
    }

    return {
      allowed: true,
      remaining: HOURLY_LIMIT - currentCount - 1,
    };

  } catch {
    // If rate limit check fails, allow through (don't block users for DB issues)
    return { allowed: true, remaining: HOURLY_LIMIT };
  }
}

export async function recordAIUsage(request: Request, tokensUsed: number): Promise<void> {
  const ip = getClientIP(request);
  const hourBucket = getHourBucket();
  const dayBucket = getDayBucket();
  const supabase = getSupabase();

  // Cost estimate: gpt-4o-mini is ~$0.15 per 1M input + $0.60 per 1M output tokens
  // Rough average: $0.0003 per request
  const estimatedCost = (tokensUsed / 1_000_000) * 0.60;

  try {
    // Update per-IP counter
    await supabase.rpc("increment_ai_rate_limit", {
      p_ip_hash: hashIP(ip),
      p_hour_bucket: hourBucket,
    });

    // Update global daily cost
    await supabase.rpc("increment_ai_daily_cost", {
      p_day_bucket: dayBucket,
      p_cost: estimatedCost,
      p_tokens: tokensUsed,
    });
  } catch {
    // Non-fatal — log but don't break the response
    console.error("Failed to record AI usage");
  }
}

// Simple non-reversible IP hash for privacy
function hashIP(ip: string): string {
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}