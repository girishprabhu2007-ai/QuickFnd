import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { generateTopicContent } from "@/lib/topic-content-generator";

type CachedTopicContent = {
  id?: string;
  topic_key: string;
  topic_label: string;
  intro?: string | null;
  description?: string | null;
  use_cases?: string[] | null;
  faqs?: Array<{ question: string; answer: string }> | null;
  benefits?: string[] | null;
  steps?: string[] | null;
  created_at?: string;
  updated_at?: string;
};

export async function getCachedTopicContent(topicKey: string, label: string) {
  const supabase = getSupabaseAdmin();

  const { data: existing } = await supabase
    .from("topic_content_cache")
    .select("*")
    .eq("topic_key", topicKey)
    .maybeSingle();

  if (existing) {
    return existing as CachedTopicContent;
  }

  const generated = await generateTopicContent(topicKey, label);

  const payload: CachedTopicContent = {
    topic_key: topicKey,
    topic_label: label,
    intro:
      typeof generated?.intro === "string"
        ? generated.intro
        : typeof generated?.description === "string"
        ? generated.description
        : "",
    description:
      typeof generated?.description === "string"
        ? generated.description
        : typeof generated?.intro === "string"
        ? generated.intro
        : "",
    use_cases: Array.isArray(generated?.use_cases) ? generated.use_cases : [],
    faqs: Array.isArray(generated?.faqs) ? generated.faqs : [],
    benefits: Array.isArray(generated?.benefits) ? generated.benefits : [],
    steps: Array.isArray(generated?.steps) ? generated.steps : [],
  };

  const { data: inserted } = await supabase
    .from("topic_content_cache")
    .insert(payload)
    .select("*")
    .single();

  return (inserted || payload) as CachedTopicContent;
}