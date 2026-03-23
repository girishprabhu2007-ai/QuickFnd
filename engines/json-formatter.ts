import type { ToolEngineDefinition } from "./types";

const engine: ToolEngineDefinition = {
  engineType: "json-formatter",
  title: "JSON Formatter",
  description: "Format JSON using a reusable engine plugin.",
  inputLabel: "Raw JSON",
  inputPlaceholder: '{\n  "name": "QuickFnd"\n}',
  outputLabel: "Formatted JSON",
  actionLabel: "Format JSON",
  run(input: string) {
    const value = String(input || "").trim();

    if (!value) {
      return {
        error: "Please paste JSON first.",
      };
    }

    try {
      const parsed = JSON.parse(value);

      return {
        output: JSON.stringify(parsed, null, 2),
        meta: [
          { label: "Status", value: "Valid JSON" },
        ],
      };
    } catch {
      return {
        error: "Invalid JSON. Please check your input.",
      };
    }
  },
};

export default engine;