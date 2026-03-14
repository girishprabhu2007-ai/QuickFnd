const tools: Record<
  string,
  {
    name: string;
    description: string;
  }
> = {
  "password-generator": {
    name: "Password Generator",
    description:
      "Generate strong and secure passwords instantly for better online safety.",
  },
  "json-formatter": {
    name: "JSON Formatter",
    description: "Format, beautify, and validate JSON quickly and easily.",
  },
  "word-counter": {
    name: "Word Counter",
    description: "Count words, characters, and paragraphs in your text instantly.",
  },
};

export default async function ToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const tool = tools[slug];

  if (!tool) {
    return (
      <main className="min-h-screen bg-gray-950 text-white p-10">
        <h1 className="text-4xl font-bold mb-4">Tool Not Found</h1>
        <p className="text-gray-400">
          The tool you are looking for does not exist.
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
          This is where the actual {tool.name.toLowerCase()} tool interface will
          go.
        </p>
      </div>
    </main>
  );
}