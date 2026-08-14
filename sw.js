// Service Worker cho công cụ Phiếu học phí / Phiếu nhận xét - L'espace Art
// Chiến lược: network-first (luôn ưu tiên lấy bản mới nhất khi có mạng),
// tự lưu cache để vẫn dùng được khi mất mạng.

const CACHE_NAME = 'lespace-art-phieu-v1';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './logo.png',
  './qrcode-3.png',
  './favicon.ico',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .catch(() => {}) // không chặn cài đặt nếu 1 file nào đó lỗi
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
