/* Nattiva · service worker mínimo para que el sitio sea instalable.
   Estrategia: red primero, caché como respaldo. Así una versión nueva
   publicada llega siempre; el caché solo sirve si no hay conexión. */
const VERSION = 'nattiva-v4';
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

/* Pantalla de «sin conexión». Antes, si una pagina no cargaba, se servia la
   portada en su lugar: tocabas «Explorador», la red fallaba un instante y
   volvias a caer en el inicio, como si el boton te rebotara. Ahora se dice
   lo que pasa y se ofrece reintentar la MISMA pagina. */
function sinConexion(url) {
  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#150F0D"><title>Sin conexión · Nattiva</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
    background:#150F0D;color:#F3ECE0;font-family:system-ui,-apple-system,sans-serif;padding:24px;box-sizing:border-box}
  .c{max-width:360px;text-align:center}
  .k{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#C9A463}
  h1{font-family:Georgia,serif;font-weight:400;font-size:30px;margin:14px 0 10px}
  p{font-size:14px;line-height:1.6;color:rgba(243,236,224,.72);margin:0 0 26px}
  button,a{display:block;width:100%;box-sizing:border-box;border-radius:100px;padding:15px;
    font-size:13px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;text-decoration:none;cursor:pointer}
  button{background:#CE3A41;color:#fff;border:0;margin-bottom:12px}
  a{color:#F3ECE0;border:1px solid rgba(243,236,224,.3)}
</style></head><body><div class="c">
  <div class="k">Nattiva</div>
  <h1>No hay conexión</h1>
  <p>No se pudo abrir esta página. Revisa tu señal o tu wifi y vuelve a intentarlo.</p>
  <button onclick="location.reload()">Reintentar</button>
  <a href="/">Ir al inicio</a>
</div></body></html>`;
  return new Response(html, { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

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

  const guarda = res => {
    /* solo se guarda una respuesta completa: un 206 hace fallar a put() */
    if (res && res.status === 200 && res.type === 'basic') {
      const copy = res.clone();
      caches.open(VERSION).then(c => c.put(req, copy)).catch(() => {});
    }
    return res;
  };

  /* Navegacion (abrir una pagina): red primero; sin red, la copia guardada
     de ESA pagina; si no hay copia, la pantalla de sin conexion. Nunca otra
     pagina en su lugar. */
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(guarda)
        .catch(() => caches.match(req).then(hit => hit || sinConexion(url)))
    );
    return;
  }

  e.respondWith(
    fetch(req).then(guarda)
      .catch(() => caches.match(req).then(hit => hit || Response.error()))
  );
});
