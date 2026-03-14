"use client";

import { useEffect, useState } from "react";

type ToolItem = {
  id: number;
  name: string;
  slug: string;
  description: string;
};

export default function AdminTools() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<ToolItem[]>([]);

  async function loadItems() {
    const response = await fetch("/api/admin/list-tools");
    const data = await response.json();
    setItems(data.items || []);
  }

  async function addTool() {
    await fetch("/api/admin/add-tool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, slug, description }),
    });

    setName("");
    setSlug("");
    setDescription("");
    await loadItems();
  }

  async function deleteTool(id: number) {
    await fetch("/api/admin/delete-tool", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    await loadItems();
  }

  useEffect(() => {
    loadItems();
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="max-w-xl">
        <h2 className="mb-6 text-xl font-semibold">Add Tool</h2>

        <input
          className="mb-4 w-full rounded bg-gray-800 p-3"
          placeholder="Tool Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="mb-4 w-full rounded bg-gray-800 p-3"
          placeholder="Slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />

        <textarea
          className="mb-4 w-full rounded bg-gray-800 p-3"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button
          onClick={addTool}
          className="rounded bg-blue-600 px-5 py-3 hover:bg-blue-700"
        >
          Add Tool
        </button>
      </div>

      <div>
        <h2 className="mb-6 text-xl font-semibold">Existing Tools</h2>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start justify-between gap-4 rounded-xl bg-gray-900 p-4"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p className="text-sm text-gray-400">{item.slug}</p>
                <p className="mt-2 text-sm text-gray-300">{item.description}</p>
              </div>

              <button
                onClick={() => deleteTool(item.id)}
                className="rounded bg-red-600 px-3 py-2 text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}