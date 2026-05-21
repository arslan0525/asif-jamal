// Service Worker v2 - Auto-update without aggressive caching
const CACHE_VERSION = 'v2';

self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing v2...');
  // Force the waiting service worker to become active immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated v2');
  // Take control of all pages immediately
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          // Delete any old caches
          if (cache !== CACHE_VERSION) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Don't intercept - let the browser handle all requests normally
  // This ensures pages always load fresh from the network
  return;
});
