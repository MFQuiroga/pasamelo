/* PASamelo · service worker: siempre intenta lo más nuevo (red primero) y usa la copia solo sin internet */
const CACHE = 'pasamelo-v6';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{})); });
self.addEventListener('activate', e => e.waitUntil((async () => {
  for(const k of await caches.keys()) if(k !== CACHE) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener('message', e => { if(e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request; if(r.method !== 'GET') return;
  const u = new URL(r.url); if(u.origin !== location.origin) return;   // Google, CDN: directo a la red
  e.respondWith(fetch(r, { cache: 'no-cache' }).then(res => {
    if(res.ok){ const cp = res.clone(); caches.open(CACHE).then(c => c.put(r.mode === 'navigate' ? './index.html' : r, cp)); }
    return res;
  }).catch(() => caches.match(r.mode === 'navigate' ? './index.html' : r).then(m => m || caches.match('./index.html'))));
});
