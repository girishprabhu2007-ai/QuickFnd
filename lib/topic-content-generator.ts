import { getOpenAIClient } from "@/lib/openai-server";

export type TopicContent = {
  intro: string;
  use_cases: string[];
  faqs: { question: string; answer: string }[];
};

export async function generateTopicContent(label: string): Promise<TopicContent> {
  const openai = getOpenAIClient();

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: `
Return ONLY valid JSON.

Format:
{
  "intro": "string",
  "use_cases": ["string"],
  "faqs": [
    { "question": "string", "answer": "string" }
  ]
}

Rules:
- Write SEO-friendly but natural content
- Keep intro under 80 words
- Use clear, simple English
- FAQs must be useful and real
- No fluff
        `.trim(),
      },
      {
        role: "user",
        content: `Generate content for topic: ${label}`,
      },
    ],
  });

  try {
    const parsed = JSON.parse(response.output_text || "{}");

    return {
      intro: parsed.intro || "",
      use_cases: Array.isArray(parsed.use_cases) ? parsed.use_cases : [],
      faqs: Array.isArray(parsed.faqs) ? parsed.faqs : [],
    };
  } catch {
    return {
      intro: "",
      use_cases: [],
      faqs: [],
    };
  }
}