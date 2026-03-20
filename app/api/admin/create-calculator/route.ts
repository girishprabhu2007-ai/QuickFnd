import { NextResponse } from "next/server";
import {
  buildPublicPath,
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
} from "@/lib/admin-publishing";
import { suggestAdminEngine } from "@/lib/admin-engine-assistant";

type RequestBody = {
  name?: string;
  slug?: string;
  description?: string;
  related_slugs?: string[];
};

function normalizeSlug(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function isWeakSlug(slug: string) {
  return slug.length < 5 || !slug.includes("-");
}

function isWeakDescription(description: string) {
  return description.trim().length < 40;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const name = String(body.name || "").trim();
    const slug = normalizeSlug(String(body.slug || name));
    const description = String(body.description || "").trim();
    const relatedSlugs = normalizeStringArray(body.related_slugs);

    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Name, slug, and description are required." },
        { status: 400 }
      );
    }

    if (isWeakSlug(slug) || isWeakDescription(description)) {
      return NextResponse.json(
        {
          error:
            "Calculator is too weak to publish. Use a stronger SEO slug and a more specific description.",
        },
        { status: 400 }
      );
    }

    const suggestion = suggestAdminEngine("calculator", {
      name,
      slug,
      description,
      engine_type: null,
      engine_config: {},
    });

    if (!suggestion.engine_type) {
      return NextResponse.json(
        { error: "No valid calculator engine could be assigned." },
        { status: 400 }
      );
    }

    if (!suggestion.is_supported || suggestion.engine_type === "generic-directory") {
      return NextResponse.json(
        {
          error:
            "This calculator does not match a real supported calculator engine yet. Do not publish it as a fake calculator.",
        },
        { status: 400 }
      );
    }

    const existing = await findExistingBySlug("calculator", slug);
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadyExists: true,
        slug,
        path: buildPublicPath("calculator", slug),
        engine_type: suggestion.engine_type,
        engine_config: suggestion.engine_config,
        engine_reason: suggestion.reason,
      });
    }

    const uniqueSlug = await ensureUniqueSlug("calculator", slug);
    const supabase = getSupabaseAdmin();

    const payload = {
      name,
      slug: uniqueSlug,
      description,
      related_slugs: relatedSlugs,
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
    };

    const { error } = await supabase.from("calculators").insert([payload]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      created: true,
      alreadyExists: false,
      slug: uniqueSlug,
      path: buildPublicPath("calculator", uniqueSlug),
      engine_type: suggestion.engine_type,
      engine_config: suggestion.engine_config,
      engine_reason: suggestion.reason,
      quality: {
        strong_match: suggestion.is_supported,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create calculator.",
      },
      { status: 500 }
    );
  }
}