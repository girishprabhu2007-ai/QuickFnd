import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import {
  ensureUniqueSlug,
  findExistingBySlug,
  getSupabaseAdmin,
} from "@/lib/admin-publishing";
import { getAdminEngineOptions } from "@/lib/admin-engine-assistant";
import type { AdminCategory } from "@/lib/admin-content";

type RequestBody = {
  items?: unknown;
};

type SelectedItem = {
  name: string;
  slug: string;
  description: string;
  related_slugs: string[];
  engine_type: string;
  engine_config: Record<string, unknown>;
  content_type: "tools" | "calculators" | "ai_tools";
};

function slugify(value: string) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => slugify(String(item || "")))
        .filter(Boolean)
        .slice(0, 8)
    )
  );
}

const TOOL_ENGINE_SET = new Set(
  getAdminEngineOptions("tool").map((option) => String(option.value))
);

const CALCULATOR_ENGINE_SET = new Set(
  getAdminEngineOptions("calculator").map((option) => String(option.value))
);

const AI_TOOL_ENGINE_SET = new Set(
  getAdminEngineOptions("ai-tool").map((option) => String(option.value))
);

function inferContentType(
  engineType: string,
  explicit?: unknown
): "tools" | "calculators" | "ai_tools" | null {
  const explicitText = String(explicit || "").trim().toLowerCase();

  if (explicitText === "tools") return "tools";
  if (explicitText === "calculators") return "calculators";
  if (explicitText === "ai_tools") return "ai_tools";

  const engine = String(engineType || "").trim();

  if (!engine) return null;
  if (AI_TOOL_ENGINE_SET.has(engine)) return "ai_tools";
  if (CALCULATOR_ENGINE_SET.has(engine)) return "calculators";
  if (TOOL_ENGINE_SET.has(engine)) return "tools";

  if (engine === "formula-calculator") return "calculators";
  if (engine.startsWith("ai-") || engine === "openai-text-tool") return "ai_tools";
  if (engine.includes("calculator")) return "calculators";

  return "tools";
}

function normalizeSelectedItems(input: unknown): SelectedItem[] {
  if (!Array.isArray(input)) return [];

  const normalized: SelectedItem[] = [];

  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const record = raw as Record<string, unknown>;

    const name = String(record.name || "").trim();
    const slug = slugify(String(record.slug || name));
    const description = String(record.description || "").trim();
    const engine_type = String(record.engine_type || "").trim();

    if (!name || !slug || !engine_type || engine_type === "generic-directory") {
      continue;
    }

    const content_type = inferContentType(engine_type, record.content_type);

    if (!content_type) {
      continue;
    }

    normalized.push({
      name,
      slug,
      description,
      related_slugs: asStringArray(record.related_slugs),
      engine_type,
      engine_config:
        record.engine_config &&
        typeof record.engine_config === "object" &&
        !Array.isArray(record.engine_config)
          ? (record.engine_config as Record<string, unknown>)
          : {},
      content_type,
    });
  }

  return normalized;
}

function mapContentTypeToAdminCategory(
  contentType: "tools" | "calculators" | "ai_tools"
): AdminCategory {
  if (contentType === "tools") return "tool";
  if (contentType === "calculators") return "calculator";
  return "ai-tool";
}

export async function POST(req: Request) {
  try {
    const adminUser = await getAdminUser();

    if (!adminUser) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as RequestBody;
    const items = normalizeSelectedItems(body.items);

    if (items.length === 0) {
      return NextResponse.json(
        { error: "No valid items were provided." },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const created: Array<{
      name: string;
      slug: string;
      engine_type: string;
      content_type: string;
    }> = [];
    const skipped: Array<{ slug: string; reason: string }> = [];

    for (const item of items) {
      const lookupType = mapContentTypeToAdminCategory(item.content_type);

      const existing = await findExistingBySlug(lookupType, item.slug);

      if (existing) {
        skipped.push({
          slug: item.slug,
          reason: "already-exists",
        });
        continue;
      }

      const uniqueSlug = await ensureUniqueSlug(lookupType, item.slug);

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

      const { error } = await supabaseAdmin.from("ai_tools").insert([
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