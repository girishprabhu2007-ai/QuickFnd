// QuickFnd Service Worker — v1.0
// Caches static shell + fonts, network-first for API/pages

const CACHE_NAME = "quickfnd-sw-v1";

const PRECACHE_URLS = [
  "/",
  "/tools",
  "/calculators",
  "/ai-tools",
  "/offline",
];

// ─── Install: precache shell ─────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Silently skip if any URL fails (e.g. /offline not built yet)
      });
    })
  );
  self.skipWaiting();
});

// ─── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// ─── Fetch: stale-while-revalidate for pages, cache-first for static ─────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, chrome-extension, and API routes (except /api/og)
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/og")) return;
  // Skip analytics & ad scripts
  if (url.hostname.includes("googlesyndication") || url.hostname.includes("googletagmanager") || url.hostname.includes("google-analytics")) return;

  // Static assets (fonts, images, JS/CSS chunks) — cache-first
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf|png|jpg|jpeg|svg|webp|ico|json)$/) ||
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "fonts.googleapis.com"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages — network-first, fallback to cache
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/offline")))
    );
    return;
  }
});