// ═══ 靜月之光 Admin Service Worker ═══
// 策略：HTML/API → network-first（永遠拿最新，離線才用快取）
//       靜態資源 → cache-first（icon 等不常變）
// 改這個版號會觸發 SW 更新 → 清舊快取 → 重新快取
const CACHE_NAME = 'jy-admin-v3';
const STATIC_ASSETS = [
  './icon-192.png'
];

// ── Install：快取靜態資源 ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate：清除舊版快取 ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch：依類型選策略 ──
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // API / Worker 請求 → 永遠走網路，不快取
  if (url.hostname.includes('workers.dev') ||
      url.hostname.includes('cloudflare') ||
      url.pathname.startsWith('/admin/') ||
      url.pathname.startsWith('/auth/')) {
    return; // 不攔截，讓瀏覽器正常 fetch
  }

  // 外部 CDN（xlsx.js 等）→ 不攔截
  if (url.hostname.includes('cdnjs.cloudflare.com') ||
      url.hostname.includes('cdn.')) {
    return;
  }

  // HTML 頁面 → network-first（永遠拿最新，離線才用快取）
  if (event.request.mode === 'navigate' ||
      url.pathname.endsWith('.html') ||
      url.pathname === '/' ||
      url.pathname === '/admin' ||
      url.pathname === '/admin/') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // 成功 → 更新快取 + 回傳
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => {
          // 離線 → 從快取拿
          return caches.match(event.request);
        })
    );
    return;
  }

  // 靜態資源（icon 等）→ cache-first
  event.respondWith(
    caches.match(event.request)
      .then(cached => cached || fetch(event.request))
  );
});
