// =====================================================================
//  Service worker : fonctionnement hors ligne + notifications push
//  ⚠ Après chaque modification des fichiers, augmentez VERSION.
// =====================================================================
const VERSION = 'scierie-v8';
const CDN_CACHE = 'scierie-cdn-v1';
const SHELL = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './badge-96.png', './fond.jpg'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== CDN_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

// Fichiers de l'application : réseau d'abord (toujours à jour), cache si pas de réseau
async function networkFirst(req) {
  const cache = await caches.open(VERSION);
  const net = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; });
  net.catch(() => {});
  try {
    return await Promise.race([net, new Promise((_, rej) => setTimeout(() => rej(new Error('lent')), 3500))]);
  } catch {
    const hit = (await cache.match(req, { ignoreSearch: true })) ||
      (req.mode === 'navigate' ? await cache.match('./index.html') : null);
    return hit || net;
  }
}

// Bibliothèques et polices : cache d'abord
async function cacheFirst(req) {
  const cache = await caches.open(CDN_CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') cache.put(req, res.clone());
  return res;
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) { e.respondWith(networkFirst(req)); return; }
  if (/(^|\.)cdn\.jsdelivr\.net$|^fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {
    e.respondWith(cacheFirst(req));
  }
  // Tout le reste (Supabase) passe directement par le réseau
});

self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || '🔔 Nouvelle vente', {
    body: d.body || '',
    tag: d.tag,
    renotify: Boolean(d.tag),
    icon: 'icon-192.png',
    badge: 'badge-96.png',
    data: { url: d.url || '#/notifications' },
  }));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const hash = e.notification.data?.url || '#/';
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const w = wins.find((c) => c.url.startsWith(self.registration.scope));
    if (w) {
      try { await w.focus(); } catch { /* ignoré */ }
      w.postMessage({ type: 'open', hash });
      return;
    }
    await self.clients.openWindow(`${self.registration.scope}${hash}`);
  })());
});
