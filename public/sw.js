// FireflyIv Service Worker：静态资源 cache-first，页面 network-first + 离线兜底
const CACHE = "firefly-v1";

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(["/"])).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // 不可变静态资源：cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/covers/") ||
    url.pathname.startsWith("/favicon")
  ) {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // 页面导航：network-first，离线回退缓存
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("/_page_" + url.pathname, copy));
          return res;
        })
        .catch(() =>
          caches.match("/_page_" + url.pathname).then((hit) => hit || caches.match("/"))
        )
    );
  }
});
