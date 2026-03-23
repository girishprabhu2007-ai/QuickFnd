import { getAIToolBySlug } from "@/lib/data/ai-tools";

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getAIToolBySlug(slug);

  if (!tool) {
    return (
      <>
        <title>AI Tool Not Found | QuickFnd</title>
        <meta
          name="description"
          content="The requested AI tool could not be found."
        />
      </>
    );
  }

  return (
    <>
      <title>{tool.name} | QuickFnd</title>
      <meta name="description" content={tool.description} />
    </>
  );
}