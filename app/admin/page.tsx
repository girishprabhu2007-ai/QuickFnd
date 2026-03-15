import Link from "next/link";

const cards = [
  {
    title: "Generate content",
    description:
      "Create one tool, calculator, or AI tool draft with AI and save it after review.",
    href: "/admin/generate",
    cta: "Open generator",
  },
  {
    title: "Bulk generate",
    description:
      "Generate multiple content items from a single theme, edit them, and save selected entries in one workflow.",
    href: "/admin/bulk-generate",
    cta: "Open bulk generator",
  },
  {
    title: "Manage tools",
    description: "Review, add, and delete tool entries already stored in QuickFnd.",
    href: "/admin/tools",
    cta: "Open tools",
  },
  {
    title: "Manage calculators",
    description: "Review current calculator entries and add new items when needed.",
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
          QuickFnd now supports single-item generation, public detail pages, homepage search,
          and bulk content workflows. Use bulk generation to scale faster while keeping manual review.
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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