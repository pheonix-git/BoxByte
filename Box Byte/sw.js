const CACHE_NAME = 'type-box-cache-v1';
// Add all the files that make up your game to this list
const urlsToCache = [
  '.', // Use '.' to refer to the current directory
  'index.html',
  'style.css',
  'script.js', // Corrected from game.js
  'fonts/Electrolize-Regular.ttf',
  'icons/icon-192x192.png', // Add app icons to cache
  'icons/icon-512x512.png'
];

// Install the service worker and cache all the app's assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch assets from the cache first, falling back to the network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
