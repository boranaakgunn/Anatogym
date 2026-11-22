/* Service worker: çevrimdışı çalışma. Siteyi güncelleyince VERSION numarasını artır. */
var VERSION = "anatogym-v3";
var FILES = [
  "./", "index.html", "style.css", "app.js", "manifest.webmanifest",
  "data/config.js", "data/mannequin.bin", "data/core.js", "data/gogus.js", "data/sirt.js", "data/omuz.js",
  "data/kol.js", "data/govde.js", "data/bacak.js", "model.js", "model3d.js",
  "illu.js", "illu-data.js", "illu-data2.js", "illu-data3.js", "illu-data4.js",
  "icons/icon-192.png", "icons/icon-512.png", "icons/icon-maskable-512.png",
  "icons/apple-touch-icon.png", "icons/favicon-32.png"
];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Önce önbellek, arka planda güncelle (stale-while-revalidate) */
self.addEventListener("fetch", function (e) {
  var req = e.request, url = new URL(req.url);
  if (req.method !== "GET") return;
  if (url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return hit || cache.match("index.html"); });
      return hit || net;
    });
  }));
});
