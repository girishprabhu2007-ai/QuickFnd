import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { adminGetAllPosts, adminUpdatePostStatus, adminDeletePost } from "@/lib/blog";
import { generateBlogPost } from "@/lib/blog-generator";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as "draft" | "published" | "archived" | undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  try {
    const result = await adminGetAllPosts({ limit, offset, status: status || undefined });
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as {
      keyword: string;
      tool_slug?: string;
      tool_name?: string;
      source?: "manual" | "auto-pipeline" | "gsc-opportunity";
    };

    if (!body.keyword?.trim()) {
      return NextResponse.json({ error: "keyword is required" }, { status: 400 });
    }

    const result = await generateBlogPost({
      keyword: body.keyword.trim(),
      tool_slug: body.tool_slug,
      tool_name: body.tool_name,
      source: body.source || "manual",
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json() as { id: number; status: "draft" | "published" | "archived" };
    if (!body.id || !body.status) return NextResponse.json({ error: "id and status required" }, { status: 400 });
    await adminUpdatePostStatus(body.id, body.status);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const url = new URL(req.url);
    const id = parseInt(url.searchParams.get("id") || "0");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    await adminDeletePost(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed" }, { status: 500 });
  }
}