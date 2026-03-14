const aiTools: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  chatgpt: {
    name: "ChatGPT",
    description:
      "ChatGPT is an AI chatbot designed for writing, coding, brainstorming, and answering questions.",
  },
  midjourney: {
    name: "Midjourney",
    description:
      "Midjourney is an AI tool that generates stunning images from text prompts.",
  },
  "notion-ai": {
    name: "Notion AI",
    description:
      "Notion AI helps automate writing, summarizing, and productivity tasks inside Notion.",
  },
};

export default async function AIToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = aiTools[slug];

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-10">
        <h1 className="text-4xl font-bold mb-4">AI Tool Not Found</h1>
        <p className="text-gray-400">
          The AI tool you are looking for does not exist.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-4">{tool.name}</h1>
      <p className="text-gray-400 mb-8 max-w-2xl">{tool.description}</p>

      <div className="bg-gray-900 p-6 rounded-xl max-w-3xl">
        <p className="text-lg text-gray-300">
          This is where the full review or listing for {tool.name} will go.
        </p>
      </div>
    </main>
  );
}