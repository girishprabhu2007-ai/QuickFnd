import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/generate", label: "Generate" },
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
    <main className="min-h-screen bg-gray-950 p-6 text-white md:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">QuickFnd Admin</h1>
            <p className="mt-2 text-sm text-gray-400">
              Signed in as {adminUser.email}
            </p>
          </div>

          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="rounded-xl bg-gray-800 px-4 py-2 text-sm font-medium transition hover:bg-gray-700"
            >
              Logout
            </button>
          </form>
        </div>

        <nav className="mb-8 flex flex-wrap gap-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-800 bg-gray-900 px-4 py-2 text-sm text-blue-300 transition hover:border-gray-700 hover:bg-gray-800 hover:text-blue-200"
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