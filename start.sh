#!/bin/bash

# Fonction pour gérer l'arrêt propre
cleanup() {
    echo "Arrêt des services..."
    kill $BACKEND_PID 2>/dev/null
    nginx -s quit 2>/dev/null
    exit 0
}

# Configurer le gestionnaire de signal
trap cleanup SIGTERM SIGINT

# Configurer le port pour Railway
export PORT=${PORT:-3000}

# Démarrer le backend en arrière-plan
echo "Démarrage du backend sur le port 8000..."
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "Attente du démarrage du backend..."
sleep 5

# Vérifier que le backend répond
if ! curl -f http://localhost:8000/health > /dev/null 2>&1; then
    echo "Erreur: Le backend ne répond pas"
    exit 1
fi

echo "Backend démarré avec succès"

# Démarrer nginx au premier plan
echo "Démarrage de nginx sur le port $PORT..."
cd ..

# Remplacer le port dans la configuration nginx
sed -i "s/listen 3000;/listen $PORT;/g" /etc/nginx/nginx.conf

# Démarrer nginx
nginx -g 'daemon off;' &
NGINX_PID=$!

echo "Nginx démarré avec succès"
echo "Application disponible sur le port $PORT"
echo "API disponible sur /api/"

# Attendre l'arrêt
wait 