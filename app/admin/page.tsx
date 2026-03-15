import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";

const cards = [
  {
    title: "Generate Content",
    description:
      "Create a single tool, calculator, or AI tool with AI assistance and edit it before saving.",
    href: "/admin/generate",
    cta: "Open generator",
  },
  {
    title: "Bulk Generate",
    description:
      "Generate multiple items at once, review them, adjust engine settings, and save selected entries.",
    href: "/admin/bulk-generate",
    cta: "Open bulk generator",
  },
  {
    title: "Manage Tools",
    description:
      "Review saved tool entries, remove outdated records, and maintain the tools directory.",
    href: "/admin/tools",
    cta: "Manage tools",
  },
  {
    title: "Manage Calculators",
    description:
      "Review calculator entries, remove duplicates, and keep calculator listings clean.",
    href: "/admin/calculators",
    cta: "Manage calculators",
  },
  {
    title: "Manage AI Tools",
    description:
      "Maintain AI tool listings and interactive AI utility pages from one place.",
    href: "/admin/ai-tools",
    cta: "Manage AI tools",
  },
];

export default async function AdminDashboardPage() {
  const adminUser = await getAdminUser();

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-q-border bg-q-card p-6 md:p-8">
        <p className="text-sm uppercase tracking-[0.2em] text-blue-500">
          Admin Dashboard
        </p>
        <h2 className="mt-3 text-3xl font-bold text-q-text md:text-4xl">
          Control the QuickFnd platform
        </h2>
        <p className="mt-4 max-w-3xl text-base leading-7 text-q-muted">
          Use the admin panel to create, edit, organize, and manage tools,
          calculators, and AI tools. Theme switching and responsive layouts are
          now shared across the platform.
        </p>

        {adminUser ? (
          <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-4 text-sm text-q-muted">
            Logged in as <span className="font-medium text-q-text">{adminUser.email}</span>
          </div>
        ) : null}
      </section>

      <section>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-q-border bg-q-card p-6 transition hover:bg-q-card-hover"
            >
              <h3 className="text-xl font-semibold text-q-text">{card.title}</h3>
              <p className="mt-3 text-sm leading-6 text-q-muted">
                {card.description}
              </p>
              <div className="mt-4 text-sm font-medium text-blue-500">
                {card.cta} →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}