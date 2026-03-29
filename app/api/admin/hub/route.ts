/**
 * app/api/admin/hub/route.ts
 * ═══════════════════════════════════════════════════════════════════════════════
 * Admin Hub API — combined endpoint for multiple admin features
 *
 * GET  ?view=calendar       — content calendar (published + scheduled items)
 * GET  ?view=notifications  — notification feed (recent events needing attention)
 * GET  ?view=blog-post&id=X — get single blog post for editing
 * POST ?action=edit-blog    — update blog post title/content/excerpt
 * POST ?action=create-comparison — AI-generate a new comparison page
 * POST ?action=save-revenue — save monthly revenue/cost entry
 * GET  ?view=revenue        — get revenue/cost history
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { getOpenAIClient } from "@/lib/openai-server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function GET(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view");
  const supabase = getSupabaseAdmin();

  // ── Content Calendar ───────────────────────────────────────────────────────
  if (view === "calendar") {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString();
    const sevenDaysAhead = new Date(now.getTime() + 7 * 86400000).toISOString();

    const [blogRes, cronRes, compRes] = await Promise.all([
      supabase.from("blog_posts").select("id, slug, title, status, published_at, created_at, source, target_keyword")
        .gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }).limit(100),
      supabase.from("cron_runs").select("job_name, status, items_published, started_at, error_message")
        .eq("job_name", "blog-publish").gte("started_at", thirtyDaysAgo).order("started_at", { ascending: false }).limit(50),
      supabase.from("comparison_pages").select("id, slug, title, status, created_at")
        .order("created_at", { ascending: false }).limit(20),
    ]);

    // Group blog posts by date
    const postsByDate: Record<string, { posts: number; titles: string[] }> = {};
    for (const post of (blogRes.data || [])) {
      const date = (post.published_at || post.created_at || "").split("T")[0];
      if (!date) continue;
      if (!postsByDate[date]) postsByDate[date] = { posts: 0, titles: [] };
      postsByDate[date].posts++;
      postsByDate[date].titles.push(post.title || post.slug);
    }

    return NextResponse.json({
      postsByDate,
      recentPosts: (blogRes.data || []).slice(0, 20),
      cronRuns: cronRes.data || [],
      comparisons: compRes.data || [],
      totalBlogPosts: (blogRes.data || []).length,
    });
  }

  // ── Notification Feed ──────────────────────────────────────────────────────
  if (view === "notifications") {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const [requestsRes, failedCronsRes, newSubsRes, appsRes, failedTopicsRes, guestPostsRes] = await Promise.all([
      supabase.from("tool_requests").select("id, name, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(10),
      supabase.from("cron_runs").select("job_name, error_message, started_at").eq("status", "failed").gte("started_at", threeDaysAgo).order("started_at", { ascending: false }).limit(10),
      supabase.from("email_subscribers").select("id, email, subscribed_at").eq("status", "active").gte("subscribed_at", yesterday).order("subscribed_at", { ascending: false }).limit(10),
      supabase.from("author_applications").select("id, name, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
      supabase.from("blog_failed_topics").select("keyword, slug, error_message, failed_at").gte("failed_at", threeDaysAgo).order("failed_at", { ascending: false }).limit(10),
      supabase.from("guest_posts").select("id, title, created_at").eq("status", "pending").order("created_at", { ascending: false }).limit(5),
    ]);

    type Notification = { type: string; title: string; detail: string; time: string; priority: "high" | "medium" | "low"; href?: string };
    const notifications: Notification[] = [];

    for (const r of (requestsRes.data || [])) {
      notifications.push({ type: "request", title: `New tool request: ${r.name}`, detail: "User requested a new tool", time: r.created_at, priority: "medium", href: "/admin/requests" });
    }
    for (const f of (failedCronsRes.data || [])) {
      notifications.push({ type: "cron-failure", title: `Cron failed: ${f.job_name}`, detail: f.error_message?.slice(0, 100) || "Unknown error", time: f.started_at, priority: "high", href: "/admin/diagnostics" });
    }
    for (const s of (newSubsRes.data || [])) {
      notifications.push({ type: "subscriber", title: `New subscriber: ${s.email}`, detail: "Email subscriber joined", time: s.subscribed_at, priority: "low", href: "/admin/subscribers" });
    }
    for (const a of (appsRes.data || [])) {
      notifications.push({ type: "application", title: `Author application: ${a.name}`, detail: "New author application pending", time: a.created_at, priority: "medium", href: "/admin/applications" });
    }
    for (const t of (failedTopicsRes.data || [])) {
      notifications.push({ type: "blog-failure", title: `Blog topic failed: ${t.keyword}`, detail: t.error_message?.slice(0, 100) || "Quality gate fail", time: t.failed_at, priority: "medium", href: "/admin/blog" });
    }
    for (const g of (guestPostsRes.data || [])) {
      notifications.push({ type: "guest-post", title: `Guest post: ${g.title}`, detail: "Pending review", time: g.created_at, priority: "medium", href: "/admin/guest-posts" });
    }

    // Sort by time descending
    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json({ notifications, counts: {
      requests: (requestsRes.data || []).length,
      cronFailures: (failedCronsRes.data || []).length,
      newSubscribers: (newSubsRes.data || []).length,
      applications: (appsRes.data || []).length,
      failedTopics: (failedTopicsRes.data || []).length,
      guestPosts: (guestPostsRes.data || []).length,
    }});
  }

  // ── Single blog post for editing ───────────────────────────────────────────
  if (view === "blog-post") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", parseInt(id)).single();
    if (error || !data) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({ post: data });
  }

  // ── Revenue history ────────────────────────────────────────────────────────
  if (view === "revenue") {
    const { data } = await supabase.from("revenue_tracker").select("*").order("month", { ascending: false }).limit(24);
    return NextResponse.json({ entries: data || [] });
  }

  return NextResponse.json({ error: "Unknown view" }, { status: 400 });
}

export async function POST(req: Request) {
  const adminUser = await getAdminUser();
  if (!adminUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const supabase = getSupabaseAdmin();

  // ── Edit blog post ─────────────────────────────────────────────────────────
  if (action === "edit-blog") {
    const body = await req.json().catch(() => ({})) as {
      id?: number; title?: string; excerpt?: string; content?: string; meta_title?: string; meta_description?: string;
    };
    if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.excerpt !== undefined) updates.excerpt = body.excerpt;
    if (body.content !== undefined) updates.content = body.content;
    if (body.meta_title !== undefined) updates.meta_title = body.meta_title;
    if (body.meta_description !== undefined) updates.meta_description = body.meta_description;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabase.from("blog_posts").update(updates).eq("id", body.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  }

  // ── Create comparison page ─────────────────────────────────────────────────
  if (action === "create-comparison") {
    const body = await req.json().catch(() => ({})) as {
      tool_a_slug: string; tool_a_name: string;
      tool_b_slug: string; tool_b_name: string;
    };

    if (!body.tool_a_name || !body.tool_b_name) {
      return NextResponse.json({ error: "Both tool names required" }, { status: 400 });
    }

    const slug = `${body.tool_a_slug || body.tool_a_name.toLowerCase().replace(/\s+/g, "-")}-vs-${body.tool_b_slug || body.tool_b_name.toLowerCase().replace(/\s+/g, "-")}`;

    // Check duplicate
    const { data: existing } = await supabase.from("comparison_pages").select("id").eq("slug", slug).maybeSingle();
    if (existing) return NextResponse.json({ error: "This comparison already exists" }, { status: 409 });

    try {
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        max_tokens: 1500,
        messages: [
          { role: "system", content: "You are a product comparison expert. Generate fair, balanced comparisons. Return ONLY valid JSON, no markdown." },
          { role: "user", content: `Compare "${body.tool_a_name}" vs "${body.tool_b_name}" for QuickFnd.com users.

Return a JSON object with:
- "title": string (e.g. "Tool A vs Tool B: Which Is Better in 2026?")
- "meta_title": string (60 chars max)
- "meta_description": string (155 chars max)
- "intro": string (2-3 sentences introducing the comparison)
- "tool_a_pros": string[] (4-5 pros)
- "tool_a_cons": string[] (2-3 cons)
- "tool_b_pros": string[] (4-5 pros)
- "tool_b_cons": string[] (2-3 cons)
- "verdict": string (3-4 sentences, balanced recommendation)
- "faqs": [{"question": string, "answer": string}] (3-4 FAQs)

Return ONLY the JSON.` },
        ],
      });

      const text = completion.choices[0]?.message?.content || "{}";
      const cleaned = text.replace(/```json|```/g, "").trim();
      const generated = JSON.parse(cleaned);

      const { data, error } = await supabase.from("comparison_pages").insert({
        slug,
        title: generated.title || `${body.tool_a_name} vs ${body.tool_b_name}`,
        meta_title: generated.meta_title,
        meta_description: generated.meta_description,
        tool_a_slug: body.tool_a_slug || "",
        tool_a_name: body.tool_a_name,
        tool_a_type: "tool",
        tool_b_slug: body.tool_b_slug || "",
        tool_b_name: body.tool_b_name,
        tool_b_type: "tool",
        intro: generated.intro,
        tool_a_pros: generated.tool_a_pros || [],
        tool_a_cons: generated.tool_a_cons || [],
        tool_b_pros: generated.tool_b_pros || [],
        tool_b_cons: generated.tool_b_cons || [],
        verdict: generated.verdict,
        faqs: generated.faqs || [],
        status: "published",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).select("id, slug, title").single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true, comparison: data });
    } catch (err) {
      return NextResponse.json({ error: err instanceof Error ? err.message : "Generation failed" }, { status: 500 });
    }
  }

  // ── Save revenue entry ─────────────────────────────────────────────────────
  if (action === "save-revenue") {
    const body = await req.json().catch(() => ({})) as {
      month: string; adsense_revenue?: number; affiliate_revenue?: number; other_revenue?: number;
      openai_cost?: number; vercel_cost?: number; supabase_cost?: number; other_cost?: number; notes?: string;
    };

    if (!body.month) return NextResponse.json({ error: "month required (YYYY-MM)" }, { status: 400 });

    const { error } = await supabase.from("revenue_tracker").upsert({
      month: body.month,
      adsense_revenue: body.adsense_revenue || 0,
      affiliate_revenue: body.affiliate_revenue || 0,
      other_revenue: body.other_revenue || 0,
      openai_cost: body.openai_cost || 0,
      vercel_cost: body.vercel_cost || 0,
      supabase_cost: body.supabase_cost || 0,
      other_cost: body.other_cost || 0,
      notes: body.notes || "",
      updated_at: new Date().toISOString(),
    }, { onConflict: "month" });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
