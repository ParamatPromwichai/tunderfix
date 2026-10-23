/* global self, caches */
// Cache only this explicit public offline shell. APIs, HTML dashboards, RSC,
// chat, location, avatar requests and form submissions always use the network.
const CACHE_PREFIX = "thunderfix-pwa-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const OFFLINE_PAGE = "/offline.html";
const PUBLIC_SHELL = [
  OFFLINE_PAGE,
  "/pwa/offline.js",
  "/icons/thunderfix.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PUBLIC_SHELL)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter(
            (name) => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME,
          )
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// Updates activate only after the user chooses to reload; preserve open forms.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") event.waitUntil(self.skipWaiting());
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || request.headers.has("RSC")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cached = await caches.match(OFFLINE_PAGE, {
          cacheName: CACHE_NAME,
        });
        return (
          cached ||
          new Response(
            '<!doctype html><html lang="th"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ThunderFix · ออฟไลน์</title><p>กรุณาเชื่อมต่ออินเทอร์เน็ต แล้วเปิด ThunderFix อีกครั้ง</p></html>',
            {
              status: 503,
              headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store",
              },
            },
          )
        );
      }),
    );
    return;
  }
  if (PUBLIC_SHELL.includes(url.pathname) && !url.search) {
    event.respondWith(
      caches
        .match(request, { cacheName: CACHE_NAME })
        .then((cached) => cached || fetch(request)),
    );
  }
});
