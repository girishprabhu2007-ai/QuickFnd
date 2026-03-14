import Link from "next/link";

const cards = [
  {
    title: "Generate content",
    description:
      "Use AI to generate a tool, calculator, or AI tool draft, then review and save it.",
    href: "/admin/generate",
    cta: "Open generator",
  },
  {
    title: "Manage tools",
    description: "Add, review, and delete tool listings already stored in QuickFnd.",
    href: "/admin/tools",
    cta: "Open tools",
  },
  {
    title: "Manage calculators",
    description:
      "Review current calculator entries and add new items manually when needed.",
    href: "/admin/calculators",
    cta: "Open calculators",
  },
  {
    title: "Manage AI tools",
    description: "Maintain the AI tool directory and keep listings up to date.",
    href: "/admin/ai-tools",
    cta: "Open AI tools",
  },
];

export default function AdminHome() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-800 bg-gray-900 p-6">
        <h2 className="text-2xl font-semibold text-white">Admin dashboard</h2>
        <p className="mt-3 max-w-3xl text-gray-400">
          Welcome to the QuickFnd admin panel. Milestone 1 adds the admin
          automation flow so you can generate database-ready content with AI and
          save it into the existing content tables.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.href}
            className="rounded-2xl border border-gray-800 bg-gray-900 p-6"
          >
            <h3 className="text-xl font-semibold text-white">{card.title}</h3>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              {card.description}
            </p>
            <Link
              href={card.href}
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              {card.cta}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}