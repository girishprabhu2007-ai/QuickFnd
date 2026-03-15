import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";
import ThemeToggle from "@/components/theme/ThemeToggle";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/generate", label: "Generate" },
  { href: "/admin/bulk-generate", label: "Bulk Generate" },
  { href: "/admin/tools", label: "Tools" },
  { href: "/admin/calculators", label: "Calculators" },
  { href: "/admin/ai-tools", label: "AI Tools" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminUser = await getAdminUser();

  if (!adminUser) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-screen bg-q-bg p-4 text-q-text sm:p-6 md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-q-border bg-q-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">QuickFnd Admin</h1>
              <p className="mt-2 text-sm text-q-muted">
                Signed in as {adminUser.email}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <ThemeToggle />
              <form action="/api/admin/logout" method="post">
                <button
                  type="submit"
                  className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text transition hover:bg-q-card-hover"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm text-blue-500 transition hover:bg-q-card-hover"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
    </main>
  );
}