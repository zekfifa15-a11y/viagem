// Manual de Bordo — Istambul · service worker
const CACHE = 'manual-istambul-02afc3a3';
const ASSETS = [
  "./",
  "index.html",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png",
  "fonts/jetbrains-mono-latin-500-normal.woff2",
  "fonts/jetbrains-mono-latin-600-normal.woff2",
  "fonts/jetbrains-mono-latin-ext-500-normal.woff2",
  "fonts/jetbrains-mono-latin-ext-600-normal.woff2",
  "fonts/montserrat-latin-400-normal.woff2",
  "fonts/montserrat-latin-500-normal.woff2",
  "fonts/montserrat-latin-600-normal.woff2",
  "fonts/montserrat-latin-700-normal.woff2",
  "fonts/montserrat-latin-800-normal.woff2",
  "fonts/montserrat-latin-ext-400-normal.woff2",
  "fonts/montserrat-latin-ext-500-normal.woff2",
  "fonts/montserrat-latin-ext-600-normal.woff2",
  "fonts/montserrat-latin-ext-700-normal.woff2",
  "fonts/montserrat-latin-ext-800-normal.woff2"
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('manual-istambul-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Sempre responde do cache primeiro (funciona offline).
// Se houver internet, busca uma cópia nova em segundo plano para a próxima abertura.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isPage = req.mode === 'navigate';
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const key = isPage ? 'index.html' : req;
      const cached = await cache.match(key, { ignoreSearch: true });
      const network = fetch(req).then(res => {
        if (res && res.ok) cache.put(key, res.clone());
        return res;
      }).catch(() => null);
      if (cached) { e.waitUntil(network); return cached; }
      const res = await network;
      return res || (isPage ? cache.match('index.html') : new Response('', { status: 504 }));
    })
  );
});
