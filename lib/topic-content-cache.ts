import { getSupabaseAdmin } from "@/lib/admin-publishing";
import { generateTopicContent } from "@/lib/topic-content-generator";

export async function getCachedTopicContent(topicKey: string, label: string) {
  const supabase = getSupabaseAdmin();

  // 1. check cache
  const { data } = await supabase
    .from("topic_content_cache")
    .select("*")
    .eq("topic_key", topicKey)
    .single();

  if (data) {
    return data;
  }

  // 2. generate if not exists
  const generated = await generateTopicContent(label);

  const { data: inserted } = await supabase
    .from("topic_content_cache")
    .insert({
      topic_key: topicKey,
      topic_label: label,
      intro: generated.intro,
      use_cases: generated.use_cases,
      faqs: generated.faqs,
    })
    .select()
    .single();

  return inserted;
}