/* offline cache for this trip only: its scope is this folder */
const P = 'family-trips-2026-11-miyako-', V = P + 'v20261008033639', FONTS = P + 'fonts';
const SCOPE = self.registration.scope;
const CORE = ['./', './index.html', './app.bin', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './favicon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {   // only this trip's own older versions are removed
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(P + 'v') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function netFirst(req, cacheKey) {
  return new Promise(resolve => {
    let done = false;
    const fromCache = () => caches.open(V).then(c => c.match(cacheKey, {ignoreSearch: true}));
    const timer = setTimeout(() => fromCache().then(r => { if (r && !done) { done = true; resolve(r); } }), 4000);
    fetch(req, {cache: 'no-cache'}).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(V).then(c => c.put(cacheKey, copy)); }
      clearTimeout(timer); if (!done) { done = true; resolve(res); }
    }).catch(() => {
      clearTimeout(timer);
      fromCache().then(r => { if (!done) { done = true; resolve(r || new Response('offline', {status: 503})); } });
    });
  });
}
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.href.startsWith(SCOPE)) {
    e.respondWith(netFirst(req, req.mode === 'navigate' ? new URL('./index.html', SCOPE).href : req));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(FONTS).then(c => c.match(req).then(hit => hit || fetch(req).then(res => { if (res.ok || res.type === 'opaque') c.put(req, res.clone()); return res; }))));
  }
});
