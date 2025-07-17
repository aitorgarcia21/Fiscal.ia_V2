// Service Worker pour Francis PWA
const CACHE_NAME = 'francis-pwa-v1';
const urlsToCache = [
  '/',
  '/chat',
  '/pro-dashboard',
  '/manifest.json',
  '/favicon.svg'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker Francis installé');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache Francis ouvert');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker Francis activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression du cache obsolète:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne la réponse du cache si disponible
        if (response) {
          return response;
        }
        
        // Sinon, récupère depuis le réseau
        return fetch(event.request)
          .then((response) => {
            // Vérification de la validité de la réponse
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone la réponse pour la mettre en cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
  );
});
