const SHELL_CACHE = 'vibe-shell-v1';
const DATA_CACHE = 'vibe-data-v1';
const PRECACHE_URLS = ['/', '/index.html', '/favicon.svg', '/vibe-logo.svg'];
const API_HOSTS = ['api.open-meteo.com'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (![SHELL_CACHE, DATA_CACHE].includes(key)) {
              return caches.delete(key);
            }
            return undefined;
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }
  const url = new URL(request.url);

  if (API_HOSTS.includes(url.hostname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(DATA_CACHE)
            .then((cache) => cache.put(request, clone))
            .catch(() => {});
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          fetch(request)
            .then((response) => {
              caches.open(SHELL_CACHE).then((cache) => cache.put(request, response.clone()));
            })
            .catch(() => {});
          return cached;
        }
        return fetch(request)
          .then((response) => {
            const clone = response.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, clone));
            return response;
          })
          .catch(() => caches.match('/index.html'));
      }),
    );
  }
});
