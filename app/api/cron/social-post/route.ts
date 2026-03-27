/**
 * app/api/cron/social-post/route.ts
 * Auto-posts new blog articles to Twitter/X and LinkedIn.
 *
 * Runs 30 min after blog-publish crons.
 * Uses Twitter API v2 and LinkedIn API.
 *
 * Env vars needed:
 *   TWITTER_BEARER_TOKEN, TWITTER_API_KEY, TWITTER_API_SECRET,
 *   TWITTER_ACCESS_TOKEN, TWITTER_ACCESS_SECRET
 *   LINKEDIN_ACCESS_TOKEN, LINKEDIN_PERSON_ID
 */

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHmac } from "crypto";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SITE_URL = "https://quickfnd.com";

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Twitter OAuth 1.0a helper ─────────────────────────────────────────────────
function buildTwitterOAuth(method: string, url: string, params: Record<string, string>) {
  const nonce = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const timestamp = Math.floor(Date.now() / 1000).toString();

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.TWITTER_API_KEY || "",
    oauth_nonce: nonce,
    oauth_signature_method: "HMAC-SHA1",
    oauth_timestamp: timestamp,
    oauth_token: process.env.TWITTER_ACCESS_TOKEN || "",
    oauth_version: "1.0",
  };

  const allParams = { ...params, ...oauthParams };
  const sortedParams = Object.keys(allParams).sort().map(k =>
    `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`
  ).join("&");

  const baseString = [method.toUpperCase(), encodeURIComponent(url), encodeURIComponent(sortedParams)].join("&");
  const signingKey = `${encodeURIComponent(process.env.TWITTER_API_SECRET || "")}&${encodeURIComponent(process.env.TWITTER_ACCESS_SECRET || "")}`;
  const signature = createHmac("sha1", signingKey).update(baseString).digest("base64");

  oauthParams.oauth_signature = signature;
  const authHeader = "OAuth " + Object.keys(oauthParams).sort().map(k =>
    `${encodeURIComponent(k)}="${encodeURIComponent(oauthParams[k])}"`
  ).join(", ");

  return authHeader;
}

// ── Build tweet text ───────────────────────────────────────────────────────────
function buildTweet(title: string, slug: string, excerpt: string, tags: string[]): string {
  const url = `${SITE_URL}/blog/${slug}`;
  const hashtags = tags.slice(0, 3).map(t => `#${t.replace(/\s+/g, "")}`).join(" ");
  const maxTitleLen = 200 - url.length - hashtags.length - 10;
  const shortTitle = title.length > maxTitleLen ? title.slice(0, maxTitleLen - 3) + "..." : title;
  return `${shortTitle}\n\n${url}\n\n${hashtags}`;
}

// ── Post to Twitter/X ─────────────────────────────────────────────────────────
async function postToTwitter(text: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const hasKeys = process.env.TWITTER_API_KEY && process.env.TWITTER_ACCESS_TOKEN;
  if (!hasKeys) return { success: false, error: "Twitter credentials not configured" };

  try {
    const apiUrl = "https://api.twitter.com/2/tweets";
    const body = JSON.stringify({ text });
    const auth = buildTwitterOAuth("POST", apiUrl, {});

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body,
      signal: AbortSignal.timeout(10000),
    });

    const data = await res.json() as { data?: { id: string }; errors?: { message: string }[] };
    if (!res.ok) return { success: false, error: data.errors?.[0]?.message || `HTTP ${res.status}` };
    return { success: true, id: data.data?.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

// ── Post to LinkedIn ──────────────────────────────────────────────────────────
async function postToLinkedIn(
  title: string,
  slug: string,
  excerpt: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const personId = process.env.LINKEDIN_PERSON_ID;
  if (!token || !personId) return { success: false, error: "LinkedIn credentials not configured" };

  try {
    const url = `${SITE_URL}/blog/${slug}`;
    const commentary = `${title}\n\n${excerpt?.slice(0, 200) || ""}\n\n${url}`;

    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${personId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: commentary },
            shareMediaCategory: "ARTICLE",
            media: [{
              status: "READY",
              originalUrl: url,
              title: { text: title },
              description: { text: excerpt?.slice(0, 256) || "" },
            }],
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err.slice(0, 200) };
    }
    const data = await res.json() as { id: string };
    return { success: true, id: data.id };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function GET(req: Request) {
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");
  if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabase();

  // Find articles published in last 2 hours that haven't been posted to social yet
  const cutoff = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("slug, title, excerpt, tags, published_at, social_posted_at")
    .eq("status", "published")
    .gte("published_at", cutoff)
    .is("social_posted_at", null)
    .order("published_at", { ascending: false })
    .limit(3);

  if (!posts?.length) {
    return NextResponse.json({ success: true, message: "No new posts to share", posted: 0 });
  }

  const results = [];

  for (const post of posts) {
    const tweetText = buildTweet(post.title, post.slug, post.excerpt || "", post.tags || []);
    const [twitter, linkedin] = await Promise.all([
      postToTwitter(tweetText),
      postToLinkedIn(post.title, post.slug, post.excerpt || ""),
    ]);

    // Mark as posted regardless of success (avoid duplicate posts)
    await supabase.from("blog_posts")
      .update({ social_posted_at: new Date().toISOString() })
      .eq("slug", post.slug);

    results.push({
      slug: post.slug,
      title: post.title,
      twitter: twitter.success ? "posted" : twitter.error,
      linkedin: linkedin.success ? "posted" : linkedin.error,
    });

    await new Promise(r => setTimeout(r, 2000));
  }

  return NextResponse.json({ success: true, posted: results.length, results });
}