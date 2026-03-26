"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

type AuthorStat = {
  id: string;
  name: string;
  slug: string;
  title: string;
  avatar_url: string;
  avatar_color: string;
  avatar_text_color: string;
  avatar_initials: string;
  location: string;
  seed_likes: number;
  post_count: number;
  real_likes_from_posts: number;
  fake_likes: number;
  fake_likes_active: boolean;
  total_displayed_likes: number;
  initialized: boolean;
};

function fmt(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return String(n);
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<AuthorStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFakeLikes, setEditFakeLikes] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadResult, setUploadResult] = useState<Record<string, string>>({});
  const [confirmRemoveAll, setConfirmRemoveAll] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/authors", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setAuthors(data.authors || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function initializeAll() {
    setSeeding(true);
    setSeedResult("");
    try {
      const res = await fetch("/api/admin/authors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setSeedResult(`✓ Initialized ${data.initialized} authors with seed likes`);
      load();
    } catch { setSeedResult("Failed to initialize"); }
    finally { setSeeding(false); }
  }

  async function toggleFakeLikes(author_id: string, current: boolean) {
    await fetch("/api/admin/authors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_id, fake_likes_active: !current }),
    });
    load();
  }

  async function saveFakeLikes(author_id: string) {
    const val = parseInt(editFakeLikes);
    if (isNaN(val) || val < 0) return;
    await fetch("/api/admin/authors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author_id, fake_likes: val }),
    });
    setEditingId(null);
    load();
  }

  async function removeAllFakeLikes() {
    await fetch("/api/admin/authors", { method: "DELETE" });
    setConfirmRemoveAll(false);
    load();
  }

  async function uploadAvatar(authorId: string, file: File) {
    setUploadingId(authorId);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("author_id", authorId);
    try {
      const res = await fetch("/api/admin/authors/upload-avatar", { method: "POST", body: fd });
      const data = await res.json();
      setUploadResult(prev => ({ ...prev, [authorId]: data.success ? `✓ Uploaded` : `✗ ${data.error}` }));
      if (data.success) load();
    } catch { setUploadResult(prev => ({ ...prev, [authorId]: "✗ Upload failed" })); }
    finally { setUploadingId(null); }
  }

  async function removeAuthorFakeLikes(author_id: string) {
    await fetch(`/api/admin/authors?author_id=${author_id}`, { method: "DELETE" });
    load();
  }

  async function seedPostLikes(post_slug: string, author_id: string) {
    await fetch("/api/admin/seed-post-likes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_slug, author_id }),
    });
  }

  const totalFake = authors.reduce((s, a) => s + (a.fake_likes_active ? a.fake_likes : 0), 0);
  const totalReal = authors.reduce((s, a) => s + a.real_likes_from_posts, 0);
  const totalPosts = authors.reduce((s, a) => s + a.post_count, 0);
  const uninit = authors.filter(a => !a.initialized).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-q-text">Authors</h1>
          <p className="mt-1 text-sm text-q-muted">
            {authors.length} authors · {totalPosts} posts · {fmt(totalReal)} real ❤️ · {fmt(totalFake)} seeded ❤️
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a href="/blog/authors" target="_blank" rel="noopener"
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-text hover:bg-q-card-hover transition">
            View Public Page →
          </a>
          <button onClick={load}
            className="rounded-xl border border-q-border bg-q-card px-4 py-2 text-sm font-medium text-q-muted hover:text-q-text transition">
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Initialization + Danger Zone */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Init */}
        <div className="rounded-2xl border border-q-border bg-q-card p-5 space-y-3">
          <h2 className="font-semibold text-q-text">Seed Likes Initialization</h2>
          <p className="text-sm text-q-muted">
            {uninit > 0
              ? `${uninit} authors not yet initialized. Click to seed their fake likes into the database.`
              : "All authors initialized with seed likes. ✓"}
          </p>
          {seedResult && (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">{seedResult}</p>
          )}
          <button onClick={initializeAll} disabled={seeding}
            className="rounded-xl bg-q-primary px-4 py-2 text-sm font-semibold text-white hover:bg-q-primary-hover transition disabled:opacity-60">
            {seeding ? "Initializing..." : uninit > 0 ? `Initialize ${uninit} Authors` : "Re-initialize All"}
          </button>
        </div>

        {/* Danger zone */}
        <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 space-y-3 dark:border-red-500/20 dark:bg-red-500/5">
          <h2 className="font-semibold text-red-700 dark:text-red-400">Danger Zone — Remove Fake Likes</h2>
          <p className="text-sm text-q-muted">
            When your site has genuine traction, remove seeded likes to show only real engagement.
            This cannot be undone easily.
          </p>
          {!confirmRemoveAll ? (
            <button onClick={() => setConfirmRemoveAll(true)}
              className="rounded-xl border border-red-300 bg-transparent px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 transition dark:border-red-500/30 dark:hover:bg-red-500/10">
              Remove ALL Fake Likes
            </button>
          ) : (
            <div className="flex gap-3">
              <button onClick={removeAllFakeLikes}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
                Confirm Remove All
              </button>
              <button onClick={() => setConfirmRemoveAll(false)}
                className="rounded-xl border border-q-border bg-q-bg px-4 py-2 text-sm font-medium text-q-muted hover:text-q-text transition">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* Authors table */}
      <div className="rounded-2xl border border-q-border bg-q-card overflow-hidden">
        <div className="border-b border-q-border px-6 py-4">
          <h2 className="font-semibold text-q-text">Author Statistics & Controls</h2>
        </div>

        {loading ? (
          <div className="px-6 py-8 text-sm text-q-muted">Loading...</div>
        ) : (
          <div className="divide-y divide-q-border">
            {authors.map(author => (
              <div key={author.id} className="px-6 py-5">
                <div className="flex flex-wrap items-start gap-4">
                  {/* Avatar */}
                  <div className="shrink-0">
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      width={48}
                      height={48}
                      className="rounded-full"
                      onError={e => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-q-text">{author.name}</span>
                      <span className="text-xs text-q-muted">{author.title}</span>
                      <span className="text-xs text-q-muted">· {author.location}</span>
                      {!author.initialized && (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                          Not initialized
                        </span>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="mt-2 flex flex-wrap gap-4 text-xs text-q-muted">
                      <span className="flex items-center gap-1">
                        <span className="text-base">📝</span> {author.post_count} posts
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="text-base">❤️</span> {fmt(author.real_likes_from_posts)} real
                      </span>
                      <span className={`flex items-center gap-1 ${author.fake_likes_active ? "text-emerald-600 dark:text-emerald-400" : "text-q-muted line-through"}`}>
                        <span className="text-base">🌱</span> {fmt(author.fake_likes)} seeded
                        {!author.fake_likes_active && " (hidden)"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-q-text">
                        <span className="text-base">👁</span> {fmt(author.total_displayed_likes)} visible
                      </span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {/* Toggle fake likes */}
                    <button
                      onClick={() => toggleFakeLikes(author.id, author.fake_likes_active)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        author.fake_likes_active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "border border-q-border bg-q-bg text-q-muted hover:text-q-text"
                      }`}
                    >
                      {author.fake_likes_active ? "Seeded ON" : "Seeded OFF"}
                    </button>

                    {/* Edit fake likes */}
                    {editingId === author.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={editFakeLikes}
                          onChange={e => setEditFakeLikes(e.target.value)}
                          className="w-24 rounded-lg border border-q-border bg-q-bg px-2 py-1 text-xs text-q-text outline-none focus:border-blue-400/60"
                        />
                        <button onClick={() => saveFakeLikes(author.id)}
                          className="rounded-lg bg-q-primary px-2 py-1 text-xs font-semibold text-white hover:bg-q-primary-hover transition">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="rounded-lg border border-q-border px-2 py-1 text-xs text-q-muted hover:text-q-text transition">
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(author.id); setEditFakeLikes(String(author.fake_likes)); }}
                        className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition"
                      >
                        Edit Seeded
                      </button>
                    )}

                    {/* Remove this author's fake likes */}
                    <button
                      onClick={() => removeAuthorFakeLikes(author.id)}
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-600 hover:bg-red-100 transition dark:border-red-500/20 dark:bg-red-500/5 dark:hover:bg-red-500/10"
                    >
                      Remove Fake
                    </button>

                    {/* Upload real photo */}
                    <label className={`cursor-pointer rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition ${uploadingId === author.id ? "opacity-60" : ""}`}>
                      {uploadingId === author.id ? "Uploading..." : "Upload Photo"}
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                        onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatar(author.id, f); }} />
                    </label>
                    {uploadResult[author.id] && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400">{uploadResult[author.id]}</span>
                    )}

                    {/* View author page */}
                    <a href={`/blog/authors/${author.slug}`} target="_blank" rel="noopener"
                      className="rounded-lg border border-q-border bg-q-bg px-3 py-1.5 text-xs text-q-muted hover:text-q-text transition">
                      View →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}