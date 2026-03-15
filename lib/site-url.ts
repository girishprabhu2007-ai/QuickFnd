const DEFAULT_PRODUCTION_URL = "https://quick-fnd-b5xf.vercel.app";

function normalizeUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const withProtocol =
    trimmed.startsWith("http://") || trimmed.startsWith("https://")
      ? trimmed
      : `https://${trimmed}`;

  return withProtocol.replace(/\/+$/, "");
}

function isPreviewLikeHost(hostname: string) {
  return (
    hostname.includes("---") ||
    hostname.startsWith("quick-fnd-git-") ||
    hostname !== "quick-fnd-b5xf.vercel.app"
  );
}

export function getSiteUrl() {
  const explicit =
    normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeUrl(process.env.SITE_URL);

  if (explicit) {
    return explicit;
  }

  const production =
    normalizeUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL);

  if (production) {
    return production;
  }

  const currentDeployment =
    normalizeUrl(process.env.VERCEL_URL) ||
    normalizeUrl(process.env.NEXT_PUBLIC_VERCEL_URL);

  if (currentDeployment) {
    try {
      const hostname = new URL(currentDeployment).hostname;

      if (hostname === "quick-fnd-b5xf.vercel.app") {
        return DEFAULT_PRODUCTION_URL;
      }

      if (hostname.endsWith(".vercel.app") && isPreviewLikeHost(hostname)) {
        return DEFAULT_PRODUCTION_URL;
      }

      return currentDeployment;
    } catch {
      return DEFAULT_PRODUCTION_URL;
    }
  }

  return DEFAULT_PRODUCTION_URL;
}