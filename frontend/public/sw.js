// Service Worker vide pour éviter les erreurs 404
// Ce fichier est nécessaire car le navigateur essaie de le charger

self.addEventListener('install', function(event) {
  // Installation silencieuse
});

self.addEventListener('activate', function(event) {
  // Activation silencieuse
});

self.addEventListener('fetch', function(event) {
  // Pas de gestion spéciale des requêtes
}); 