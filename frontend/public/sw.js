const CACHE_NAME = 'fiscal-ia-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/fiscalia-logo.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation et nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retourner le cache s'il existe
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête réseau
        return fetch(event.request).then(
          function(response) {
            // Vérifier si la réponse est valide
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cloner la réponse
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Gestion des notifications push (pour le futur)
self.addEventListener('push', function(event) {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle notification de Francis',
    icon: '/fiscalia-logo.svg',
    badge: '/fiscalia-logo.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/fiscalia-logo.svg'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/fiscalia-logo.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Francis Fiscal', options)
  );
}); 