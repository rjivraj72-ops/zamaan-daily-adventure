/* Offline support for Zamaan's Daily Adventure.
   Pages and code are fetched from the network first (so updates show up right away)
   and fall back to the saved copy when there is no signal. */
const CACHE = "zda-2026-11-01b";
const CORE = [
  "./",
  "index.html",
  "caregiver.html",
  "admin.html",
  "styles.css",
  "polish.css",
  "refresh.css",
  "app.js",
  "question-bank.json",
  "question-generator-prompt.txt",
  "manifest.webmanifest",
  "icons/app-icon-192.png",
  "icons/app-icon-512.png",
  "icons/apple-touch-icon.png",
  "icons/favicon-64.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => Promise.all(CORE.map((url) => cache.add(new Request(url, { cache: "reload" })).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("zda-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (request.headers.has("range") || request.destination === "audio" || request.destination === "video") return;
  if (url.pathname.endsWith("/version.json")) return;

  event.respondWith(
    fetch(request, { cache: "no-cache" })
      .then((response) => {
        if (response && response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then((cached) => {
          if (cached) return cached;
          if (request.mode === "navigate") return caches.match("index.html");
          return new Response("", { status: 504, statusText: "Offline" });
        })
      )
  );
});
