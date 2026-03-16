import type { ToolEngineDefinition } from "./types";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

const engine: ToolEngineDefinition = {
  engineType: "slug-generator",
  title: "Slug Generator",
  description: "Convert text into a clean URL slug using a reusable engine plugin.",
  inputLabel: "Text",
  inputPlaceholder: "Enter title or text here",
  outputLabel: "Generated Slug",
  actionLabel: "Generate Slug",
  run(input: string) {
    const value = String(input || "");

    if (!value.trim()) {
      return {
        error: "Please enter some text first.",
      };
    }

    const slug = slugify(value);

    return {
      output: slug,
      meta: [
        { label: "Length", value: slug.length },
      ],
    };
  },
};

export default engine;