import Link from "next/link";

const featuredTools = [
  {
    slug: "password-generator",
    name: "Password Generator",
    description: "Generate strong and secure passwords instantly.",
  },
  {
    slug: "word-counter",
    name: "Word Counter",
    description: "Count words, characters, and paragraphs quickly.",
  },
  {
    slug: "json-formatter",
    name: "JSON Formatter",
    description: "Format, validate, and minify JSON easily.",
  },
];

const featuredCalculators = [
  {
    slug: "emi-calculator",
    name: "EMI Calculator",
    description: "Calculate monthly loan payments easily.",
  },
  {
    slug: "age-calculator",
    name: "Age Calculator",
    description: "Find your exact age in years, months, and days.",
  },
  {
    slug: "percentage-calculator",
    name: "Percentage Calculator",
    description: "Calculate percentages instantly.",
  },
];

const featuredAITools = [
  {
    slug: "chatgpt",
    name: "ChatGPT",
    description: "AI chatbot for writing, coding, and productivity.",
  },
  {
    slug: "midjourney",
    name: "Midjourney",
    description: "Generate AI images from text prompts.",
  },
  {
    slug: "notion-ai",
    name: "Notion AI",
    description: "AI assistant built into Notion.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 px-6 py-12 text-white">
      <section className="mx-auto max-w-6xl text-center">
        <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl">
          Find powerful tools, calculators, and AI resources instantly
        </h1>

        <p className="mx-auto mb-8 max-w-3xl text-lg text-gray-400">
          QuickFnd is your all-in-one platform for online utilities, useful calculators,
          and AI tools — built to save time and scale into a fully automated resource hub.
        </p>

        <div className="mx-auto mb-12 max-w-2xl rounded-2xl border border-gray-800 bg-gray-900 p-3 shadow-lg">
          <input
            type="text"
            placeholder="Search tools, calculators, or AI resources..."
            className="w-full rounded-xl bg-gray-950 px-4 py-4 text-white outline-none placeholder:text-gray-500"
            readOnly
          />
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Tools</h2>
          <Link href="/tools" className="text-sm text-blue-400 hover:text-blue-300">
            View all tools
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredTools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/tools/${tool.slug}`}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-14 max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Calculators</h2>
          <Link
            href="/calculators"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View all calculators
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredCalculators.map((calculator) => (
            <Link
              key={calculator.slug}
              href={`/calculators/${calculator.slug}`}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{calculator.name}</h3>
              <p className="mt-2 text-gray-400">{calculator.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured AI Tools</h2>
          <Link href="/ai-tools" className="text-sm text-blue-400 hover:text-blue-300">
            View all AI tools
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {featuredAITools.map((tool) => (
            <Link
              key={tool.slug}
              href={`/ai-tools/${tool.slug}`}
              className="block rounded-2xl bg-gray-900 p-6 transition hover:bg-gray-800"
            >
              <h3 className="text-xl font-semibold">{tool.name}</h3>
              <p className="mt-2 text-gray-400">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}