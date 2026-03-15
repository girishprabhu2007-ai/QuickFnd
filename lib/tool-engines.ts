export type ToolEngineType =
  | "uuid-generator"
  | "slug-generator"
  | "random-string-generator"
  | "base64-encoder"
  | "base64-decoder"
  | "url-encoder"
  | "url-decoder"
  | "text-case-converter"
  | null;

export function getToolEngineType(slug: string): ToolEngineType {
  const value = String(slug || "").toLowerCase();

  if (value === "uuid-generator" || value.includes("uuid")) {
    return "uuid-generator";
  }

  if (
    value === "slug-generator" ||
    value.includes("slug-generator") ||
    (value.includes("slug") && value.includes("generator"))
  ) {
    return "slug-generator";
  }

  if (
    value === "random-string-generator" ||
    value.includes("random-string") ||
    value.includes("string-generator")
  ) {
    return "random-string-generator";
  }

  if (value === "base64-encoder" || value.includes("base64-encoder")) {
    return "base64-encoder";
  }

  if (value === "base64-decoder" || value.includes("base64-decoder")) {
    return "base64-decoder";
  }

  if (value === "url-encoder" || value.includes("url-encoder")) {
    return "url-encoder";
  }

  if (value === "url-decoder" || value.includes("url-decoder")) {
    return "url-decoder";
  }

  if (
    value === "text-case-converter" ||
    value.includes("text-case-converter") ||
    value.includes("case-converter")
  ) {
    return "text-case-converter";
  }

  return null;
}

export function supportsWorkingToolEngine(slug: string) {
  return getToolEngineType(slug) !== null;
}