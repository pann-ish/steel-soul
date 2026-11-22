// 钢魂烈斗 offline + auto-update service worker
const VERSION = 'steel-soul-v2.0.0';
const CORE = ['./', './index.html', './all.html', './manifest.webmanifest', './manifest-all.webmanifest',
  './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
const LIBS = ['three.min.js', 'CopyShader.js', 'LuminosityHighPassShader.js', 'GammaCorrectionShader.js', 'EffectComposer.js',
  'RenderPass.js', 'ShaderPass.js', 'UnrealBloomPass.js'];
const CDN = 'https://cdn.jsdelivr.net/npm/three@0.128.0/';

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if (req.method !== 'GET') return;
  const url = req.url;
  // game pages: network first (gets updates when online), cache when offline
  if (req.mode === 'navigate' || url.endsWith('.html') || url.endsWith('/')) {
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  // three.js libraries + icons: cache first (they never change)
  if (url.startsWith(CDN) || CORE.some(p => url.endsWith(p.replace('./', '/')))) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })));
  }
});
