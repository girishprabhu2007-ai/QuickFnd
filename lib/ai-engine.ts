import { getOpenAIClient } from "@/lib/openai-server";

type AIConfig = {
  task?: string;
  tone?: string;
  outputType?: string;
  audience?: string;
  length?: string;
  extraInstructions?: string;
};

function buildSystemPrompt(config: AIConfig) {
  const task = String(config.task || "text-generation").toLowerCase();
  const tone = String(config.tone || "professional");
  const audience = String(config.audience || "");
  const length = String(config.length || "");
  const extra = String(config.extraInstructions || "");

  let prompt = "You are a high-quality AI assistant.";

  switch (task) {
    case "rewrite":
      prompt += " Rewrite the user's text clearly while preserving meaning.";
      break;

    case "summarization":
      prompt += " Summarize the user's text clearly and concisely.";
      break;

    case "email":
      prompt += " Write a professional and practical email.";
      break;

    case "outline":
      prompt += " Create a structured outline with headings.";
      break;

    default:
      prompt += " Generate high-quality text output.";
  }

  prompt += ` Use a ${tone} tone.`;

  if (audience) {
    prompt += ` Target audience: ${audience}.`;
  }

  if (length) {
    prompt += ` Output length: ${length}.`;
  }

  if (extra) {
    prompt += ` Additional instructions: ${extra}`;
  }

  return prompt;
}

export async function runAITool(input: string, config: AIConfig) {
  const openai = getOpenAIClient();

  const systemPrompt = buildSystemPrompt(config);

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input },
    ],
  });

  return response.output_text || "";
}