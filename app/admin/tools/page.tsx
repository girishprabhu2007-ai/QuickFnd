import DeleteItemButton from "@/components/admin/DeleteItemButton";
import { supabaseAdmin } from "@/lib/admin-publishing";

export const revalidate = 0;

export default async function AdminToolsPage() {
  const { data, error } = await supabaseAdmin
    .from("tools")
    .select("name,slug,description,engine_type")
    .order("name", { ascending: true });

  if (error) {
    return (
      <section className="rounded-2xl border border-q-border bg-q-card p-6">
        <h2 className="text-2xl font-semibold text-q-text">Manage Tools</h2>
        <p className="mt-4 text-red-600">{error.message}</p>
      </section>
    );
  }

  const items = data || [];

  return (
    <section className="rounded-2xl border border-q-border bg-q-card p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-q-text">Manage Tools</h2>
      <p className="mt-3 text-sm leading-7 text-q-muted md:text-base">
        Review saved tool entries and remove outdated records.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-q-border bg-q-bg p-6 text-q-muted">
          No tools found.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.slug}
              className="rounded-2xl border border-q-border bg-q-bg p-6"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-q-text">{item.name}</h3>
                  <div className="mt-2 text-sm text-q-muted">{item.slug}</div>
                  <div className="mt-2 text-sm text-q-muted">
                    Engine: {item.engine_type || "auto"}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-q-muted">
                    {item.description}
                  </p>
                </div>

                <DeleteItemButton slug={item.slug} category="tool" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}