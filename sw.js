const VERSION = 'linye-defteri-pwa-v5.1-github';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './pwa-init.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './ocr/tesseract.min.js',
  './ocr/worker.min.js',
  './ocr/tesseract-core-lstm.wasm.js',
  './ocr/tesseract-core-lstm.wasm',
  './ocr/eng.traineddata'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(VERSION).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const req = event.request;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).then(response => {
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put('./index.html', copy));
        return response;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(response => {
      if (response && response.ok && new URL(req.url).origin === self.location.origin) {
        const copy = response.clone();
        caches.open(VERSION).then(cache => cache.put(req, copy));
      }
      return response;
    }))
  );
});
