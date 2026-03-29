import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url required" }, { status: 400 });

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "QuickFnd-Admin-Checker/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) return NextResponse.json({ status: "404", code: 404 });

    const text = await res.text();

    // Detect placeholder — tool page with no working UI
    // A page is a "placeholder" if it has the generic directory placeholder text
    // and does NOT have any real tool renderer markers
    const hasPlaceholderText =
      text.includes("This utility is available as an indexable QuickFnd tool entry") ||
      text.includes("Tool ready — the live interactive version");

    // Real tool renderers leave these markers in SSR output
    const hasRealRenderer =
      text.includes("Tool Workspace") ||
      text.includes("video-to-gif") ||
      text.includes("gif-maker") ||
      text.includes("video-compressor") ||
      text.includes("VideoToolRenderer") ||
      text.includes("FileToolRenderer") ||
      text.includes("PDFToolRenderer") ||
      text.includes("BuiltInCalculatorClient") ||
      text.includes("UniversalToolEngineRenderer") ||
      text.includes("AIToolRenderer") ||
      text.includes("CurrencyConverterClient") ||
      text.includes("PasswordStrengthChecker") ||
      text.includes("data-tool-renderer");

    const isPlaceholder = hasPlaceholderText && !hasRealRenderer;

    return NextResponse.json({
      status: isPlaceholder ? "placeholder" : "ok",
      code: res.status,
    });
  } catch {
    return NextResponse.json({ status: "404", code: 0 });
  }
}
