import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const title = searchParams.get("title") || "QuickFnd";
  const subtitle = searchParams.get("subtitle") || "Smart online tools and AI utilities";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #2563eb 100%)",
          color: "white",
          padding: "64px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            opacity: 0.9,
          }}
        >
          QuickFnd
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 800,
              lineHeight: 1.1,
              maxWidth: "920px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "rgba(255,255,255,0.85)",
              maxWidth: "860px",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.75)",
          }}
        >
          quick-fnd-b5xf.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}