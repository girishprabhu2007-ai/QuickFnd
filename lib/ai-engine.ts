import { getOpenAIClient } from "@/lib/openai-server";

type AIEngineType =
  | "email-writer"
  | "blog-outline"
  | "prompt-generator"
  | "general";

type AIConfig = {
  engineType?: AIEngineType;
  task?: string;
  tone?: string;
  audience?: string;
  length?: string;
  purpose?: string;
  outputType?: string;
  // DB-driven fields — when present, systemPrompt takes full control
  systemPrompt?: string;
  buttonLabel?: string;
  outputLabel?: string;
  placeholder?: string;
};

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function resolveEngineType(config: AIConfig): AIEngineType {
  const explicitEngine = normalize(config.engineType);
  const task = normalize(config.task);

  if (explicitEngine === "email-writer") return "email-writer";
  if (explicitEngine === "blog-outline") return "blog-outline";
  if (explicitEngine === "prompt-generator") return "prompt-generator";

  if (task === "email") return "email-writer";
  if (task === "outline") return "blog-outline";
  if (task === "prompt-generator") return "prompt-generator";

  return "general";
}

function buildEmailPrompt(input: string, config: AIConfig) {
  const tone = String(config.tone || "professional").trim();
  const audience = String(config.audience || "").trim();
  const length = String(config.length || "medium").trim();

  return `
You are an expert email writing assistant.

Write a clear, practical, polished email.

Requirements:
- Use exactly this structure:
Subject: <subject line>

Body:
<email body>
- The subject must be concise and relevant.
- The body must be ready to send.
- Do not include explanations before or after the email.
- Do not include markdown fences.
- Keep the tone ${tone}.
- Target audience: ${audience || "general recipient"}.
- Length: ${length}.

User request:
${input}
`.trim();
}

function buildOutlinePrompt(input: string, config: AIConfig) {
  const tone = String(config.tone || "clear").trim();
  const audience = String(config.audience || "").trim();
  const length = String(config.length || "medium").trim();

  return `
You are a professional content strategist.

Create a structured outline.

Requirements:
- Start with a title line.
- Then provide a clean hierarchical outline.
- Use H2 and H3 style labels in plain text.
- Keep the structure logical and useful.
- No intro commentary.
- No markdown fences.
- Tone: ${tone}.
- Target audience: ${audience || "general audience"}.
- Depth: ${length}.

User topic and context:
${input}
`.trim();
}

function buildPromptGeneratorPrompt(input: string, config: AIConfig) {
  const tone = String(config.tone || "clear").trim();
  const audience = String(config.audience || "").trim();
  const length = String(config.length || "medium").trim();

  return `
You are an expert in crafting high-quality AI prompts.

Convert the user's idea into one strong, optimized prompt.

Requirements:
- Return only the final prompt.
- No explanation, no notes, no headings.
- The prompt must be directly usable in another AI tool.
- Include context, constraints, and output expectations where relevant.
- Tone/style goal: ${tone}.
- Intended audience or target system: ${audience || "general AI use"}.
- Detail level: ${length}.

User idea:
${input}
`.trim();
}

function buildGeneralPrompt(input: string, config: AIConfig) {
  const tone = String(config.tone || "professional").trim();
  const audience = String(config.audience || "").trim();
  const length = String(config.length || "medium").trim();

  return `
You are a high-quality AI assistant.

Provide a useful, clear, well-structured response.

Requirements:
- Be direct and user-ready.
- Do not add unnecessary filler.
- Keep the tone ${tone}.
- Target audience: ${audience || "general audience"}.
- Length: ${length}.

User input:
${input}
`.trim();
}

function buildFinalPrompt(input: string, config: AIConfig): string {
  // If a DB-stored systemPrompt exists, use it directly.
  // This makes every auto-generated AI tool behave as its own specialist.
  if (config.systemPrompt && config.systemPrompt.trim().length > 0) {
    const tone = config.tone ? `\nTone: ${config.tone}` : "";
    const audience = config.audience ? `\nTarget audience: ${config.audience}` : "";
    const length = config.length ? `\nLength: ${config.length}` : "";
    return `${config.systemPrompt.trim()}${tone}${audience}${length}\n\nUser input:\n${input}`;
  }

  const engine = resolveEngineType(config);
  switch (engine) {
    case "email-writer":
      return buildEmailPrompt(input, config);
    case "blog-outline":
      return buildOutlinePrompt(input, config);
    case "prompt-generator":
      return buildPromptGeneratorPrompt(input, config);
    default:
      return buildGeneralPrompt(input, config);
  }
}

export async function runAITool(input: string, config: AIConfig) {
  const openai = getOpenAIClient();
  const prompt = buildFinalPrompt(input, config);

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [{ role: "system", content: prompt }],
  });

  return response.output_text || "";
}