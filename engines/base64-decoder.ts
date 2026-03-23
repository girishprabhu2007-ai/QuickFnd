import type { ToolEngineDefinition } from "./types";

function fromBase64Unicode(value: string) {
  return decodeURIComponent(escape(atob(value)));
}

const engine: ToolEngineDefinition = {
  engineType: "base64-decoder",
  title: "Base64 Decoder",
  description: "Decode Base64 text using a reusable engine plugin.",
  inputLabel: "Base64 Input",
  inputPlaceholder: "Enter Base64 text to decode",
  outputLabel: "Decoded Text",
  actionLabel: "Decode",
  run(input: string) {
    const value = String(input || "").trim();

    if (!value) {
      return {
        error: "Please enter Base64 text first.",
      };
    }

    try {
      return {
        output: fromBase64Unicode(value),
        meta: [
          { label: "Status", value: "Decoded" },
        ],
      };
    } catch {
      return {
        error: "Invalid Base64 input.",
      };
    }
  },
};

export default engine;