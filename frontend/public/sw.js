<<<<<<< HEAD
// Service Worker pour Francis PWA
const CACHE_NAME = 'francis-pwa-v1';
const urlsToCache = [
  '/',
  '/chat',
  '/pro-dashboard',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192x192.png',
  '/icon-512x512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker Francis installé');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
=======
const CACHE_NAME = 'fiscal-ia-v1.0.0';
const urlsToCache = [
  '/login',
  '/register',
  '/dashboard',
  '/chat',
  '/account',
  '/index.html',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/francis-favicon.svg',
  '/manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// Installation du Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
>>>>>>> 7c8d861ef7da8ecc10302c4493cdab2c4a80d171
        console.log('Cache ouvert');
        return cache.addAll(urlsToCache);
      })
  );
});

<<<<<<< HEAD
// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker Francis activé');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression ancien cache:', cacheName);
=======
// Activation et nettoyage des anciens caches
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName);
>>>>>>> 7c8d861ef7da8ecc10302c4493cdab2c4a80d171
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
<<<<<<< HEAD
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourne la réponse du cache si disponible
        if (response) {
          return response;
        }
        // Sinon, fait la requête réseau
        return fetch(event.request);
      }
    )
  );
});
=======
self.addEventListener('fetch', function(event) {
  // Ne pas mettre en cache la landing page (/) et les pages publiques
  const url = new URL(event.request.url);
  const isPublicPage = url.pathname === '/' || 
                      url.pathname.startsWith('/simulateur') ||
                      url.pathname.startsWith('/optimisation') ||
                      url.pathname.startsWith('/pricing') ||
                      url.pathname.startsWith('/about');
  
  if (isPublicPage) {
    // Pour les pages publiques, toujours aller chercher en réseau
    event.respondWith(fetch(event.request));
    return;
  }

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
    icon: '/francis-favicon.svg',
    badge: '/francis-favicon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir',
        icon: '/francis-favicon.svg'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/francis-favicon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Francis Fiscal', options)
  );
}); 
>>>>>>> 7c8d861ef7da8ecc10302c4493cdab2c4a80d171
