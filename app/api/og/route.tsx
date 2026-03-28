import { ImageResponse } from "next/og";

export const runtime = "edge";

// ─── Blog category config ────────────────────────────────────────────────────
const BLOG_COLORS: Record<string, string> = {
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

const BLOG_LABELS: Record<string, string> = {
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

// ─── Tool/calc/AI type config ────────────────────────────────────────────────
const TYPE_CONFIG: Record<string, { accent: string; icon: string; label: string; tagline: string }> = {
  tools: {
    accent: "#3b82f6",
    icon: "🔧",
    label: "FREE TOOL",
    tagline: "Browser-based • No install • Instant results",
  },
  calculators: {
    accent: "#10b981",
    icon: "🧮",
    label: "FREE CALCULATOR",
    tagline: "Accurate calculations • No signup required",
  },
  "ai-tools": {
    accent: "#8b5cf6",
    icon: "✨",
    label: "AI TOOL",
    tagline: "AI-powered • Free to use • Instant output",
  },
  compare: {
    accent: "#f59e0b",
    icon: "⚖️",
    label: "COMPARISON",
    tagline: "Honest pros, cons & verdict",
  },
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "QuickFnd";
  const subtitle = searchParams.get("subtitle") || "Smart online tools and AI utilities";
  const category = searchParams.get("category") || "";
  const author = searchParams.get("author") || "";
  const readingTime = searchParams.get("reading_time") || "";
  const type = searchParams.get("type") || "";
  const likes = searchParams.get("likes") || "";

  const isBlogPost = !!category;
  const isTypedPage = !!type && !!TYPE_CONFIG[type];

  // ── Blog post OG image ─────────────────────────────────────────────────────
  if (isBlogPost) {
    const accent = BLOG_COLORS[category] || "#2563eb";
    const categoryLabel = BLOG_LABELS[category] || "";
    const authorInitials = author
      ? author.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()
      : "";

    return new ImageResponse(
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
        <div style={{ position: "absolute", left: 0, top: 0, width: 8, height: "100%", background: accent, display: "flex" }} />
        <div style={{
          position: "absolute", right: -100, top: -100,
          width: 500, height: 500, borderRadius: "50%",
          background: accent, opacity: 0.07, display: "flex",
        }} />

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

        <div style={{ display: "flex", flexDirection: "column", padding: "40px 60px 40px 52px", flex: 1, justifyContent: "center" }}>
          {categoryLabel && (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
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
          <div style={{
            fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 64,
            fontWeight: 800, lineHeight: 1.1, maxWidth: 900, letterSpacing: "-0.02em",
          }}>
            {title}
          </div>
        </div>

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
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // ── Tool / Calculator / AI Tool OG image ───────────────────────────────────
  if (isTypedPage) {
    const config = TYPE_CONFIG[type];
    const accent = config.accent;
    const likesDisplay = likes
      ? Number(likes) >= 1000
        ? `${(Number(likes) / 1000).toFixed(1).replace(/\.0$/, "")}K`
        : likes
      : "";

    return new ImageResponse(
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0a0e1a 0%, #0f172a 50%, #131b2e 100%)",
          color: "white",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Accent gradient orb top-right */}
        <div style={{
          position: "absolute", right: -80, top: -80,
          width: 420, height: 420, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}22 0%, transparent 70%)`,
          display: "flex",
        }} />

        {/* Accent gradient orb bottom-left */}
        <div style={{
          position: "absolute", left: -60, bottom: -60,
          width: 300, height: 300, borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}15 0%, transparent 70%)`,
          display: "flex",
        }} />

        {/* Left accent bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, width: 6, height: "100%",
          background: `linear-gradient(180deg, ${accent} 0%, ${accent}66 100%)`,
          display: "flex",
        }} />

        {/* Top bar — logo + type badge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "32px 56px 24px 48px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10,
              background: `linear-gradient(135deg, ${accent} 0%, ${accent}cc 100%)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 22, fontWeight: 900, color: "white",
            }}>Q</div>
            <span style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.01em" }}>
              Quick<span style={{ color: accent }}>Fnd</span>
            </span>
          </div>

          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: `${accent}18`,
            border: `1.5px solid ${accent}44`,
            borderRadius: 24, padding: "8px 20px",
          }}>
            <span style={{ fontSize: 16 }}>{config.icon}</span>
            <span style={{
              fontSize: 13, fontWeight: 700, color: accent,
              letterSpacing: "0.1em",
            }}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Main content — title + subtitle */}
        <div style={{
          display: "flex", flexDirection: "column",
          padding: "20px 56px 20px 48px", flex: 1, justifyContent: "center",
          gap: 20,
        }}>
          <div style={{
            fontSize: title.length > 55 ? 46 : title.length > 35 ? 54 : 62,
            fontWeight: 800, lineHeight: 1.08, maxWidth: 920,
            letterSpacing: "-0.025em",
          }}>
            {title}
          </div>

          {subtitle && (
            <div style={{
              fontSize: 22, lineHeight: 1.45, maxWidth: 780,
              color: "rgba(255,255,255,0.6)",
              letterSpacing: "-0.01em",
            }}>
              {subtitle.length > 120 ? subtitle.slice(0, 117) + "..." : subtitle}
            </div>
          )}
        </div>

        {/* Bottom bar — tagline + likes */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 56px 28px 48px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: accent,
              display: "flex",
            }} />
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", letterSpacing: "0.02em" }}>
              {config.tagline}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {likesDisplay && (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>❤️</span>
                <span style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>
                  {likesDisplay}
                </span>
              </div>
            )}
            <span style={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
              quickfnd.com
            </span>
          </div>
        </div>
      </div>,
      { width: 1200, height: 630 }
    );
  }

  // ── Default OG image (homepage / fallback) ─────────────────────────────────
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "linear-gradient(145deg, #0a0e1a 0%, #0f172a 50%, #131b2e 100%)",
        color: "white",
        fontFamily: "sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{
        position: "absolute", right: -100, top: -100,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, #3b82f622 0%, transparent 70%)",
        display: "flex",
      }} />
      <div style={{
        position: "absolute", left: -60, bottom: -60,
        width: 350, height: 350, borderRadius: "50%",
        background: "radial-gradient(circle, #8b5cf615 0%, transparent 70%)",
        display: "flex",
      }} />

      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "48px 56px 0 56px",
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 26, fontWeight: 900,
        }}>Q</div>
        <span style={{ fontSize: 28, fontWeight: 700 }}>
          Quick<span style={{ color: "#3b82f6" }}>Fnd</span>
        </span>
      </div>

      <div style={{
        display: "flex", flexDirection: "column", gap: 20,
        padding: "0 56px",
      }}>
        <div style={{
          fontSize: title.length > 50 ? 52 : 64,
          fontWeight: 800, lineHeight: 1.08, maxWidth: 920,
          letterSpacing: "-0.025em",
        }}>
          {title}
        </div>
        <div style={{
          fontSize: 26, lineHeight: 1.4,
          color: "rgba(255,255,255,0.65)", maxWidth: 800,
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 56px 40px 56px",
      }}>
        <div style={{ display: "flex", gap: 12 }}>
          {["🔧 Tools", "🧮 Calculators", "✨ AI"].map((label) => (
            <div key={label} style={{
              fontSize: 14, padding: "6px 14px",
              background: "rgba(255,255,255,0.08)",
              borderRadius: 20, color: "rgba(255,255,255,0.6)",
            }}>
              {label}
            </div>
          ))}
        </div>
        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.3)" }}>
          quickfnd.com
        </span>
      </div>
    </div>,
    { width: 1200, height: 630 }
  );
}