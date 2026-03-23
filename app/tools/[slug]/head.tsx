import { getToolBySlug } from "@/lib/data/tools";

export default async function Head({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <>
        <title>Tool Not Found | QuickFnd</title>
        <meta name="description" content="The requested tool could not be found." />
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