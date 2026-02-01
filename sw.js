/* 靜月之光能量占卜儀 v2.0 - 基礎 Service Worker */
const CACHE_NAME = 'jingyue-v2.0';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      var urls = ['./', './index.html', './css/main.css', './css/ios-fixes.css', './js/main.js', './manifest.json', './images/logo.jpg'];
      return Promise.all(urls.map(function(u) {
        return cache.add(u).catch(function() {});
      }));
    }).then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); }));
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
    })
  );
});
