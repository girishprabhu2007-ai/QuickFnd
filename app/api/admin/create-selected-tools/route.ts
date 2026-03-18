import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
} from "@/lib/admin-publishing";
import { normalizeSelectedDemandTools } from "@/lib/tool-demand-engine";

type RequestBody = {
  items?: unknown;
};

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const items = normalizeSelectedDemandTools(body.items);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No valid items were provided." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const created: { name: string; slug: string; engine_type: string; content_type: string }[] = [];
    const skipped: { slug: string; reason: string }[] = [];

    for (const item of items) {
      const lookupType =
        item.content_type === "tools"
          ? "tool"
          : item.content_type === "calculators"
          ? "calculator"
          : "ai_tool";

      const existing = await findExistingBySlug(lookupType as any, item.slug);

      if (existing) {
        skipped.push({
          slug: item.slug,
          reason: "already-exists",
        });
        continue;
      }

      const uniqueSlug = await ensureUniqueSlug(lookupType as any, item.slug);

      if (item.content_type === "tools") {
        const { error } = await supabaseAdmin.from("tools").insert([
          {
            name: item.name,
            slug: uniqueSlug,
            description: item.description,
            related_slugs: item.related_slugs,
            engine_type: item.engine_type,
            engine_config: item.engine_config,
          },
        ]);

        if (error) {
          skipped.push({
            slug: item.slug,
            reason: error.message,
          });
          continue;
        }

        created.push({
          name: item.name,
          slug: uniqueSlug,
          engine_type: item.engine_type,
          content_type: item.content_type,
        });

        continue;
      }

      if (item.content_type === "calculators") {
        const { error } = await supabaseAdmin.from("calculators").insert([
          {
            name: item.name,
            slug: uniqueSlug,
            description: item.description,
          },
        ]);

        if (error) {
          skipped.push({
            slug: item.slug,
            reason: error.message,
          });
          continue;
        }

        created.push({
          name: item.name,
          slug: uniqueSlug,
          engine_type: "",
          content_type: item.content_type,
        });

        continue;
      }

      const { error } = await supabaseAdmin.from("ai_tools").insert([
        {
          name: item.name,
          slug: uniqueSlug,
          description: item.description,
        },
      ]);

      if (error) {
        skipped.push({
          slug: item.slug,
          reason: error.message,
        });
        continue;
      }

      created.push({
        name: item.name,
        slug: uniqueSlug,
        engine_type: "",
        content_type: item.content_type,
      });
    }

    return NextResponse.json({
      success: true,
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("create-selected-tools route error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create selected items.",
      },
      { status: 500 }
    );
  }
}