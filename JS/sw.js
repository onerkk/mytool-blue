// ═══ 靜月之光 主站 Service Worker ═══
// JS/HTML → network-first（永遠拿最新）
// 圖片/字型 → cache-first（省流量）
// API → 不攔截
// v59: 20260908audit1 方法核對與提示詞資料修正；v58: 20260906display3 手機靜態背景、選擇器生命週期與啟動順序；原 v57: 20260906 開鑰／時間欄位／塔羅正逆位； 共用選擇器與提示詞資料完整性； 紫微 ROOT-SPEC v2 與動態三方索引；強制清除舊提示詞快取，JS/HTML 維持 network-first + no-cache
// v60: 20260910professional1 逐陣讀法、問題選陣、共用提示詞與合理選品。
// v61: 20260911cards1 Moon Atelier 分享卡與靈籤統一，2x 高清輸出。
// v62: 20260911preview1 分享卡立即載入、預覽錯誤與生命週期修正。
// v63: 20260911atelier1 全站 Moon Atelier 介面、可讀命盤與操作焦點。
// v64: 20260911atelier2 起卦內容分層、合盤閱讀引導與流程核對。
// v65: 20260911celestial1 立體器物視覺、返回導覽及紫微資料保留。
// v66: 20260911ritual1 抽牌狀態隔離、七種儀式及手機抽牌導覽。
// v69: 20260911cinema4 原創角色、WebGL2 場景及逐步填寫流程。
const CACHE_NAME = 'jy-main-v69';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('jy-main-') && k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET' || url.pathname.startsWith('/api/')) return;

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
