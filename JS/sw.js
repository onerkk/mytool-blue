// ═══ 靜月之光 主站 Service Worker ═══
// JS/HTML → network-first（永遠拿最新）
// 圖片/字型 → cache-first（省流量）
// API → 不攔截
// v51: bump 版本號強制清舊快取（用戶不需手動清）+ JS/HTML 加 no-cache header 繞過瀏覽器 HTTP cache
const CACHE_NAME = 'jy-main-v51';

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
  // v51：用 Request + cache:'no-cache' 繞過 Chrome HTTP cache，確保真的打到 server
  //   原本只有 SW 層 network-first，但 Chrome 瀏覽器自己的 HTTP cache 會攔在 SW 前面，
  //   GitHub Pages 預設 max-age=600，10 分鐘內根本拿不到新版。加 cache:'no-cache' 強制 revalidate。
  if (isJS || isHTML || isCSS) {
    const freshReq = new Request(event.request.url, {
      method: event.request.method,
      headers: event.request.headers,
      mode: event.request.mode === 'navigate' ? 'same-origin' : event.request.mode,
      credentials: event.request.credentials,
      cache: 'no-cache'
    });
    event.respondWith(
      fetch(freshReq)
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
