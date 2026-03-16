import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "@/components/seo/JsonLd";
import PublicDetailPage from "@/components/seo/PublicDetailPage";
import BuiltInToolClient from "@/components/tools/BuiltInToolClient";
import { getContentItem, getRelatedContent } from "@/lib/db";
import { buildMetaDescription, buildPageTitle } from "@/lib/content-pages";
import {
  buildBreadcrumbSchema,
  buildFaqSchema,
  buildSoftwareSchema,
} from "@/lib/seo-content";
import { getSiteUrl } from "@/lib/site-url";
import { loadEngine } from "@/lib/engine-loader";

type Props = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getContentItem("tools", slug);

  if (!item) {
    return {
      title: "Tool Not Found | QuickFnd",
      description: "The requested tool could not be found.",
    };
  }

  const siteUrl = getSiteUrl();
  const url = `${siteUrl}/tools/${item.slug}`;
  const title = buildPageTitle(item, "tools");
  const description = buildMetaDescription(item, "tools");
  const ogImage = `${siteUrl}/api/og?title=${encodeURIComponent(
    item.name
  )}&subtitle=${encodeURIComponent(description)}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "QuickFnd",
      type: "website",
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function UnsupportedToolEngine({
  toolName,
  engineType,
}: {
  toolName: string;
  engineType: string;
}) {
  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">{toolName}</h2>

      <div className="mt-5 rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
        This tool page exists, but its engine is not available yet.
      </div>

      <div className="mt-4 rounded-xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
        <strong className="text-q-text">Expected engine:</strong>{" "}
        {engineType || "No engine_type set"}
      </div>

      <div className="mt-4 text-sm text-q-muted">
        To activate this tool, create the matching engine file in:
        <div className="mt-2 rounded-xl border border-q-border bg-q-bg px-4 py-3 font-mono text-q-text">
          /engines/{engineType || "your-engine-name"}.ts
        </div>
      </div>
    </section>
  );
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getContentItem("tools", slug);

  if (!item) {
    notFound();
  }

  const relatedItems = await getRelatedContent("tools", item.related_slugs, item.slug);

  const engineType =
    typeof item.engine_type === "string" ? item.engine_type.trim() : "";

  const engine = engineType ? await loadEngine(engineType) : null;

  return (
    <>
      <JsonLd id="tool-breadcrumb-schema" data={buildBreadcrumbSchema("tools", item)} />
      <JsonLd id="tool-faq-schema" data={buildFaqSchema("tools", item)} />
      <JsonLd id="tool-software-schema" data={buildSoftwareSchema("tools", item)} />

      <PublicDetailPage
        table="tools"
        item={item}
        relatedItems={relatedItems}
        primaryContent={
          engine ? (
            <BuiltInToolClient item={item} />
          ) : (
            <UnsupportedToolEngine toolName={item.name} engineType={engineType} />
          )
        }
      />
    </>
  );
}