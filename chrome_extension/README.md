# Extension Chrome « Remplir avec Francis »

Copiez ce dossier tel quel puis « Charger l’extension non empaquetée » dans `chrome://extensions`.

1. Cliquez sur l’icône Francis et collez votre *Bearer token*.
2. Visitez une page contenant un `<form>`.
3. Cliquez sur « Remplir avec Francis » pour injecter automatiquement les données.

Les fichiers principaux :
- manifest.json
- background.js (service worker)
- contentScript.js (injection bouton + autofill)
- popup.html/js/css (configuration token) 