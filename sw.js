/* Simple offline cache for PWA */
const CACHE_NAME = 'bc-pwa-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => (k===CACHE_NAME)?null:caches.delete(k)))).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // Cache-first for same-origin GET
  if (req.method === 'GET' && new URL(req.url).origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then(cached => cached || fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(req, copy));
        return res;
      }).catch(()=>caches.match('./index.html')))
    );
  }
});
