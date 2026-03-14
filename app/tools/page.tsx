import Link from "next/link";

const tools = [
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate secure passwords instantly.",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON easily.",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, and paragraphs instantly.",
  },
  {
    slug: "base64-encoder-decoder",
    name: "Base64 Encoder / Decoder",
    description: "Encode or decode text using Base64.",
  },
  {
    slug: "uuid-generator",
    name: "UUID Generator",
    description: "Generate unique UUIDs instantly.",
  },
];

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-4xl font-bold mb-6">Tools</h1>

      <p className="text-gray-400 mb-10">
        Browse powerful online utilities available on QuickFnd.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link
            key={tool.slug}
            href={`/tools/${tool.slug}`}
            className="block rounded-xl bg-gray-900 p-6 transition hover:bg-gray-800"
          >
            <h2 className="text-xl font-semibold">{tool.name}</h2>
            <p className="mt-2 text-gray-400">{tool.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}