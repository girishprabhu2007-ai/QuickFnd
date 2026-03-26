import { ImageResponse } from "next/og";

export const runtime = "edge";

const CATEGORY_COLORS: Record<string, string> = {
  "how-to": "#3b82f6",
  "tools-guide": "#8b5cf6",
  "calculator-guide": "#10b981",
  "developer-guide": "#6366f1",
  "finance-guide": "#059669",
  "seo-guide": "#f97316",
  "ai-guide": "#f59e0b",
  "comparison": "#ef4444",
  "pillar": "#0ea5e9",
};

const CATEGORY_LABELS: Record<string, string> = {
  "how-to": "How-To Guide",
  "tools-guide": "Tools Guide",
  "calculator-guide": "Calculator Guide",
  "developer-guide": "Developer Guide",
  "finance-guide": "Finance Guide",
  "seo-guide": "SEO Guide",
  "ai-guide": "AI Guide",
  "comparison": "Comparison",
  "pillar": "Complete Guide",
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "QuickFnd";
  const subtitle = searchParams.get("subtitle") || "Smart online tools and AI utilities";
  const category = searchParams.get("category") || "";
  const author = searchParams.get("author") || "";
  const readingTime = searchParams.get("reading_time") || "";

  const isBlogPost = !!category;
  const accent = CATEGORY_COLORS[category] || "#2563eb";
  const categoryLabel = CATEGORY_LABELS[category] || "";
  const authorInitials = author
    ? author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
    : "";

  return new ImageResponse(
    isBlogPost ? (
      // ── Blog post OG image ─────────────────────────────────────────────────
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0e1a 0%, #0f172a 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Accent bar left */}
        <div style={{ position: "absolute", left: 0, top: 0, width: 8, height: "100%", background: accent, display: "flex" }} />

        {/* Glow effect */}
        <div style={{
          position: "absolute", right: -100, top: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: accent, opacity: 0.07, display: "flex",
        }} />

        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "28px 60px 28px 52px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: accent, display: "flex",
              alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 900,
            }}>Q</div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>
              Quick<span style={{ color: accent }}>Fnd</span>
            </span>
          </div>
          <span style={{ fontSize: 14, opacity: 0.35 }}>quickfnd.com/blog</span>
        </div>

        {/* Main content */}
        <div style={{ display: "flex", flexDirection: "column", padding: "40px 60px 40px 52px", flex: 1, justifyContent: "center" }}>
          {/* Category badge */}
          {categoryLabel && (
            <div style={{
              display: "flex", alignItems: "center",
              marginBottom: 24,
            }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: accent,
                border: `1.5px solid ${accent}`,
                borderRadius: 20, padding: "6px 16px",
                letterSpacing: "0.08em",
                background: `${accent}18`,
              }}>
                {categoryLabel.toUpperCase()}
              </div>
            </div>
          )}

          {/* Title */}
          <div style={{
            fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 64,
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: 900,
            letterSpacing: "-0.02em",
          }}>
            {title}
          </div>
        </div>

        {/* Bottom bar — author + reading time */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 60px 20px 52px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {authorInitials && (
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: `${accent}30`, border: `1.5px solid ${accent}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 700, color: accent,
              }}>
                {authorInitials}
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column" }}>
              {author && <span style={{ fontSize: 15, opacity: 0.9 }}>{author}</span>}
              {readingTime && <span style={{ fontSize: 13, opacity: 0.45 }}>{readingTime} min read</span>}
            </div>
          </div>
        </div>
      </div>
    ) : (
      // ── Default OG image (tools/homepage) — original design ───────────────
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #2563eb 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 700, opacity: 0.9 }}>
          QuickFnd
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.1, maxWidth: "920px" }}>
            {title}
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.4, color: "rgba(255,255,255,0.85)", maxWidth: "860px" }}>
            {subtitle}
          </div>
        </div>
        <div style={{ fontSize: 24, color: "rgba(255,255,255,0.75)" }}>
          quickfnd.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}