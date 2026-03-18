const CACHE = 'fmas-v1';
const STATIC = [
  '/FMAS/',
  '/FMAS/index.html',
  '/FMAS/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(STATIC).catch(() => {})));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Cache-first for static, network-first for API calls
  if (e.request.url.includes('api.themoviedb.org') ||
      e.request.url.includes('api.openf1.org') ||
      e.request.url.includes('firestore.googleapis.com')) {
    return; // let API calls go through normally
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('/FMAS/')))
  );
});
