type ToolLike = {
  name?: string | null;
  slug?: string | null;
  description?: string | null;
  engine_type?: string | null;
  engine_config?: Record<string, unknown> | null;
  external_url?: string | null;
  is_placeholder?: boolean | null;
  type?: string | null;
};

function asText(item: ToolLike) {
  return `${item.name || ""} ${item.slug || ""} ${item.description || ""}`.toLowerCase();
}

export function resolveToolEngineType(item: ToolLike): string | null {
  if (item.engine_type && String(item.engine_type).trim()) {
    return String(item.engine_type).trim();
  }

  const text = asText(item);

  if (text.includes("password strength")) return "password-strength-checker";
  if (text.includes("password generator")) return "password-generator";
  if (text.includes("json")) return "json-formatter";
  if (text.includes("word counter") || text.includes("character counter")) return "word-counter";
  if (text.includes("slug")) return "slug-generator";
  if (text.includes("base64 decoder")) return "base64-decoder";
  if (text.includes("base64 encoder")) return "base64-encoder";
  if (text.includes("currency converter")) return "currency-converter";
  if (text.includes("uuid")) return "uuid-generator";
  if (text.includes("regex")) return "regex-tester";
  if (text.includes("timestamp")) return "timestamp-converter";
  if (text.includes("md5")) return "md5-generator";
  if (text.includes("sha256") || text.includes("sha 256")) return "sha256-generator";
  if (text.includes("binary to text")) return "binary-to-text";
  if (text.includes("text to binary")) return "text-to-binary";
  if (text.includes("hex to rgb")) return "hex-to-rgb";
  if (text.includes("rgb to hex")) return "rgb-to-hex";
  if (text.includes("random string")) return "random-string-generator";
  if (text.includes("prompt") || text.includes("openai") || text.includes("ai ")) {
    return "openai-text-tool";
  }

  return null;
}

export function isToolPlaceholder(item: ToolLike): boolean {
  if (!item) return true;
  if (item.is_placeholder === true) return true;

  const engineType = resolveToolEngineType(item);
  const externalOnly = Boolean(item.external_url) && !engineType;

  if (externalOnly) return true;

  const text = asText(item);

  if (text.includes("coming soon")) return true;
  if (text.includes("placeholder")) return true;
  if (text.includes("under construction")) return true;

  return false;
}

export function isToolVisible(item: ToolLike): boolean {
  if (!item) return false;
  return !isToolPlaceholder(item);
}

export function isToolPubliclyVisible(item: ToolLike): boolean {
  return isToolVisible(item);
}

export function filterVisibleTools<T extends ToolLike>(items: T[]): T[] {
  if (!Array.isArray(items)) return [];
  return items.filter((item) => isToolPubliclyVisible(item));
}