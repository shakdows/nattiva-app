/* Nattiva · service worker mínimo para que el sitio sea instalable.
   Estrategia: red primero, caché como respaldo. Así una versión nueva
   publicada llega siempre; el caché solo sirve si no hay conexión. */
const VERSION = 'nattiva-v2';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // solo recursos propios

  /* El audio y el video se piden por tramos (cabecera Range) y el navegador
     los sabe transmitir mucho mejor por su cuenta. Si el service worker se
     mete, la respuesta llega entera o no llega, y la reproducción se cuelga.
     Además, Cache.put() rechaza una respuesta 206, así que ni siquiera se
     podría guardar. Se deja pasar sin tocar. */
  if (req.headers.has('range') || url.pathname.startsWith('/media/')) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        /* solo se guarda una respuesta completa: un 206 hace fallar a put() */
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/index.html') : undefined)))
  );
});
