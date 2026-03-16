import OpenAI from "openai";

let cachedOpenAI: OpenAI | null = null;

function getOpenAIApiKey() {
  const value = process.env.OPENAI_API_KEY || "";

  if (!value.trim()) {
    throw new Error(
      "OPENAI_API_KEY is missing. Add it in Vercel Project Settings -> Environment Variables."
    );
  }

  return value;
}

export function getOpenAIClient() {
  if (cachedOpenAI) {
    return cachedOpenAI;
  }

  cachedOpenAI = new OpenAI({
    apiKey: getOpenAIApiKey(),
  });

  return cachedOpenAI;
}