import { notFound } from "next/navigation";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import AIToolRenderer from "@/components/ai/AIToolRenderer";
import { getSupabaseAdmin } from "@/lib/admin-publishing";
import type { PublicContentItem } from "@/lib/content-pages";
import type { EngineType } from "@/lib/engine-metadata";

type Props = {
  params: Promise<{ slug: string }>;
};

type AIRow = {
  id?: number;
  name: string;
  slug: string;
  description: string | null;
  engine_type: string | null;
  engine_config: Record<string, unknown> | null;
  related_slugs?: string[] | null;
  faqs?: unknown;
  benefits?: unknown;
  how_to_steps?: unknown;
};

function toPublicContentItem(row: AIRow): PublicContentItem {
  return {
    ...(row as unknown as PublicContentItem),
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    engine_type: (row.engine_type || null) as EngineType | null,
    engine_config: row.engine_config || {},
    related_slugs: Array.isArray(row.related_slugs) ? row.related_slugs : [],
  };
}

export default async function AIToolPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data: row, error } = await supabase
    .from("ai_tools")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const item = toPublicContentItem(row as AIRow);

  const { data: relatedRows } = await supabase
    .from("ai_tools")
    .select("*")
    .neq("slug", slug)
    .limit(6);

  const relatedItems = Array.isArray(relatedRows)
    ? relatedRows.map((relatedRow) => toPublicContentItem(relatedRow as AIRow))
    : [];

  return (
    <PublicDetailPage
      table="ai_tools"
      item={item}
      relatedItems={relatedItems}
      primaryContent={<AIToolRenderer item={item} />}
    />
  );
}