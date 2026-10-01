/**
 * Service worker do PWA Conecta+. Rede-primeiro (network-first) pra tudo -
 * o cache só entra em ação quando não há conexão. Evita o problema comum de
 * quem já visitou o site continuar vendo uma versão antiga depois de uma
 * atualização.
 */
const CACHE_VERSION = 'conecta-mais-v20';
const PRECACHE_URLS = [
  'index.html',
  'praticar.html',
  'verificar.html',
  'verificar-rosto.html',
  'historico.html',
  'privacidade.html',
  'css/style.css',
  'js/main.js',
  'js/praticar.js',
  'js/verificar.js',
  'js/verificarRosto.js',
  'js/scamDetector.js',
  'js/siteTour.js',
  'js/changelog-data.js',
  'js/changelog.js',
  'js/historico.js',
  'js/acessibilidade.js',
  'js/atividade.js',
  'assets/scenarios.js',
  'assets/icon-128.png',
  'assets/icon-192.png',
  'assets/icon-512.png',
  'manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_VERSION).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('index.html')))
  );
});
