"use client";

import { useState } from "react";

export default function AdminAITools() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  async function addAITool() {
    await fetch("/api/admin/add-ai-tool", {
      method: "POST",
      body: JSON.stringify({ name, slug, description }),
    });

    setName("");
    setSlug("");
    setDescription("");
    alert("AI Tool added");
  }

  return (
    <div className="max-w-xl">

      <h2 className="text-xl font-semibold mb-6">Add AI Tool</h2>

      <input
        className="w-full bg-gray-800 p-3 rounded mb-4"
        placeholder="Tool Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="w-full bg-gray-800 p-3 rounded mb-4"
        placeholder="Slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
      />

      <textarea
        className="w-full bg-gray-800 p-3 rounded mb-4"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button
        onClick={addAITool}
        className="bg-blue-600 px-5 py-3 rounded hover:bg-blue-700"
      >
        Add AI Tool
      </button>

    </div>
  );
}