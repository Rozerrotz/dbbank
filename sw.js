/* Bank DB — service worker (v2)
   Always loads the newest version from the web, clears any old cached copy,
   and only falls back to cache when there is no internet. This prevents the
   app from ever getting "stuck" on an old version after an update. */
const CACHE = 'bankdb-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-store' })   // always fetch the freshest copy
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
