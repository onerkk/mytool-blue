// ═══ 靜月之光 主站 Service Worker ═══
// JS/HTML → network-first（永遠拿最新）
// 圖片/字型 → cache-first（省流量）
// API → 不攔截
const CACHE_NAME = 'jy-main-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API / Worker → 不攔截
  if (url.hostname.includes('workers.dev') ||
      url.hostname.includes('cloudflare') ||
      url.hostname.includes('ecpay') ||
      url.hostname.includes('google')) {
    return;
  }

  // 外部 CDN → 不攔截
  if (url.hostname !== location.hostname) return;

  const path = url.pathname;
  const isJS = path.endsWith('.js');
  const isHTML = path.endsWith('.html') || path === '/' || event.request.mode === 'navigate';
  const isCSS = path.endsWith('.css');

  // JS / HTML / CSS → network-first（永遠拿最新，離線用快取）
  if (isJS || isHTML || isCSS) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 圖片/字型 → cache-first（不常變）
  if (path.match(/\.(png|jpg|jpeg|webp|gif|svg|ico|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
            return response;
          });
        })
    );
    return;
  }

  // 其他 → 正常 fetch
});
