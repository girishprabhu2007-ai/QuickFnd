import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gray-950 text-white p-10">
      <h1 className="text-3xl font-bold mb-8">QuickFnd Admin</h1>

      <div className="flex gap-6 mb-10">
        <Link href="/admin/tools" className="text-blue-400 hover:text-blue-300">
          Tools
        </Link>

        <Link
          href="/admin/calculators"
          className="text-blue-400 hover:text-blue-300"
        >
          Calculators
        </Link>

        <Link
          href="/admin/ai-tools"
          className="text-blue-400 hover:text-blue-300"
        >
          AI Tools
        </Link>
      </div>

      {children}
    </main>
  );
}