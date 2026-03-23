import type { ToolEngineDefinition } from "./types";

const engine: ToolEngineDefinition = {
  engineType: "word-counter",
  title: "Word Counter",
  description: "Count words, characters, and paragraphs using a reusable engine plugin.",
  inputLabel: "Text",
  inputPlaceholder: "Paste your text here",
  outputLabel: "Summary",
  actionLabel: "Count Words",
  run(input: string) {
    const text = String(input || "");
    const trimmed = text.trim();

    const words = trimmed ? trimmed.split(/\s+/).length : 0;
    const characters = text.length;
    const charactersNoSpaces = text.replace(/\s/g, "").length;
    const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter(Boolean).length : 0;

    return {
      output: `This text contains ${words} word(s).`,
      meta: [
        { label: "Words", value: words },
        { label: "Characters", value: characters },
        { label: "No Spaces", value: charactersNoSpaces },
        { label: "Paragraphs", value: paragraphs },
      ],
    };
  },
};

export default engine;