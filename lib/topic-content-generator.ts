import { generateTopicPage } from "@/lib/content-engine";

export async function generateTopicContent(topicKey: string, label: string, toolCount = 0, sampleTools: string[] = []) {
  const result = await generateTopicPage({
    topic_key: topicKey,
    topic_label: label,
    tool_count: toolCount,
    sample_tools: sampleTools,
  });

  if (!result.success) {
    return {
      description: `${label} tools help you complete tasks faster and more efficiently online.`,
      faqs: [],
      benefits: [],
      steps: [],
    };
  }

  return {
    description: result.output.description,
    faqs: result.output.faqs,
    benefits: result.output.benefits,
    steps: result.output.how_to_steps,
  };
}