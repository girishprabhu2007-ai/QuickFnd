import type { ToolEngineDefinition } from "./types";

function toBase64Unicode(value: string) {
  return btoa(unescape(encodeURIComponent(value)));
}

const engine: ToolEngineDefinition = {
  engineType: "base64-encoder",
  title: "Base64 Encoder",
  description: "Encode text to Base64 using a reusable engine plugin.",
  inputLabel: "Plain Text",
  inputPlaceholder: "Enter text to encode",
  outputLabel: "Base64 Output",
  actionLabel: "Encode",
  run(input: string) {
    const value = String(input || "");

    if (!value) {
      return {
        error: "Please enter text first.",
      };
    }

    try {
      return {
        output: toBase64Unicode(value),
        meta: [
          { label: "Input Length", value: value.length },
        ],
      };
    } catch {
      return {
        error: "Could not encode this text.",
      };
    }
  },
};

export default engine;