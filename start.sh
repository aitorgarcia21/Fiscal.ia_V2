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

# Aller dans le répertoire de l'application
cd /app

# Vérifier que les fichiers existent
if [ ! -f "backend/main.py" ]; then
    echo "Erreur: backend/main.py non trouvé"
    exit 1
fi

# Démarrer le backend en arrière-plan
echo "Démarrage du backend sur le port 8000..."
cd backend

# Ajouter le répertoire backend au PYTHONPATH
export PYTHONPATH="/app/backend:$PYTHONPATH"

# Démarrer uvicorn avec plus de verbosité pour le debug
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --log-level debug &
BACKEND_PID=$!

# Attendre que le backend soit prêt
echo "Attente du démarrage du backend..."
sleep 10

# Vérifier que le processus backend est toujours en cours
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Erreur: Le processus backend s'est arrêté"
    exit 1
fi

# Vérifier que le backend répond
echo "Vérification de la santé du backend..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo "Backend démarré avec succès"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "Erreur: Le backend ne répond pas après 30 tentatives"
        exit 1
    fi
    echo "Tentative $i/30..."
    sleep 2
done

# Démarrer nginx au premier plan
echo "Démarrage de nginx sur le port $PORT..."
cd /app

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