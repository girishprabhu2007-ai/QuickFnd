"use client";

import { useState } from "react";

export default function AdminCalculators() {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");

  async function addCalculator() {
    await fetch("/api/admin/add-calculator", {
      method: "POST",
      body: JSON.stringify({ name, slug, description }),
    });

    setName("");
    setSlug("");
    setDescription("");
    alert("Calculator added");
  }

  return (
    <div className="max-w-xl">

      <h2 className="text-xl font-semibold mb-6">Add Calculator</h2>

      <input
        className="w-full bg-gray-800 p-3 rounded mb-4"
        placeholder="Calculator Name"
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
        onClick={addCalculator}
        className="bg-blue-600 px-5 py-3 rounded hover:bg-blue-700"
      >
        Add Calculator
      </button>

    </div>
  );
}