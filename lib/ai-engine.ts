import { getOpenAIClient } from "@/lib/openai-server";

type AIEngineType =
  | "email-writer"
  | "blog-outline"
  | "prompt-generator"
  | "general";

type AIConfig = {
  engineType?: AIEngineType;
  tone?: string;
  audience?: string;
  length?: string;
  purpose?: string;
};

function buildSystemPrompt(input: string, config: AIConfig) {
  const engine = config.engineType || "general";

  switch (engine) {
    case "email-writer":
      return `
You are an expert email writing assistant.

Write a clear, professional, and practical email.

Rules:
- Direct and structured
- No fluff
- Ready to send
- Use subject + body format

User request:
${input}
`;

    case "blog-outline":
      return `
You are a professional content strategist.

Create a structured blog outline.

Rules:
- Use clear H2 and H3 sections
- Logical flow
- SEO-friendly headings
- No unnecessary text

Topic:
${input}
`;

    case "prompt-generator":
      return `
You are an expert in crafting high-quality AI prompts.

Convert the user's idea into a powerful, optimized prompt.

Rules:
- Clear instructions
- Include context
- Include output format
- Ready to paste into AI tools

User idea:
${input}
`;

    default:
      return `
You are a helpful AI assistant.

Provide a high-quality, clear, and useful response.

User input:
${input}
`;
  }
}

export async function runAITool(input: string, config: AIConfig) {
  const openai = getOpenAIClient();

  const systemPrompt = buildSystemPrompt(input, config);

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
    ],
  });

  return response.output_text || "";
}