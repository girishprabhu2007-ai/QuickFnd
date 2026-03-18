import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function generateTopicContent(topicKey: string, label: string) {
  const prompt = `
You are generating SEO content for a SOFTWARE TOOLS PLATFORM.

IMPORTANT RULES:
- This is NOT about real-world physical objects
- This is about ONLINE TOOLS, CALCULATORS, and AI utilities
- Never talk about machines, fuel, electricity, hardware

Topic: ${label}

Generate:

1. Short description (2-3 lines)
2. 5 FAQs (software/tool context only)
3. 5 benefits of using online tools
4. 5 how-to steps using tools

Output JSON:
{
  description: "",
  faqs: [{ question: "", answer: "" }],
  benefits: [""],
  steps: [""]
}
`

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  })

  try {
    return JSON.parse(response.choices[0].message.content || "{}")
  } catch {
    return {
      description: `${label} tools help you complete tasks faster and more efficiently.`,
      faqs: [],
      benefits: [],
      steps: [],
    }
  }
}