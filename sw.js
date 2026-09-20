/* Bank DB — service worker
   Purpose: make the app installable so "Add to Home screen" opens it
   fullscreen (no browser address bar), and let it open without internet.
   Strategy: NETWORK-FIRST — always try the latest from the web, and only
   fall back to the cached copy when offline. This avoids ever getting
   stuck on an old version after an update. */
const CACHE = 'bankdb-v1';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || caches.match('./index.html'))
      )
  );
});
