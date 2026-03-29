import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getContentItem } from "@/lib/db";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getContentItem("ai_tools", slug);
  return {
    title: tool?.name || "QuickFnd AI Tool",
    robots: { index: false },
  };
}

export default async function EmbedAIToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = await getContentItem("ai_tools", slug);
  if (!tool) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ background: "#0f172a", color: "white", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <a href="https://quickfnd.com" target="_blank" rel="noopener" style={{ fontSize: 14, fontWeight: 700, textDecoration: "none", color: "white" }}>
          Quick<span style={{ color: "#a78bfa" }}>Fnd</span>
        </a>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
          Powered by <a href="https://quickfnd.com" target="_blank" rel="noopener" style={{ color: "#c4b5fd", textDecoration: "none" }}>QuickFnd</a>
        </span>
      </div>
      <div style={{ flex: 1 }}>
        <iframe
          src={`https://quickfnd.com/ai-tools/${slug}`}
          title={tool.name}
          sandbox="allow-scripts allow-same-origin allow-forms"
          style={{ width: "100%", height: "calc(100vh - 80px)", border: "none", display: "block" }}
        />
      </div>
      <div style={{ background: "#0f172a", color: "rgba(255,255,255,0.5)", padding: "8px 16px", fontSize: 11, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{tool.name} — AI-powered tool</span>
        <a href={`https://quickfnd.com/ai-tools/${slug}`} target="_blank" rel="noopener" style={{ color: "#c4b5fd", textDecoration: "none" }}>
          Open full version →
        </a>
      </div>
    </div>
  );
}
