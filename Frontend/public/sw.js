// Brain.2 Service Worker — Cache-first strategy for static assets
const CACHE_NAME = 'brain2-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Install: cache core static assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API calls, cache-first for static assets
self.addEventListener('fetch', (e) => {
  const { request } = e;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests (e.g. Cloudinary, Groq)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // API routes — always go network-first, don't cache
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ success: false, message: 'You are offline' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 503,
        })
      )
    );
    return;
  }

  // Static assets — cache first, then network
  e.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        // Cache new static assets on-the-fly
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
    }).catch(() => {
      // Offline fallback — return index.html for navigation requests
      if (request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});
