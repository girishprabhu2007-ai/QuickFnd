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
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex" />
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, -apple-system, sans-serif; background: #f8fafc; }
          .wrapper { display: flex; flex-direction: column; min-height: 100vh; }
          .header { background: #0f172a; color: white; padding: 10px 16px; display: flex; align-items: center; justify-content: space-between; }
          .logo { font-size: 14px; font-weight: 700; text-decoration: none; color: white; }
          .logo span { color: #a78bfa; }
          .attribution { font-size: 11px; color: rgba(255,255,255,0.5); }
          .attribution a { color: #c4b5fd; text-decoration: none; }
          .content { flex: 1; padding: 0; }
          iframe { width: 100%; height: calc(100vh - 80px); border: none; display: block; }
          .footer { background: #0f172a; color: rgba(255,255,255,0.5); padding: 8px 16px; font-size: 11px; display: flex; align-items: center; justify-content: space-between; }
          .footer a { color: #c4b5fd; text-decoration: none; }
        `}</style>
      </head>
      <body>
        <div className="wrapper">
          <div className="header">
            <a href="https://quickfnd.com" target="_blank" rel="noopener" className="logo">
              Quick<span>Fnd</span>
            </a>
            <span className="attribution">
              Powered by <a href="https://quickfnd.com" target="_blank" rel="noopener">QuickFnd</a>
            </span>
          </div>
          <div className="content">
            <iframe
              src={`https://quickfnd.com/ai-tools/${slug}`}
              title={tool.name}
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          </div>
          <div className="footer">
            <span>{tool.name} — AI-powered tool</span>
            <a href={`https://quickfnd.com/ai-tools/${slug}`} target="_blank" rel="noopener">
              Open full version →
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
